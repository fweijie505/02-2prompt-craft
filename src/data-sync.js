import { supabase } from './supabase';

// 固定的用户ID — 所有设备共享同一份数据
export function getUserId() {
  return 'user-promptcraft-shared';
}

// 列名映射：JS camelCase → DB snake_case
const COL_MAP = {
  prompts_data: { folderId: 'folder_id', sortKey: 'sort_key' },
  folders_data: { isOpen: 'is_open' },
  favorites_data: { promptId: 'prompt_id', favFolderId: 'fav_folder_id' },
  fav_folders_data: {},
  images_data: { promptId: 'prompt_id', sortOrder: 'sort_order' },
};

// 反向映射：DB snake_case → JS camelCase
const REVERSE_COL_MAP = {};
for (const [table, mappings] of Object.entries(COL_MAP)) {
  REVERSE_COL_MAP[table] = {};
  for (const [camel, snake] of Object.entries(mappings)) {
    REVERSE_COL_MAP[table][snake] = camel;
  }
}

// 通用：从 Supabase 加载数据
export async function loadData(table, userId, fallback) {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('[loadData] ERROR table=', table, 'msg=', error.message);
      return fallback;
    }

    if (data && data.length > 0) {
      const revMap = REVERSE_COL_MAP[table] || {};
      return data.map(row => {
        const clean = {};
        for (const [key, val] of Object.entries(row)) {
          if (key === 'user_id' || key === 'created_at' || key === 'updated_at') continue;
          clean[revMap[key] || key] = val;
        }
        return clean;
      });
    }
    return fallback;
  } catch (err) {
    console.error('[loadData] FAILED table=', table, 'msg=', err.message);
    return fallback;
  }
}

// 通用：保存整个数据集到 Supabase（使用 Upsert：存在则更新，不存在则插入）
// mode: 'sync'（日常同步，增量更新+删除） | 'replace'（导入/重置，先清空再插入）
export async function saveFullTable(table, userId, items, mode) {
  try {
    const colMap = COL_MAP[table] || {};
    const safeItems = items || [];
    const m = mode || 'sync';

    if (safeItems.length === 0) {
      // 如果 state 为空，只清空该用户的旧数据
      const { error: delErr } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId);
      if (delErr) {
        console.error('[saveFullTable] clear error:', delErr);
        throw delErr;
      }
      return;
    }

    if (m === 'replace') {
      // 导入场景：先清空该用户的所有旧数据，再批量插入新数据
      const { error: delErr } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId);
      if (delErr) {
        console.error('[saveFullTable] replace delete error:', delErr);
        throw delErr;
      }
      // 然后直接 upsert 新数据（此时库里没有旧数据了，upsert 等价于 insert）
    } else {
      // 日常同步场景：先找出需要删除的旧记录
      const idsInState = new Set(safeItems.map(item => String(item.id)));

      const { data: existing, error: fetchErr } = await supabase
        .from(table)
        .select('id')
        .eq('user_id', userId);
      if (fetchErr) {
        console.error('[saveFullTable] fetch existing error:', fetchErr);
        throw fetchErr;
      }

      if (existing) {
        const toDelete = existing
          .filter(row => !idsInState.has(String(row.id)))
          .map(row => row.id);
        if (toDelete.length > 0) {
          const { error: delErr } = await supabase
            .from(table)
            .delete()
            .in('id', toDelete);
          if (delErr) {
            console.error('[saveFullTable] delete stale error:', delErr);
            throw delErr;
          }
        }
      }
    }

    // 分批 Upsert（每次最多 500 条，避免超出 Supabase 限制）
    const BATCH_SIZE = 500;
    for (let i = 0; i < safeItems.length; i += BATCH_SIZE) {
      const batch = safeItems.slice(i, i + BATCH_SIZE);
      const rows = batch.map(item => {
        const row = { user_id: userId };
        for (const [key, val] of Object.entries(item)) {
          row[colMap[key] || key] = val;
        }
        row.id = item.id;
        return row;
      });

      const { error: upsertErr } = await supabase
        .from(table)
        .upsert(rows, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (upsertErr) {
        console.error('[saveFullTable] upsert error at batch', i, ':', upsertErr);
        throw upsertErr;
      }
    }
  } catch (err) {
    console.error('[saveFullTable] FAILED table=', table, 'msg=', err.message, 'details=', err);
    throw err;
  }
}

// 导出为 JSON 的格式转换
export function exportData(folders, prompts, favFolders, favorites) {
  return {
    version: 'supabase-v1',
    folders,
    prompts,
    favFolders,
    favorites,
    exportedAt: new Date().toISOString()
  };
}

// 导入 JSON 的格式转换
export function importData(json) {
  if (json.version === 'supabase-v1') {
    return {
      folders: json.folders || [],
      prompts: json.prompts || [],
      favFolders: json.favFolders || [],
      favorites: json.favorites || []
    };
  }
  if (json.folders && json.prompts) {
    return {
      folders: json.folders,
      prompts: json.prompts,
      favFolders: json.favFolders || [],
      favorites: json.favorites || []
    };
  }
  return null;
}
