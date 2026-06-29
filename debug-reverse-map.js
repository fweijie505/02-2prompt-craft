import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ryydiqbaxlctcjmujcgi.supabase.co',
  'sb_publishable_sPe8qw3kndeY1eADJA0gaw_Yu9-RGwN'
);

// 反向映射：DB snake_case → JS camelCase
const COL_MAP = {
  prompts_data: { folderId: 'folder_id', sortKey: 'sort_key' },
  folders_data: { isOpen: 'is_open' },
  favorites_data: { promptId: 'prompt_id', favFolderId: 'fav_folder_id' },
  fav_folders_data: {},
  images_data: { promptId: 'prompt_id', sortOrder: 'sort_order' },
};

const REVERSE_COL_MAP = {};
for (const [table, mappings] of Object.entries(COL_MAP)) {
  REVERSE_COL_MAP[table] = {};
  for (const [camel, snake] of Object.entries(mappings)) {
    REVERSE_COL_MAP[table][snake] = camel;
  }
}

async function simulateLoadData() {
  const uid = 'user-promptcraft-shared';

  const { data: rawFolders } = await supabase
    .from('folders_data').select('*').eq('user_id', uid).order('created_at', { ascending: false });

  const { data: rawPrompts } = await supabase
    .from('prompts_data').select('*').eq('user_id', uid).order('created_at', { ascending: false });

  // Apply reverse mapping (same as loadData)
  const revFolders = REVERSE_COL_MAP['folders_data'] || {};
  const folders = (rawFolders || []).map(row => {
    const clean = {};
    for (const [key, val] of Object.entries(row)) {
      if (key === 'user_id' || key === 'created_at' || key === 'updated_at') continue;
      clean[revFolders[key] || key] = val;
    }
    return clean;
  });

  const revPrompts = REVERSE_COL_MAP['prompts_data'] || {};
  const prompts = (rawPrompts || []).map(row => {
    const clean = {};
    for (const [key, val] of Object.entries(row)) {
      if (key === 'user_id' || key === 'created_at' || key === 'updated_at') continue;
      clean[revPrompts[key] || key] = val;
    }
    return clean;
  });

  console.log('=== After reverse mapping ===');
  console.log('Folders:', folders.map(f => ({ id: f.id, name: f.name })));
  console.log('Prompts:', prompts.map(p => ({ id: p.id, title: p.title, folderId: p.folderId })));

  // Now test the filter logic
  const validFolderIds = new Set(folders.map(f => f.id));
  console.log('\nValid folder IDs:', [...validFolderIds]);

  const filtered = prompts.filter(p => validFolderIds.has(p.folderId));
  console.log('\nFiltered prompts (valid folder refs):', filtered.length);
  for (const p of filtered) {
    console.log('  ', p.title, '-> folderId:', p.folderId);
  }

  // Find first folder with prompts
  const folderWithPrompts = new Set(filtered.map(p => p.folderId));
  const validFolders = folders.filter(f => folderWithPrompts.has(f.id));
  const firstFolder = validFolders.length > 0 ? validFolders[0] : null;
  console.log('\nFirst folder with prompts:', firstFolder ? firstFolder.name + ' (' + firstFolder.id + ')' : 'NONE');
}

simulateLoadData().catch(console.error);
