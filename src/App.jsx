import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { supabase } from './supabase';
import { getUserId, loadData, saveFullTable, exportData, importData } from './data-sync';

console.log('[App.jsx TOP] Module loaded, getUserId=', typeof getUserId, 'supabase=', !!supabase);

export default function PromptManager() {
  console.log('[App.jsx] Component rendering, userId=', getUserId());
  const userId = getUserId();

  // 加载标志：用于判断是否已从 Supabase 加载过数据
  const [isLoading, setIsLoading] = useState(true);

  // ----------------------------------------------------
  // 1. 10套精美主题矩阵
  // ----------------------------------------------------
  const [themes] = useState([
    { id: 't-dark-space', name: '🌌 赛博深空', bg: 'bg-slate-900', text: 'text-slate-100', border: 'border-slate-800', panel: 'bg-slate-950/60', active: 'bg-blue-600/20 text-blue-400 border-blue-500/20', accent: 'bg-blue-600 hover:bg-blue-500', listBg: 'bg-slate-900/40', inputBg: 'bg-slate-950', borderPure: '#1e293b' },
    { id: 't-matrix', name: '🎚️ 黑客帝国', bg: 'bg-zinc-950', text: 'text-emerald-400', border: 'border-emerald-950', panel: 'bg-black/80', active: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30', accent: 'bg-emerald-700 hover:bg-emerald-600 text-black font-bold', listBg: 'bg-zinc-900/30', inputBg: 'bg-black', borderPure: '#064e3b' },
    { id: 't-obsidian', name: '📝 Obsidian极客', bg: 'bg-stone-900', text: 'text-stone-200', border: 'border-stone-800', panel: 'bg-stone-950', active: 'bg-purple-900/20 text-purple-400 border-purple-500/20', accent: 'bg-purple-700 hover:bg-purple-600', listBg: 'bg-stone-900/50', inputBg: 'bg-stone-950', borderPure: '#292524' },
    { id: 't-walnut', name: '🪵 胡桃木书屋', bg: 'bg-amber-950/20', text: 'text-amber-100', border: 'border-amber-900/30', panel: 'bg-amber-950/40', active: 'bg-amber-800/30 text-amber-400 border-amber-600/30', accent: 'bg-amber-700 hover:bg-amber-600', listBg: 'bg-amber-950/10', inputBg: 'bg-amber-950/60', borderPure: '#451a03' },
    { id: 't-deepsea', name: '🌊 深海潜航', bg: 'bg-cyan-950', text: 'text-cyan-100', border: 'border-cyan-900', panel: 'bg-slate-950/80', active: 'bg-cyan-800/40 text-cyan-400 border-cyan-500/30', accent: 'bg-cyan-600 hover:bg-cyan-500', listBg: 'bg-cyan-950/40', inputBg: 'bg-slate-950', borderPure: '#164e63' },
    { id: 't-aurora', name: '🌸 暮色极光', bg: 'bg-zinc-900', text: 'text-zinc-100', border: 'border-pink-950/40', panel: 'bg-gradient-to-b from-indigo-950/50 to-pink-950/30', active: 'bg-pink-500/10 text-pink-400 border-pink-500/20', accent: 'bg-pink-600 hover:bg-pink-500', listBg: 'bg-zinc-900/40', inputBg: 'bg-zinc-950', borderPure: '#500724' },
    { id: 't-cyberpunk', name: '🧠 赛博霓虹', bg: 'bg-slate-950', text: 'text-cyan-400', border: 'border-fuchsia-900/40', panel: 'bg-black/60', active: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30', accent: 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white', listBg: 'bg-slate-900/20', inputBg: 'bg-black', borderPure: '#701a75' },
    { id: 't-absolute-black', name: '🌑 绝对零度', bg: 'bg-black', text: 'text-zinc-300', border: 'border-zinc-800', panel: 'bg-zinc-950', active: 'bg-zinc-800 text-white border-zinc-700', accent: 'bg-zinc-100 hover:bg-white text-black font-semibold', listBg: 'bg-black', inputBg: 'bg-black', borderPure: '#27272a' },
    { id: 't-light-white', name: '🤍 极简白纸', bg: 'bg-white', text: 'text-stone-800', border: 'border-stone-200', panel: 'bg-stone-50', active: 'bg-blue-50 text-blue-600 border-blue-200 font-semibold', accent: 'bg-stone-900 hover:bg-stone-800 text-white', listBg: 'bg-stone-100/40', inputBg: 'bg-white', borderPure: '#e7e5e4' },
    { id: 't-latte', name: '☕ 燕麦拿铁', bg: 'bg-orange-50/60', text: 'text-amber-950', border: 'border-orange-200/60', panel: 'bg-amber-100/40', active: 'bg-amber-200/50 text-amber-900 border-amber-300/60 font-medium', accent: 'bg-amber-800 hover:bg-amber-700 text-white', listBg: 'bg-orange-50/20', inputBg: 'bg-white', borderPure: '#fed7aa' }
  ]);

  const iconCategories = [
    { id: 'cat-scifi', name: '🌌 科幻未来', icons: ['🤖', '🦾', '🦿', '🛸', '🛰️', '🚀', '🧠', '🧬', '⚛️', '🪐', '💻', '🎛️', '⚙️', '🔋', '📡', '🕹️', '📟', '🕶️', '💥', '🌋', '☄️'] },
    { id: 'cat-fantasy', name: '🔮 魔法奇幻', icons: ['🐉', '👹', '👺', '👻', '💀', '👽', '🦄', '🦅', '🐺', '🦊', '🦉', '🕷️', '🔥', '❄️', '⚡', '💧', '🌲', '⛩️', '🏰', '🗺️', '⚔️', '🏹', '🛡️'] },
    { id: 'cat-director', name: '🎬 分镜叙事', icons: ['🎥', '📸', '📹', '📽️', '🎞️', '🎭', '🎤', '📣', '⏱️', '📝', '📜', '📖', '📐', '🔍', '📌', '🔒', '👁️', '👤', '👥', '🗣️', '👣'] },
    { id: 'cat-art', name: '🎨 艺术风格', icons: ['✨', '💎', '👑', '🌈', '🎨', '🖌️', '🖍️', '✏️', '🖼️', '🏮', '🗿', '🔮', '🃏', '⚜️', '🔱', '💮', '🍁', '🌜', '🌞', '🕯️', '🧿'] }
  ];

  const [activeIconCat, setActiveIconCat] = useState('cat-scifi');
  const [currentThemeId, setCurrentThemeId] = useState(() => localStorage.getItem('pc_theme') || 't-dark-space');
  const currentTheme = themes.find(t => t.id === currentThemeId) || themes[0];

  // ----------------------------------------------------
  // 数据初始化：优先从 Supabase 加载，失败则用本地 fallback
  // ----------------------------------------------------
  const initialFolders = [{
    id: 'f-root-1', name: '视觉风格库', icon: '🎨', isOpen: true, children: [
      { id: 'f-sub-1', name: 'Atompunk 复古', icon: '🤖', children: [] },
      { id: 'f-sub-2', name: 'Hajime Sorayama 铬金', icon: '✨', children: [] }
    ]
  }];

  const initialPrompts = [
    { id: 'p-1', folderId: 'f-sub-2', title: '仿生人 chrome 皮肤质感', content: 'A high-gloss metallic chrome android robot, futuristic clothing, hyper-realistic, Hajime Sorayama style --ar 16:9', reference: '参考示例：\nHajime Sorayama 风格以高光泽金属质感和未来主义人体美学著称，可参考其《Sexy Robot》系列中的铬金反射效果。', tags: ['Atompunk', 'Chrome'], stars: 4, sortKey: 1, images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400'] }
  ];

  const initialFavFolders = [{ id: 'fav-root', name: '默认收藏', icon: '📌', children: [] }];

  const [folders, setFolders] = useState(initialFolders);
  const [prompts, setPrompts] = useState(initialPrompts);
  const [favFolders, setFavFolders] = useState(initialFavFolders);
  const [favorites, setFavorites] = useState([]);
  const [imgBedConfig, setImgBedConfig] = useState({ provider: 'imgbb', apiKey: '' });
  const [panelWidths, setPanelWidths] = useState({ folder: 300, list: 280, scratchpad: 260 });
  const [promptSplitRatio, setPromptSplitRatio] = useState(0.58);
  const [contentImageRatio, setContentImageRatio] = useState(0.4);
  const [hoveredFolderId, setHoveredFolderId] = useState(null);
  const [currentFolder, setCurrentFolder] = useState(() => {
    // 初始选中第一个非空子文件夹
    const root = initialFolders[0];
    return root && root.children && root.children.length > 0 ? root.children[0].id : 'f-sub-2';
  });
  const [currentPromptId, setCurrentPromptId] = useState('p-1');
  const [isEditMode, setIsEditMode] = useState(false);
  const [scratchpadText, setScratchpadText] = useState('');
  const [copyStatus, setCopyStatus] = useState('复制到剪贴板');
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavPicker, setShowFavPicker] = useState(false);
  const [showFavManager, setShowFavManager] = useState(false);
  const [currentFavFolder, setCurrentFavFolder] = useState('fav-root');
  const [favFolderModal, setFavFolderModal] = useState({ isOpen: false, parentId: null, value: '' });
  const [showSettings, setShowSettings] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [lightbox, setLightbox] = useState({ isOpen: false, images: [], index: 0 });
  const [lbTransform, setLbTransform] = useState({ scale: 1, x: 0, y: 0 });
  const lbPanRef = useRef(null);
  const lbDidDrag = useRef(false);
  const lbSuppressClick = useRef(false);
  const [isFolderCollapsed, setIsFolderCollapsed] = useState(false);
  const [isFavPanelCollapsed, setIsFavPanelCollapsed] = useState(false);
  const [isScratchpadCollapsed, setIsScratchpadCollapsed] = useState(false);
  const [folderFavSplitRatio, setFolderFavSplitRatio] = useState(0.58);
  const [copyPromptStatus, setCopyPromptStatus] = useState('📋 复制提示词');
  const [selectedPromptIds, setSelectedPromptIds] = useState([]);
  const [showMovePicker, setShowMovePicker] = useState(false);
  const [moveMode, setMoveMode] = useState('single');
  const [listSource, setListSource] = useState('folder'); // 'folder' | 'favorites' | 'stars'
  const [starFilter, setStarFilter] = useState(0); // 0=all starred, 1-5=specific
  const [favStarsSplitRatio, setFavStarsSplitRatio] = useState(0.55);
  const [isStarPanelCollapsed, setIsStarPanelCollapsed] = useState(false);

  const [draggedImgIndex, setDraggedImgIndex] = useState(null);

  const [iconPicker, setIconPicker] = useState({ isOpen: false, folderId: null });
  const [folderModal, setFolderModal] = useState({ isOpen: false, parentId: null, value: '' });
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFolderValue, setEditingFolderValue] = useState('');
  const [isRenamingTitle, setIsRenamingTitle] = useState(false);

  const handleDeleteFavFolder = (id) => {
    if (confirm('删除此收藏夹及其中的所有收藏？原词条不受影响。')) {
      setFavFolders(prev => {
        const remove = (nodes) => nodes.filter(n => n.id !== id).map(n => n.children?.length > 0 ? { ...n, children: remove(n.children) } : n);
        return remove(prev);
      });
      setFavorites(prev => prev.filter(f => f.favFolderId !== id));
      if (currentFavFolder === id) setCurrentFavFolder('fav-root');
    }
  };

  // 落库：主题存本地，数据同步到 Supabase
  useEffect(() => { localStorage.setItem('pc_theme', currentThemeId); }, [currentThemeId]);

  // 延迟加载：组件挂载后从 Supabase 拉数据
  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      try {
        const uid = getUserId();
        const [dbFolders, dbPrompts, dbFavFolders, dbFavorites] = await Promise.all([
          loadData('folders_data', uid, initialFolders),
          loadData('prompts_data', uid, initialPrompts),
          loadData('fav_folders_data', uid, initialFavFolders),
          loadData('favorites_data', uid, []),
        ]);

        if (cancelled) return;

        // 迁移：确保 prompts 有 sortKey，并清理引用无效文件夹的词条
        const validFolderIds = new Set((dbFolders || []).map(f => f.id));
        let migratedPrompts = dbPrompts;
        let hasMigration = false;
        if (Array.isArray(dbPrompts)) {
          migratedPrompts = dbPrompts
            .filter(p => validFolderIds.has(p.folderId))
            .map((p, i) => {
              if (p.sortKey == null) { hasMigration = true; return { ...p, sortKey: i }; }
              return p;
            });
        }
        if (hasMigration || migratedPrompts.length !== (dbPrompts || []).length) {
          await saveFullTable('prompts_data', uid, migratedPrompts);
        }

        setFolders(dbFolders);
        setPrompts(migratedPrompts || dbPrompts);
        setFavFolders(dbFavFolders);
        setFavorites(dbFavorites);

        // 找到第一个包含词条的文件夹
        const folderWithPrompts = new Set((migratedPrompts || dbPrompts || []).map(p => p.folderId));
        const validFolders = (dbFolders || []).filter(f => folderWithPrompts.has(f.id));
        const firstFolderWithPrompts = validFolders.length > 0 ? validFolders[0] : (dbFolders && dbFolders.length > 0 ? dbFolders[0] : null);

        if (firstFolderWithPrompts) {
          setCurrentFolder(firstFolderWithPrompts.id);
        }

        const promptList = migratedPrompts || dbPrompts;
        if (promptList && promptList.length > 0) {
          setCurrentPromptId(promptList[0].id);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Initial load failed:', err);
        if (!cancelled) {
          // 加载失败时仍然显示初始数据，不让界面变空白
          setFolders(initialFolders);
          setPrompts(initialPrompts);
          setFavFolders(initialFavFolders);
          setFavorites([]);
          setIsLoading(false);
        }
      }
    };
    loadAll();
    return () => { cancelled = true; };
  }, []);

  // 文件夹变更 → 同步到 Supabase
  let syncTimerFolders = null;
  useEffect(() => {
    if (!isLoading) {
      clearTimeout(syncTimerFolders);
      syncTimerFolders = setTimeout(() => {
        saveFullTable('folders_data', userId, folders);
      }, 1000);
    }
    return () => clearTimeout(syncTimerFolders);
  }, [folders, isLoading, userId]);

  // 提示词变更 → 同步到 Supabase
  let syncTimerPrompts = null;
  useEffect(() => {
    if (!isLoading) {
      clearTimeout(syncTimerPrompts);
      syncTimerPrompts = setTimeout(() => {
        saveFullTable('prompts_data', userId, prompts);
      }, 1000);
    }
    return () => clearTimeout(syncTimerPrompts);
  }, [prompts, isLoading, userId]);

  // 收藏夹文件夹变更 → 同步
  let syncTimerFavFolders = null;
  useEffect(() => {
    if (!isLoading) {
      clearTimeout(syncTimerFavFolders);
      syncTimerFavFolders = setTimeout(() => {
        saveFullTable('fav_folders_data', userId, favFolders);
      }, 1000);
    }
    return () => clearTimeout(syncTimerFavFolders);
  }, [favFolders, isLoading, userId]);

  // 收藏关系变更 → 同步
  let syncTimerFavorites = null;
  useEffect(() => {
    if (!isLoading) {
      clearTimeout(syncTimerFavorites);
      syncTimerFavorites = setTimeout(() => {
        saveFullTable('favorites_data', userId, favorites);
      }, 1000);
    }
    return () => clearTimeout(syncTimerFavorites);
  }, [favorites, isLoading, userId]);

  // 灯箱
  useEffect(() => {
    if (!lightbox.isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightbox(p => ({ ...p, isOpen: false }));
      if (e.key === 'ArrowRight') setLightbox(p => ({ ...p, index: (p.index + 1) % p.images.length }));
      if (e.key === 'ArrowLeft') setLightbox(p => ({ ...p, index: (p.index - 1 + p.images.length) % p.images.length }));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox.isOpen]);

  // 灯箱切换图片时重置缩放/位移，关闭时清理拖拽残留
  useEffect(() => {
    setLbTransform({ scale: 1, x: 0, y: 0 });
    lbPanRef.current = null;
  }, [lightbox.index, lightbox.isOpen]);

  // 文件夹排序快捷键：Cmd+↑↓ / Tab / Shift+Tab
  useEffect(() => {
    const onKey = (e) => {
      if (editingFolderId || !currentFolder || iconPicker.isOpen || folderModal.isOpen || favFolderModal.isOpen || showFavManager || showFavPicker || showMovePicker || showSettings) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'ArrowUp') { e.preventDefault(); moveFolder(currentFolder, 'up'); }
      else if (mod && e.key === 'ArrowDown') { e.preventDefault(); moveFolder(currentFolder, 'down'); }
      else if (e.key === 'Tab' && !mod) { e.preventDefault(); moveFolder(currentFolder, 'into'); }
      else if (e.key === 'Tab' && e.shiftKey) { e.preventDefault(); moveFolder(currentFolder, 'out'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentFolder, editingFolderId, iconPicker.isOpen, folderModal.isOpen, favFolderModal.isOpen, showFavManager, showFavPicker, showMovePicker, showSettings]);

  const currentPromptsList = prompts.filter(p => {
    const matchesFolder = p.folderId === currentFolder;
    if (!searchQuery) return matchesFolder;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q));
  }).sort((a, b) => (b.sortKey || 0) - (a.sortKey || 0) || a.id.localeCompare(b.id));

  const getDescendantIds = (nodes, targetId) => {
    const result = [];
    const collect = (ns) => { for (const n of ns) { result.push(n.id); if (n.children) collect(n.children); } };
    const find = (ns) => { for (const n of ns) { if (n.id === targetId) { collect([n]); return true; } if (n.children && find(n.children)) return true; } return false; };
    find(nodes);
    return result.length > 0 ? result : [targetId];
  };

  const displayedPrompts = (() => {
    if (listSource === 'stars') {
      let result = prompts.filter(p => starFilter === 0 ? (p.stars || 0) > 0 : (p.stars || 0) === starFilter);
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q)));
      }
      return result.sort((a, b) => (b.sortKey || 0) - (a.sortKey || 0) || a.id.localeCompare(b.id));
    }
    if (listSource === 'favorites') {
      let result;
      if (currentFavFolder === '__all__') {
        result = prompts.filter(p => favorites.some(f => f.promptId === p.id));
      } else {
        const folderIds = getDescendantIds(favFolders, currentFavFolder);
        result = prompts.filter(p => favorites.some(f => f.promptId === p.id && folderIds.includes(f.favFolderId)));
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = result.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q)));
      }
      return result.sort((a, b) => (b.sortKey || 0) - (a.sortKey || 0) || a.id.localeCompare(b.id));
    }
    return currentPromptsList;
  })();

  const isPromptFavorited = (promptId) => favorites.some(f => f.promptId === promptId);

  const activePrompt = prompts.find(p => p.id === currentPromptId) || currentPromptsList[0] || null;

  const handleContentChange = (field, value) => {
    setPrompts(prev => prev.map(p => p.id === activePrompt.id ? { ...p, [field]: value } : p));
  };

  // 调宽
  const startResize = (panel, startEvent) => {
    startEvent.preventDefault();
    const startX = startEvent.clientX;
    const startWidth = panelWidths[panel];
    const doResize = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newWidth = panel === 'scratchpad' ? startWidth - deltaX : startWidth + deltaX;
      if (newWidth < 160) newWidth = 160;
      if (newWidth > 600) newWidth = 600;
      setPanelWidths(prev => ({ ...prev, [panel]: newWidth }));
    };
    const stopResize = () => {
      window.removeEventListener('mousemove', doResize);
      window.removeEventListener('mouseup', stopResize);
    };
    window.addEventListener('mousemove', doResize);
    window.addEventListener('mouseup', stopResize);
  };

  // 提示词/参考例子上下分割拖拽（左侧列内部）
  const startPromptResize = (startEvent) => {
    startEvent.preventDefault();
    const startY = startEvent.clientY;
    const startRatio = promptSplitRatio;
    const doResize = (moveEvent) => {
      const containerEl = document.getElementById('prompt-ref-stack');
      if (!containerEl) return;
      const containerHeight = containerEl.getBoundingClientRect().height;
      const deltaY = moveEvent.clientY - startY;
      let newRatio = startRatio + deltaY / containerHeight;
      if (newRatio < 0.25) newRatio = 0.25;
      if (newRatio > 0.80) newRatio = 0.80;
      setPromptSplitRatio(newRatio);
    };
    const stopResize = () => {
      window.removeEventListener('mousemove', doResize);
      window.removeEventListener('mouseup', stopResize);
    };
    window.addEventListener('mousemove', doResize);
    window.addEventListener('mouseup', stopResize);
  };

  // 左侧内容区 / 右侧图片区 左右分割拖拽
  const startContentImageResize = (startEvent) => {
    startEvent.preventDefault();
    const startX = startEvent.clientX;
    const startRatio = contentImageRatio;
    const doResize = (moveEvent) => {
      const containerEl = document.getElementById('prompt-split-container');
      if (!containerEl) return;
      const containerWidth = containerEl.getBoundingClientRect().width;
      const deltaX = moveEvent.clientX - startX;
      let newRatio = startRatio + deltaX / containerWidth;
      const maxRatio = 1 - 40 / containerWidth;
      if (newRatio < 0.20) newRatio = 0.20;
      if (newRatio > maxRatio) newRatio = maxRatio;
      setContentImageRatio(newRatio);
    };
    const stopResize = () => {
      window.removeEventListener('mousemove', doResize);
      window.removeEventListener('mouseup', stopResize);
    };
    window.addEventListener('mousemove', doResize);
    window.addEventListener('mouseup', stopResize);
  };

  // 文件夹/收藏夹面板垂直分割拖拽
  const startFolderFavResize = (startEvent) => {
    startEvent.preventDefault();
    const containerEl = document.getElementById('folder-fav-container');
    if (!containerEl) return;
    const startY = startEvent.clientY;
    const containerHeight = containerEl.getBoundingClientRect().height;
    const startRatio = folderFavSplitRatio;
    const doResize = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      let newRatio = startRatio + deltaY / containerHeight;
      if (newRatio < 0.25) newRatio = 0.25;
      if (newRatio > 0.85) newRatio = 0.85;
      setFolderFavSplitRatio(newRatio);
    };
    const stopResize = () => {
      window.removeEventListener('mousemove', doResize);
      window.removeEventListener('mouseup', stopResize);
    };
    window.addEventListener('mousemove', doResize);
    window.addEventListener('mouseup', stopResize);
  };

  // 收藏夹/打星面板垂直分割拖拽
  const startFavStarsResize = (startEvent) => {
    startEvent.preventDefault();
    const containerEl = document.getElementById('folder-fav-container');
    if (!containerEl) return;
    const startY = startEvent.clientY;
    const containerHeight = containerEl.getBoundingClientRect().height;
    const folderRatio = folderFavSplitRatio;
    const startRatio = favStarsSplitRatio;
    const doResize = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const bottomHeight = (1 - folderRatio) * containerHeight;
      let newRatio = startRatio + deltaY / bottomHeight;
      if (newRatio < 0.15) newRatio = 0.15;
      if (newRatio > 0.85) newRatio = 0.85;
      setFavStarsSplitRatio(newRatio);
    };
    const stopResize = () => {
      window.removeEventListener('mousemove', doResize);
      window.removeEventListener('mouseup', stopResize);
    };
    window.addEventListener('mousemove', doResize);
    window.addEventListener('mouseup', stopResize);
  };

  // ----------------------------------------------------
  // 树状增删改算法核心
  // ----------------------------------------------------
  const findAndRemoveNode = (nodes, id, holder = { node: null }) => {
    const filtered = nodes.filter(n => { if (n.id === id) { holder.node = n; return false; } return true; });
    return filtered.map(n => n.children?.length > 0 ? { ...n, children: findAndRemoveNode(n.children, id, holder) } : n);
  };

  const addNodeRecursive = (nodes, parentId, newNode) => {
    return nodes.map(n => {
      if (n.id === parentId) return { ...n, isOpen: true, children: [...(n.children || []), newNode] };
      if (n.children && n.children.length > 0) {
        return { ...n, children: addNodeRecursive(n.children, parentId, newNode) };
      }
      return n;
    });
  };

  const handleExecuteCreateFolder = () => {
    if (!folderModal.value.trim()) return setFolderModal({ isOpen: false, parentId: null, value: '' });
    const newF = { id: `f-${Date.now()}`, name: folderModal.value.trim(), icon: '📁', children: [], isOpen: true };
    if (!folderModal.parentId) {
      setFolders([...folders, newF]);
    } else {
      setFolders(addNodeRecursive(folders, folderModal.parentId, newF));
    }
    setFolderModal({ isOpen: false, parentId: null, value: '' });
  };

  const renameFolderRecursive = (nodes, folderId, newName) => {
    return nodes.map(n => {
      if (n.id === folderId) return { ...n, name: newName };
      if (n.children?.length > 0) return { ...n, children: renameFolderRecursive(n.children, folderId, newName) };
      return n;
    });
  };

  const handleSaveFolderRename = (id) => {
    if (editingFolderValue.trim()) setFolders(renameFolderRecursive(folders, id, editingFolderValue.trim()));
    setEditingFolderId(null);
  };

  // ----------------------------------------------------
  // 文件夹排序：上移 / 下移 / 移入上方兄弟 / 移出到上级
  // ----------------------------------------------------
  const swapSibling = (nodes, targetId, offset) => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === targetId) {
        const newIdx = i + offset;
        if (newIdx < 0 || newIdx >= nodes.length) return null;
        const newNodes = [...nodes];
        [newNodes[i], newNodes[newIdx]] = [newNodes[newIdx], newNodes[i]];
        return newNodes;
      }
      if (nodes[i].children?.length > 0) {
        const result = swapSibling(nodes[i].children, targetId, offset);
        if (result) {
          const newNodes = [...nodes];
          newNodes[i] = { ...newNodes[i], children: result };
          return newNodes;
        }
      }
    }
    return null;
  };

  const moveIntoAbove = (nodes, targetId) => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === targetId) {
        if (i === 0) return null;
        const sibling = nodes[i - 1];
        const newNodes = [...nodes];
        newNodes.splice(i, 1);
        newNodes[i - 1] = { ...sibling, isOpen: true, children: [...(sibling.children || []), nodes[i]] };
        return newNodes;
      }
      if (nodes[i].children?.length > 0) {
        const result = moveIntoAbove(nodes[i].children, targetId);
        if (result) {
          const newNodes = [...nodes];
          newNodes[i] = { ...newNodes[i], children: result };
          return newNodes;
        }
      }
    }
    return null;
  };

  const moveOutToParent = (nodes, targetId) => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].children?.length > 0) {
        const childIdx = nodes[i].children.findIndex(c => c.id === targetId);
        if (childIdx !== -1) {
          const child = nodes[i].children[childIdx];
          const newChildren = [...nodes[i].children];
          newChildren.splice(childIdx, 1);
          const newNodes = [...nodes];
          newNodes[i] = { ...nodes[i], children: newChildren };
          newNodes.splice(i + 1, 0, child);
          return newNodes;
        }
        const result = moveOutToParent(nodes[i].children, targetId);
        if (result) {
          const newNodes = [...nodes];
          newNodes[i] = { ...newNodes[i], children: result };
          return newNodes;
        }
      }
    }
    return null;
  };

  const moveFolder = (folderId, op) => {
    let result = null;
    if (op === 'up') result = swapSibling(folders, folderId, -1);
    else if (op === 'down') result = swapSibling(folders, folderId, 1);
    else if (op === 'into') result = moveIntoAbove(folders, folderId);
    else if (op === 'out') result = moveOutToParent(folders, folderId);
    if (result) setFolders(result);
  };

  // 词条列表上下移动 — 重建当前文件夹内全部词条的 sortKey 顺序
  const movePromptInList = (promptId, direction) => {
    const folderId = currentFolder;
    setPrompts(prev => {
      const folderPrompts = prev
        .filter(p => p.folderId === folderId)
        .sort((a, b) => (b.sortKey || 0) - (a.sortKey || 0) || a.id.localeCompare(b.id));
      const idx = folderPrompts.findIndex(p => p.id === promptId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= folderPrompts.length) return prev;

      // 交换位置后，整个文件夹的词条重新分配连续递减的 sortKey
      const reordered = [...folderPrompts];
      [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx], reordered[idx]];
      const base = Date.now();
      const newKeys = new Map(reordered.map((p, i) => [p.id, base - i]));

      return prev.map(p => newKeys.has(p.id) ? { ...p, sortKey: newKeys.get(p.id) } : p);
    });
  };

  // ----------------------------------------------------
  // 【底层全面对齐】修复点选图标导致的React数据类型死锁崩溃
  // ----------------------------------------------------
  const updateFolderIconRecursive = (nodes, folderId, newIcon) => {
    return nodes.map(n => {
      if (String(n.id) === String(folderId)) {
        return { ...n, icon: newIcon };
      }
      if (n.children && n.children.length > 0) {
        return { ...n, children: updateFolderIconRecursive(n.children, folderId, newIcon) };
      }
      return n;
    });
  };

  const handleApplySelectedIcon = (iconSymbol) => {
    const targetId = iconPicker.folderId;
    if (!targetId) return;

    // 用绝对安全的函数指针重新写入
    setFolders(prev => updateFolderIconRecursive(prev, targetId, iconSymbol));
    setIconPicker({ isOpen: false, folderId: null });
  };

  const handleCustomIconUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !iconPicker.folderId) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const imgTag = `<img src="${event.target.result}" class="w-4 h-4 rounded object-cover inline-block" />`;
      setFolders(prev => updateFolderIconRecursive(prev, iconPicker.folderId, imgTag));
      setIconPicker({ isOpen: false, folderId: null });
    };
    reader.readAsDataURL(file);
  };

  // HTTPS图床上传
  const uploadImageToCloud = async (file) => {
    if (!file) return;
    const cleanApiKey = (imgBedConfig.apiKey || '').trim();
    setIsUploading(true);
    const formData = new FormData();
    const finalKey = cleanApiKey || '10b80980dc24754a6be2372f6a73ba9a';
    let apiUrl = `https://api.imgbb.com/1/upload?key=${finalKey}`;
    formData.append('image', file);
    try {
      const res = await fetch(apiUrl, { method: 'POST', body: formData });
      const result = await res.json();
      if (result?.data?.url) handleContentChange('images', [...(activePrompt.images || []), result.data.url]);
    } catch (error) { alert('上云失败'); }
    setIsUploading(false);
  };

  // 图片排序
  const handleImgDragStart = (e, idx) => { setDraggedImgIndex(idx); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', idx); };
  const handleImgDragOver = (e, targetIdx) => { if (draggedImgIndex === null || draggedImgIndex === targetIdx) return; e.preventDefault(); };
  const handleImgDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedImgIndex === null || draggedImgIndex === targetIdx) return;
    const reorderedImages = [...activePrompt.images];
    const [removed] = reorderedImages.splice(draggedImgIndex, 1);
    reorderedImages.splice(targetIdx, 0, removed);
    handleContentChange('images', reorderedImages);
    setDraggedImgIndex(null);
  };

  // ----------------------------------------------------
  // FLIP 动画：拖拽时记录每个文件夹的位置变化，用 transform 做缓动过渡
  // ----------------------------------------------------
  const folderRefsRef = useRef(new Map());
  const prevRectsRef = useRef(new Map());

  // FLIP 动画：hover 展开文件夹时，下方文件夹平滑跟随位移
  useLayoutEffect(() => {
    const currentRects = new Map();
    folderRefsRef.current.forEach((el, id) => {
      currentRects.set(id, el.getBoundingClientRect());
    });

    const prevRects = prevRectsRef.current;
    if (prevRects.size > 0) {
      folderRefsRef.current.forEach((el, id) => {
        if (id === hoveredFolderId) return;
        const prev = prevRects.get(id);
        const curr = currentRects.get(id);
        if (prev && curr) {
          const deltaY = prev.top - curr.top;
          if (Math.abs(deltaY) > 0.5) {
            el.style.transform = `translateY(${deltaY}px)`;
            el.style.transition = 'none';
            requestAnimationFrame(() => {
              el.style.transition = 'transform 0.3s ease';
              el.style.transform = '';
            });
          }
        }
      });
    }

    prevRectsRef.current = currentRects;
  }, [hoveredFolderId]);

  // ----------------------------------------------------
  // 收藏夹选择器（带勾选标记）
  const PickFavFolder = ({ nodes, promptId, favorites, onToggle, depth = 0 }) => {
    return (
      <div className={`space-y-0.5 ${depth > 0 ? 'pl-2.5 border-l border-slate-700/30 ml-1' : ''}`}>
        {nodes.map(n => {
          const isChecked = favorites.some(f => f.promptId === promptId && f.favFolderId === n.id);
          return (
            <div key={n.id} className="space-y-0.5">
              <button
                onClick={() => onToggle(promptId, n.id)}
                className={`w-full flex items-center gap-1.5 text-[10px] rounded px-1.5 py-1 transition text-left ${isChecked ? 'bg-amber-500/15 text-amber-400' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}`}
              >
                <span className="text-[11px] w-3 text-center">{isChecked ? '✓' : ''}</span>
                <span className="text-[12px]">{n.icon || '📁'}</span>
                <span className="truncate">{n.name}</span>
              </button>
              {n.children && n.children.length > 0 && (
                <PickFavFolder nodes={n.children} promptId={promptId} favorites={favorites} onToggle={onToggle} depth={depth + 1} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // 收藏夹文件夹树
  const FavFolderTree = ({ nodes, current, onSelect, onAdd, onDelete, depth = 0 }) => {
    if (!nodes || nodes.length === 0) return <div className="text-[10px] text-slate-600 px-1 py-0.5">暂无收藏夹</div>;
    return (
      <div className={`space-y-0.5 ${depth > 0 ? 'pl-3 border-l border-slate-700/30 ml-1' : ''}`}>
        {nodes.map(n => {
          const sel = current === n.id;
          return (
            <div key={n.id} className="space-y-0.5">
              <div className={`flex items-center gap-1 group/fav text-[10px] rounded px-1.5 py-0.5 cursor-pointer transition ${sel ? 'bg-amber-500/15 text-amber-400' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}`}>
                <span onClick={() => onSelect(n.id)} className="flex-1 truncate flex items-center gap-1">
                  <span className="text-[12px]">{n.icon || '📁'}</span>
                  <span className="truncate">{n.name}</span>
                </span>
                <div className="opacity-0 group-hover/fav:opacity-100 flex items-center gap-0.5 transition">
                  <button onClick={(e) => { e.stopPropagation(); onAdd(n.id); }} className="text-blue-400 hover:text-blue-300 text-[10px] font-bold">+</button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(n.id); }} className="text-slate-500 hover:text-rose-400 text-[10px]">🗑</button>
                </div>
              </div>
              {n.children && n.children.length > 0 && (
                <FavFolderTree nodes={n.children} current={current} onSelect={onSelect} onAdd={onAdd} onDelete={onDelete} depth={depth + 1} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const toggleSelect = (promptId) => {
    setSelectedPromptIds(prev =>
      prev.includes(promptId) ? prev.filter(id => id !== promptId) : [...prev, promptId]
    );
  };

  // 文件夹选择器（用于移动词条时选择目标文件夹）
  const PickFolder = ({ nodes, onSelect, depth = 0 }) => {
    return (
      <div className={`space-y-0.5 ${depth > 0 ? 'pl-2.5 border-l border-slate-700/30 ml-1' : ''}`}>
        {nodes.map(n => (
          <div key={n.id} className="space-y-0.5">
            <button
              onClick={() => onSelect(n.id)}
              className="w-full flex items-center gap-1.5 text-[10px] rounded px-1.5 py-1 transition text-left text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
            >
              <span className="text-[12px]">{n.icon || '📁'}</span>
              <span className="truncate">{n.name}</span>
            </button>
            {n.children && n.children.length > 0 && (
              <PickFolder nodes={n.children} onSelect={onSelect} depth={depth + 1} />
            )}
          </div>
        ))}
      </div>
    );
  };

  // 递归树状分类菜单
  // ----------------------------------------------------
  const RenderFolderTree = ({ nodes, depth = 0 }) => {
    return (
      <div className="space-y-0.5">
        {nodes.map((node, idx) => {
          const canUp = idx > 0;
          const canDown = idx < nodes.length - 1;
          const canInto = idx > 0;
          const canOut = depth > 0;
          const hasChildren = node.children && node.children.length > 0;
          const isSelected = currentFolder === node.id;
          const isRenamingThis = editingFolderId === node.id;

          return (
            <div key={node.id} className="space-y-0.5">
              <div
                ref={(el) => {
                  if (el) folderRefsRef.current.set(node.id, el);
                  else folderRefsRef.current.delete(node.id);
                }}
                onClick={() => { if(!isRenamingThis) { setCurrentFolder(node.id); setListSource('folder'); setCurrentPromptId(''); } }}
                onMouseEnter={() => { if (!isRenamingThis) setHoveredFolderId(node.id); }}
                onMouseLeave={() => setHoveredFolderId(null)}
                className={`grid transition-[grid-template-rows] duration-300 ease-out rounded-lg text-xs cursor-pointer ${isSelected ? currentTheme.active : `hover:bg-slate-800/30 text-slate-400`}`}
                style={{ gridTemplateRows: (hoveredFolderId === node.id && !isRenamingThis) ? '34px 1fr' : '34px 0fr' }}
              >
                {/* Row 1: 主内容行 */}
                <div className="flex items-center py-1 pl-2.5 pr-2 overflow-hidden min-h-0">
                  <div className="flex items-center gap-1.5 overflow-hidden truncate flex-1">
                    <span
                      onClick={(e) => { e.stopPropagation(); setFolders(prev => {
                        const toggle = (list) => list.map(n => n.id === node.id ? { ...n, isOpen: !n.isOpen } : { ...n, children: toggle(n.children || []) });
                        return toggle(prev);
                      }); }}
                      className={`w-5 h-5 flex items-center justify-center text-[14px] text-slate-500 hover:text-slate-200 rounded transition cursor-pointer select-none flex-shrink-0 ${hasChildren && node.isOpen ? 'rotate-90' : ''}`}
                    >
                      {hasChildren ? '▶' : '•'}
                    </span>

                    <span
                      onClick={(e) => { e.stopPropagation(); setIconPicker({ isOpen: true, folderId: node.id }); }}
                      className="cursor-pointer hover:scale-125 transition flex-shrink-0 flex items-center justify-center w-5 h-5 bg-slate-800/30 hover:bg-slate-500/10 rounded-md border border-slate-800/20"
                      dangerouslySetInnerHTML={node.icon.startsWith('<img') ? { __html: node.icon } : undefined}
                    >
                      {node.icon.startsWith('<img') ? null : node.icon}
                    </span>

                    {isRenamingThis ? (
                      <input
                        type="text" value={editingFolderValue}
                        onChange={(e) => setEditingFolderValue(e.target.value)}
                        onBlur={() => handleSaveFolderRename(node.id)}
                        onKeyDown={(e) => { if(e.key === 'Enter') handleSaveFolderRename(node.id); e.stopPropagation(); }}
                        onClick={(e) => e.stopPropagation()} autoFocus
                        className="bg-black/80 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none w-full font-sans"
                      />
                    ) : (
                      <span className="truncate font-medium tracking-wide">{node.name}</span>
                    )}
                  </div>
                </div>

                {/* Row 2: 操作按钮行 — hover 时向下展开 */}
                <div className="overflow-hidden min-h-0">
                  {!isRenamingThis && (
                    <div className="h-7 flex items-center justify-end gap-0.5 px-2.5 border-t border-slate-700/30 bg-slate-800/15">
                      {canOut && <button onClick={(e) => { e.stopPropagation(); moveFolder(node.id, 'out'); }} title="移出到上级 Shift+Tab" className="text-slate-400 hover:text-amber-300 text-xs px-1 py-0.5 rounded hover:bg-slate-700/30 transition">↖</button>}
                      {canInto && <button onClick={(e) => { e.stopPropagation(); moveFolder(node.id, 'into'); }} title="移入上方兄弟 Tab" className="text-slate-400 hover:text-purple-300 text-xs px-1 py-0.5 rounded hover:bg-slate-700/30 transition">↘</button>}
                      {canUp && <button onClick={(e) => { e.stopPropagation(); moveFolder(node.id, 'up'); }} title="上移 Cmd+↑" className="text-slate-400 hover:text-slate-200 text-xs px-1 py-0.5 rounded hover:bg-slate-700/30 transition">↑</button>}
                      {canDown && <button onClick={(e) => { e.stopPropagation(); moveFolder(node.id, 'down'); }} title="下移 Cmd+↓" className="text-slate-400 hover:text-slate-200 text-xs px-1 py-0.5 rounded hover:bg-slate-700/30 transition">↓</button>}
                      <div className="w-px h-3 bg-slate-700/40 mx-0.5" />
                      <button onClick={(e) => { e.stopPropagation(); setEditingFolderId(node.id); setEditingFolderValue(node.name); }} className="text-slate-500 hover:text-amber-400 text-xs px-1 py-0.5 rounded hover:bg-slate-700/30 transition">✏️</button>
                      <button onClick={(e) => { e.stopPropagation(); setFolderModal({ isOpen: true, parentId: node.id, value: '' }); }} className="text-blue-400 hover:text-blue-300 text-sm font-bold px-1 py-0.5 rounded hover:bg-slate-700/30 transition">+</button>
                      <button onClick={(e) => { e.stopPropagation(); if(confirm(`确认删除 [${node.name}] 分类？`)) setFolders(findAndRemoveNode(folders, node.id)); }} className="text-slate-500 hover:text-rose-400 text-xs px-1 py-0.5 rounded hover:bg-slate-700/30 transition">🗑️</button>
                    </div>
                  )}
                </div>
              </div>
              {hasChildren && node.isOpen && (
                <div className="pl-3.5 border-l ml-3.5 mt-0.5 space-y-0.5" style={{ borderColor: currentTheme.borderPure }}>
                  <RenderFolderTree nodes={node.children} depth={depth + 1} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const activeIconCategoryObj = iconCategories.find(c => c.id === activeIconCat) || iconCategories[0];

  return (
    <div className={`h-screen w-screen flex flex-col ${currentTheme.bg} ${currentTheme.text} font-sans overflow-hidden select-none`}>

      {/* 顶部控制栏 */}
      <header className={`h-14 border-b ${currentTheme.border} flex items-center justify-between px-6 bg-black/40 backdrop-blur flex-shrink-0`}>
        <div className="flex items-center gap-3">
          <span className="text-lg font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-wider">PromptCraft IDE</span>
          <select value={currentThemeId} onChange={(e) => setCurrentThemeId(e.target.value)} className="bg-black/50 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-400 focus:outline-none">
            {themes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-3">
          {isLoading && <span className="text-xs text-slate-500 animate-pulse">⏳ 正在同步数据...</span>}
          {!isLoading && <span className="text-xs text-emerald-500">✅ 数据已同步</span>}
          <label className="px-3 py-1.5 text-xs bg-black/40 hover:bg-black/80 text-slate-400 transition rounded-md border border-slate-800 cursor-pointer font-medium">
            📥 导入 JSON
            <input type="file" accept=".json" onChange={(e) => {
              const file = e.target.files[0]; if (!file) return;
              const r = new FileReader(); r.onload = (evt) => {
                const p = JSON.parse(evt.target.result);
                const imported = importData(p);
                if (imported) { setFolders(imported.folders); setPrompts(imported.prompts); setFavFolders(imported.favFolders); setFavorites(imported.favorites); alert('🎉 配置已加载恢复！'); }
              }; r.readAsText(file);
            }} className="hidden" />
          </label>
          <button onClick={() => {
            const blob = new Blob([JSON.stringify(exportData(folders, prompts, favFolders, favorites), null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `promptcraft_backup_${new Date().toISOString().slice(0,10)}.json`; a.click();
          }} className={`px-3 py-1.5 text-xs text-white transition rounded-md font-medium shadow-md ${currentTheme.accent}`}>📤 导出备份</button>
          <button onClick={() => setShowSettings(!showSettings)} className="text-xs text-slate-600 hover:text-slate-400 ml-1">⚙️</button>
        </div>
      </header>

      {/* 主画布结构 */}
      <div className="flex-1 flex overflow-hidden w-full relative">

        {/* 自定义 UI 新建舱 */}
        {folderModal.isOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center" onClick={() => setFolderModal({ isOpen: false, parentId: null, value: '' })}>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 w-80 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{folderModal.parentId ? '📂 新建子嵌套分类' : '📁 创建根级别分类'}</h3>
              <input
                type="text" value={folderModal.value}
                onChange={(e) => setFolderModal({ ...folderModal, value: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') handleExecuteCreateFolder(); }}
                placeholder="直接敲入分类别名..." autoFocus
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
              />
              <div className="flex justify-end gap-2.5 text-xs">
                <button onClick={() => setFolderModal({ isOpen: false, parentId: null, value: '' })} className="px-3 py-1.5 text-slate-500 hover:text-stone-300">取消</button>
                <button onClick={handleExecuteCreateFolder} className={`px-4 py-1.5 text-white rounded-lg transition ${currentTheme.accent}`}>确认创建</button>
              </div>
            </div>
          </div>
        )}

        {/* 收藏夹新建弹窗 */}
        {favFolderModal.isOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center" onClick={() => setFavFolderModal({ isOpen: false, parentId: null, value: '' })}>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 w-80 shadow-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">📁 新建收藏夹</h3>
              <input
                type="text" value={favFolderModal.value}
                onChange={(e) => setFavFolderModal({ ...favFolderModal, value: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') {
                  if (!favFolderModal.value.trim()) return setFavFolderModal({ isOpen: false, parentId: null, value: '' });
                  const newF = { id: `favf-${Date.now()}`, name: favFolderModal.value.trim(), icon: '📁', children: [] };
                  if (!favFolderModal.parentId) {
                    setFavFolders([...favFolders, newF]);
                  } else {
                    const addTo = (nodes, parentId, newNode) => nodes.map(n => n.id === parentId ? { ...n, children: [...(n.children || []), newNode] } : n.children?.length > 0 ? { ...n, children: addTo(n.children, parentId, newNode) } : n);
                    setFavFolders(addTo(favFolders, favFolderModal.parentId, newF));
                  }
                  setFavFolderModal({ isOpen: false, parentId: null, value: '' });
                } }}
                placeholder="收藏夹名称..." autoFocus
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
              />
              <div className="flex justify-end gap-2.5 text-xs">
                <button onClick={() => setFavFolderModal({ isOpen: false, parentId: null, value: '' })} className="px-3 py-1.5 text-slate-500 hover:text-stone-300">取消</button>
                <button onClick={() => {
                  if (!favFolderModal.value.trim()) return setFavFolderModal({ isOpen: false, parentId: null, value: '' });
                  const newF = { id: `favf-${Date.now()}`, name: favFolderModal.value.trim(), icon: '📁', children: [] };
                  if (!favFolderModal.parentId) { setFavFolders([...favFolders, newF]); }
                  else { const addTo = (nodes, parentId, newNode) => nodes.map(n => n.id === parentId ? { ...n, children: [...(n.children || []), newNode] } : n.children?.length > 0 ? { ...n, children: addTo(n.children, parentId, newNode) } : n); setFavFolders(addTo(favFolders, favFolderModal.parentId, newF)); }
                  setFavFolderModal({ isOpen: false, parentId: null, value: '' });
                }} className="px-4 py-1.5 text-white rounded-lg transition bg-amber-600 hover:bg-amber-500">创建</button>
              </div>
            </div>
          </div>
        )}

        {/* 收藏夹管理弹窗 */}
        {showFavManager && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center" onClick={() => setShowFavManager(false)}>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl w-[480px] max-h-[70vh] shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">⚙️ 管理收藏夹</h3>
                <button onClick={() => setShowFavManager(false)} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {favFolders.map(folder => {
                  const folderFavs = favorites.filter(f => f.favFolderId === folder.id);
                  const countDescendants = (n) => { let c = 0; if (n.children) n.children.forEach(ch => c += countDescendants(ch)); return c + favorites.filter(f => f.favFolderId === n.id).length; };
                  const total = countDescendants(folder);
                  return (
                    <div key={folder.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{folder.icon || '📁'}</span>
                          <span className="text-xs font-semibold text-slate-200">{folder.name}</span>
                          <span className="text-[10px] text-slate-600">({total})</span>
                        </div>
                        <button
                          onClick={() => { if(confirm(`删除收藏夹「${folder.name}」及其所有收藏？原词条不受影响。`)) { setFavFolders(prev => prev.filter(n => n.id !== folder.id)); setFavorites(prev => prev.filter(f => f.favFolderId !== folder.id)); } }}
                          className="text-[10px] text-slate-500 hover:text-rose-400 transition"
                        >🗑️ 删除夹</button>
                      </div>
                      {folderFavs.length > 0 && (
                        <div className="space-y-1">
                          {folderFavs.map(fav => {
                            const pp = prompts.find(ppp => ppp.id === fav.promptId);
                            return (
                              <div key={fav.id} className="flex items-center justify-between bg-slate-800/30 rounded-lg px-2 py-1">
                                <span className="text-[10px] text-slate-400 truncate flex-1">{pp?.title || '已删除的词条'}</span>
                                <button
                                  onClick={() => setFavorites(prev => prev.filter(f => f.id !== fav.id))}
                                  className="text-slate-600 hover:text-rose-400 text-[10px] px-1 transition"
                                >✕</button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {folderFavs.length === 0 && <div className="text-[10px] text-slate-600 italic">空收藏夹</div>}
                    </div>
                  );
                })}
                {favFolders.length === 0 && <div className="text-xs text-slate-600 text-center py-4">暂无收藏夹</div>}
              </div>
            </div>
          </div>
        )}

        {/* 自定义图标拾取舱 */}
        {iconPicker.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999] flex items-center justify-center" onClick={() => setIconPicker({ isOpen: false, folderId: null })}>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl w-[520px] h-[360px] shadow-2xl flex overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="w-40 border-r border-slate-900 bg-slate-950/80 p-3 flex flex-col gap-1 flex-shrink-0">
                <span className="text-[10px] font-bold text-slate-600 px-2 uppercase tracking-wider mb-2 block">图标驱动分类</span>
                {iconCategories.map(cat => (
                  <button key={cat.id} onClick={() => setActiveIconCat(cat.id)} className={`w-full py-2 px-3 text-left rounded-xl text-xs transition duration-150 font-medium ${activeIconCat === cat.id ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300 border border-transparent'}`}>{cat.name}</button>
                ))}
                <div className="mt-auto pt-3 border-t border-slate-900">
                  <label className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 rounded-xl flex items-center justify-center font-medium transition cursor-pointer text-center px-1">
                    📁 自定义本地传图
                    <input type="file" accept="image/*" onChange={handleCustomIconUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
                <div className="p-3 border-b border-slate-900/60 flex justify-between items-center bg-black/20">
                  <span className="text-xs font-semibold text-slate-400">{activeIconCategoryObj.name}</span>
                  <button onClick={() => setIconPicker({ isOpen: false, folderId: null })} className="text-slate-600 hover:text-slate-400 text-xs">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 content-start">

                  {/* 【彻底修复】调用高防崩溃的安全闭环绑定 handleApplySelectedIcon */}
                  <div className="grid grid-cols-5 gap-3.5">
                    {activeIconCategoryObj.icons.map((icon, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleApplySelectedIcon(icon)}
                        className="text-xl p-3 bg-slate-900/50 border border-slate-800/50 rounded-xl hover:bg-blue-600/20 hover:border-blue-500/30 transition duration-150 flex items-center justify-center aspect-square"
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showSettings && (
          <div className="absolute right-6 top-4 w-64 bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-2xl z-50">
            <input type="text" value={imgBedConfig.apiKey} onChange={(e) => setImgBedConfig({...imgBedConfig, apiKey: e.target.value})} placeholder="输入你的 ImgBB Key..." className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono focus:outline-none" />
            <button onClick={() => setShowSettings(false)} className="w-full mt-2 py-1 bg-slate-800 rounded text-xs">关闭</button>
          </div>
        )}

        {/* 批量移动词条弹窗 */}
        {showMovePicker && moveMode === 'batch' && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center" onClick={() => { setShowMovePicker(false); setMoveMode('single'); }}>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 w-80 max-h-[60vh] shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">📂 移动到文件夹</h3>
                <button onClick={() => { setShowMovePicker(false); setMoveMode('single'); }} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
              </div>
              <div className="text-[10px] text-slate-500 mb-3">将已选的 {selectedPromptIds.length} 条词条移动到：</div>
              <div className="flex-1 overflow-y-auto">
                <PickFolder nodes={folders} onSelect={(folderId) => {
                  setPrompts(prev => prev.map(p => selectedPromptIds.includes(p.id) ? { ...p, folderId } : p));
                  setSelectedPromptIds([]);
                  setShowMovePicker(false);
                  setMoveMode('single');
                }} />
              </div>
            </div>
          </div>
        )}

        {/* 1. 分类树 + 收藏夹 垂直分栏面板 */}
        <aside id="folder-fav-container" style={{ width: isFolderCollapsed ? 0 : panelWidths.folder }} className={`border-r ${currentTheme.border} flex flex-col ${currentTheme.panel} flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out`}>
          {/* 上方：分类文件夹树 */}
          <div style={{ height: `${folderFavSplitRatio * 100}%` }} className="flex flex-col overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-slate-800/40 flex-shrink-0">
              <span className="text-xs font-bold text-slate-500 tracking-wider">高密度分类树</span>
              <button onClick={() => setFolderModal({ isOpen: true, parentId: null, value: '' })} className="text-[10px] text-blue-400 hover:text-blue-300">+根类</button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <RenderFolderTree nodes={folders} />
            </div>
          </div>

          {/* 可拖拽水平分割条 */}
          <div
            onMouseDown={startFolderFavResize}
            className="h-1.5 flex-shrink-0 bg-slate-600/40 hover:bg-blue-500/50 cursor-row-resize transition-colors flex items-center justify-center group/splitter"
          >
            <div className="w-8 h-0.5 bg-slate-400/50 group-hover/splitter:bg-blue-400/50 rounded-full transition-colors" />
          </div>

          {/* 下方：收藏夹 + 打星 垂直分栏 */}
          <div style={{ height: `${(1 - folderFavSplitRatio) * 100}%` }} className="flex flex-col overflow-hidden">
            {/* 收藏夹面板 */}
            <div className="flex flex-col overflow-hidden" style={isStarPanelCollapsed ? { flex: 1 } : { height: `${favStarsSplitRatio * 100}%` }}>
              <div className="px-3 py-2 flex items-center justify-between border-b border-slate-800/40 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsFavPanelCollapsed(!isFavPanelCollapsed)}
                    className="text-[10px] text-slate-400 hover:text-white transition"
                    title={isFavPanelCollapsed ? '展开收藏面板' : '收起收藏面板'}
                  >{isFavPanelCollapsed ? '▶' : '▼'}</button>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">📌 收藏夹</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setFavFolderModal({ isOpen: true, parentId: null, value: '' })} className="text-[10px] text-blue-400 hover:text-blue-300">+</button>
                  <button onClick={() => setShowFavManager(true)} className="text-[10px] text-slate-500 hover:text-slate-300">⚙️</button>
                </div>
              </div>
              {isFavPanelCollapsed ? null : <>
                <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
                  <button
                    onClick={() => { setCurrentFavFolder('__all__'); setListSource('favorites'); }}
                    className={`w-full flex items-center gap-1.5 text-[10px] rounded px-1.5 py-1 transition text-left ${currentFavFolder === '__all__' && listSource === 'favorites' ? 'bg-amber-500/15 text-amber-400' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'}`}
                  >
                    <span className="text-[12px]">📋</span>
                    <span className="truncate font-medium">全部收藏 ({favorites.length})</span>
                  </button>
                  <div className="border-t border-slate-800/40 pt-1">
                    <FavFolderTree nodes={favFolders} current={currentFavFolder} onSelect={(id) => { setCurrentFavFolder(id); setListSource('favorites'); }} onAdd={(parentId) => setFavFolderModal({ isOpen: true, parentId, value: '' })} onDelete={handleDeleteFavFolder} />
                </div>
                </div>
              </>}
            </div>

            {/* 可拖拽水平分割条2 — 收藏夹 / 打星 */}
            {isStarPanelCollapsed ? null : <>
              <div
                onMouseDown={startFavStarsResize}
                className="h-1.5 flex-shrink-0 bg-slate-600/40 hover:bg-blue-500/50 cursor-row-resize transition-colors flex items-center justify-center group/splitter"
              >
                <div className="w-8 h-0.5 bg-slate-400/50 group-hover/splitter:bg-blue-400/50 rounded-full transition-colors" />
              </div>
            </>}

            {/* 打星板块 */}
            <div className={`flex flex-col overflow-hidden flex-shrink-0 ${isStarPanelCollapsed ? '' : ''}`} style={{ height: isStarPanelCollapsed ? 'auto' : `${(1 - favStarsSplitRatio) * 100}%` }}>
              <div className="px-3 py-2 flex items-center justify-between border-b border-slate-800/40 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsStarPanelCollapsed(!isStarPanelCollapsed)}
                    className="text-[10px] text-slate-400 hover:text-white transition"
                    title={isStarPanelCollapsed ? '展开打星板块' : '收起打星板块'}
                  >{isStarPanelCollapsed ? '▶' : '▼'}</button>
                  <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">🌟 打星筛选</span>
                </div>
              </div>
              {!isStarPanelCollapsed && (
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                  {[0, 5, 4, 3, 2, 1].map(n => {
                    const count = n === 0 ? prompts.filter(p => (p.stars || 0) > 0).length : prompts.filter(p => (p.stars || 0) === n).length;
                    const isActive = listSource === 'stars' && starFilter === n;
                    return (
                      <button
                        key={n}
                        onClick={() => { setListSource('stars'); setStarFilter(n); }}
                        className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 transition text-[10px] ${isActive ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200 border border-transparent'}`}
                      >
                        <span className="flex items-center gap-0.5">
                          {n === 0 ? '📋 全部打星' : (
                            <>
                              <span className="text-amber-400">{'★'.repeat(n)}</span>
                              <span className="text-slate-700">{'☆'.repeat(5 - n)}</span>
                            </>
                          )}
                        </span>
                        <span className="text-[9px] text-slate-600">{count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* 文件夹面板折叠/展开按钮 + 拖拽调宽手柄 */}
        <div className="flex flex-col items-center flex-shrink-0 group/handle">
          <button
            onClick={() => setIsFolderCollapsed(!isFolderCollapsed)}
            className={`w-4 h-4 mt-14 rounded-full border transition cursor-pointer text-[8px] flex items-center justify-center ${isFolderCollapsed ? 'bg-slate-700 border-slate-500 text-slate-300 hover:text-white hover:border-blue-500' : 'bg-slate-800/60 border-slate-500/60 text-slate-400 hover:bg-slate-700 hover:border-slate-400 hover:text-white'}`}
            title={isFolderCollapsed ? "展开文件夹面板" : "隐藏文件夹面板"}
          >
            {isFolderCollapsed ? '▶' : '◀'}
          </button>
          <div
            onMouseDown={(e) => startResize('folder', e)}
            className="w-1 flex-1 bg-slate-600/30 hover:bg-blue-500/50 cursor-col-resize transition duration-150"
          />
        </div>

        {/* 2. 词条资产面板 */}
        <section style={{ width: panelWidths.list }} className={`border-r ${currentTheme.border} flex flex-col ${currentTheme.listBg} flex-shrink-0`}>
          <div className="p-3 border-b border-slate-800/40 flex-shrink-0">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="🔍 快速模糊全局检索..." className={`w-full ${currentTheme.inputBg} border ${currentTheme.border} rounded-lg px-3 py-1.5 text-xs focus:outline-none`} />
          </div>
          <div className="p-3 flex items-center justify-between border-b border-slate-800/30 flex-shrink-0">
            <span className="text-xs font-medium text-slate-500">{listSource === 'stars' ? '🌟 打星词条' : listSource === 'favorites' ? '📌 收藏词条' : '词条明细'} ({displayedPrompts.length})</span>
            <div className="flex items-center gap-1.5">
              {listSource === 'folder' && (
                <button onClick={() => {
                  if(!currentFolder) return alert('请先点选左侧某一分类');
                  const newP = { id: `p-${Date.now()}`, folderId: currentFolder, title: '', content: '', reference: '', tags: [], stars: 0, sortKey: Date.now(), images: ['data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="%231e293b" width="200" height="200"/><text fill="%2364748b" font-family="system-ui,sans-serif" font-size="40" font-weight="bold" text-anchor="middle" dy=".35em" x="100" y="100">?</text></svg>'] };
                  setPrompts([newP, ...prompts]); setCurrentPromptId(newP.id); setIsEditMode(true);
                }} className="px-2 py-0.5 bg-slate-800 text-[10px] text-slate-300 rounded hover:bg-slate-700 transition">+ 新建</button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {displayedPrompts.map((p, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === displayedPrompts.length - 1;
              return (
              <div
                key={p.id}
                onClick={() => setCurrentPromptId(p.id)}
                className={`group/item flex items-center gap-0 rounded-xl border cursor-pointer transition ${currentPromptId === p.id ? 'bg-slate-800/60 border-slate-700' : 'bg-transparent border-transparent hover:bg-slate-800/20'}`}
              >
                {/* 左侧：hover 时出现的勾选圆圈 */}
                <div className={`flex-shrink-0 transition-all duration-200 overflow-hidden flex items-center ${selectedPromptIds.length > 0 ? 'w-[22px]' : 'w-0 group-hover/item:w-[22px]'}`}>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSelect(p.id); }}
                    className={`w-[18px] h-[18px] rounded-full border text-[9px] flex items-center justify-center transition flex-shrink-0 ${
                      selectedPromptIds.includes(p.id)
                        ? 'bg-blue-500 border-blue-400 text-white'
                        : 'border-slate-600 hover:border-slate-400 text-transparent'
                    }`}
                  >
                    {selectedPromptIds.includes(p.id) ? '✓' : ''}
                  </button>
                </div>
                {/* 左侧：hover 时出现的上下移动方块按钮 */}
                <div className="flex-shrink-0 w-0 group-hover/item:w-[22px] transition-all duration-200 overflow-hidden">
                  <div className="flex flex-col w-[22px]">
                    {!isFirst ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); movePromptInList(p.id, 'up'); }}
                        className="w-[22px] h-[22px] flex items-center justify-center bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 text-[10px] transition rounded-t-md leading-none"
                        title="上移"
                      >▲</button>
                    ) : (
                      <div className="w-[22px] h-[22px]" />
                    )}
                    {!isLast ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); movePromptInList(p.id, 'down'); }}
                        className="w-[22px] h-[22px] flex items-center justify-center bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 text-[10px] transition rounded-b-md leading-none"
                        title="下移"
                      >▼</button>
                    ) : (
                      <div className="w-[22px] h-[22px]" />
                    )}
                  </div>
                </div>

                {/* 主体内容 */}
                <div className="flex items-center gap-2.5 overflow-hidden flex-1 p-2.5">
                  {p.images?.length > 0 && <img src={p.images[0]} className="w-7 h-7 object-cover rounded-md flex-shrink-0" />}
                  <div className="overflow-hidden flex-1 flex items-center gap-1 min-w-0">
                    {(p.stars || 0) > 0 && <span className="text-amber-400 text-[10px] font-medium flex-shrink-0">{p.stars}★</span>}
                    <h4 className="text-xs font-semibold truncate">{p.title || <span className="text-slate-600 italic font-normal">未命名空词条</span>}</h4>
                  </div>
                </div>

                {/* 右侧：hover 时出现的删除按钮 */}
                <button
                  onClick={(e) => { e.stopPropagation();
                    if (listSource === 'favorites') {
                      setFavorites(prev => prev.filter(f => !(f.promptId === p.id)));
                    } else {
                      if(confirm(`确认删除词条 [${p.title || '未命名'}] ？`)) { setPrompts(prompts.filter(item => item.id !== p.id)); if(currentPromptId === p.id) setCurrentPromptId(''); }
                    }
                  }}
                  className="opacity-0 group-hover/item:opacity-100 flex-shrink-0 p-2 text-slate-600 hover:text-rose-400 text-[10px] transition rounded"
                  title={listSource === 'favorites' ? '从收藏夹移除' : '删除词条'}
                >{listSource === 'favorites' ? '✕' : '🗑️'}</button>
              </div>
            );})}
          </div>
          {selectedPromptIds.length > 0 && (
            <div className="flex-shrink-0 border-t border-slate-700/50 bg-slate-900/90 backdrop-blur px-3 py-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">已选 {selectedPromptIds.length} 条</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setMoveMode('batch'); setShowMovePicker(true); }}
                  className="px-2.5 py-1 text-[10px] bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 rounded transition"
                >📂 移动到...</button>
                <button
                  onClick={() => setSelectedPromptIds([])}
                  className="px-2 py-1 text-[10px] text-slate-500 hover:text-slate-300 transition"
                >取消选择</button>
              </div>
            </div>
          )}
        </section>

        <div onMouseDown={(e) => startResize('list', e)} className="w-1 bg-slate-600/30 hover:bg-blue-500/50 cursor-col-resize flex-shrink-0 transition duration-150" />

        {/* 3. 中央主控面板 */}
        <main
          className="flex-1 flex flex-col overflow-hidden"
          onPasteCapture={(e) => {
            if (!isEditMode) return;
            const items = e.clipboardData?.items;
            if (!items) return;
            for (const item of items) {
              if (item.type.startsWith('image/')) {
                e.preventDefault();
                e.stopPropagation();
                const file = item.getAsFile();
                if (file) uploadImageToCloud(file);
                return;
              }
            }
          }}
        >
          {activePrompt ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="h-12 border-b border-slate-800/30 px-6 flex items-center justify-between flex-shrink-0 bg-black/10">
                <div className="flex bg-black/40 p-0.5 rounded-lg border border-slate-800/60">
                  <button onClick={() => { setIsEditMode(false); setIsRenamingTitle(false); }} className={`px-3 py-1 text-xs rounded-md transition ${!isEditMode ? 'bg-slate-800 text-blue-400 font-medium' : 'text-slate-500 hover:text-slate-300'}`}>阅读模式</button>
                  <button onClick={() => setIsEditMode(true)} className={`px-3 py-1 text-xs rounded-md transition ${isEditMode ? 'bg-slate-800 text-blue-400 font-medium' : 'text-slate-500 hover:text-slate-300'}`}>编辑模式</button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5" title="点亮星星评分">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => handleContentChange('stars', activePrompt.stars === n ? 0 : n)}
                        className={`text-sm transition ${n <= (activePrompt.stars || 0) ? 'text-amber-400' : 'text-slate-600 hover:text-amber-300'}`}
                      >
                        {n <= (activePrompt.stars || 0) ? '★' : '☆'}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowFavPicker(!showFavPicker)}
                      className={`px-2 py-1 text-xs transition rounded-md flex items-center gap-1 ${isPromptFavorited(activePrompt?.id) ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400 hover:text-amber-400 border border-transparent'}`}
                      title="收藏到..."
                    >💾 收藏</button>
                    {showFavPicker && activePrompt && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowFavPicker(false)} />
                        <div className="absolute top-full right-0 mt-1 w-48 bg-slate-950 border border-slate-700 rounded-xl p-3 shadow-2xl z-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-amber-400">收藏到文件夹</span>
                            <button onClick={() => setShowFavPicker(false)} className="text-slate-500 hover:text-slate-300 text-[10px]">✕</button>
                          </div>
                          <PickFavFolder nodes={favFolders} promptId={activePrompt.id} favorites={favorites} onToggle={(promptId, favFolderId) => {
                            setFavorites(prev => {
                              const exists = prev.find(f => f.promptId === promptId && f.favFolderId === favFolderId);
                              if (exists) return prev.filter(f => !(f.promptId === promptId && f.favFolderId === favFolderId));
                              return [...prev, { id: `fav-${Date.now()}`, promptId, favFolderId }];
                            });
                            setShowFavPicker(false);
                          }} />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => { setMoveMode('single'); setShowMovePicker(!showMovePicker); }}
                      className="px-2 py-1 text-xs transition rounded-md flex items-center gap-1 bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-600"
                      title="移动到文件夹"
                    >📂 移动到</button>
                    {showMovePicker && moveMode === 'single' && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => { setShowMovePicker(false); setMoveMode('single'); }} />
                        <div className="absolute top-full right-0 mt-1 w-48 bg-slate-950 border border-slate-700 rounded-xl p-3 shadow-2xl z-50 max-h-64 overflow-y-auto">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-blue-400">选择目标文件夹</span>
                            <button onClick={() => { setShowMovePicker(false); setMoveMode('single'); }} className="text-slate-500 hover:text-slate-300 text-[10px]">✕</button>
                          </div>
                          <PickFolder nodes={folders} onSelect={(folderId) => {
                            setPrompts(prev => prev.map(p => p.id === activePrompt.id ? { ...p, folderId } : p));
                            setShowMovePicker(false);
                            setCurrentFolder(folderId);
                          }} />
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(activePrompt.content); setCopyPromptStatus('✓ 已复制'); setTimeout(() => setCopyPromptStatus('📋 复制提示词'), 1500); }}
                    className="px-3 py-1 text-xs text-white transition rounded-md bg-green-600 hover:bg-green-500 flex items-center gap-1.5"
                  >
                    {copyPromptStatus}
                  </button>
                  <button onClick={() => setScratchpadText(prev => prev ? `${prev}\n\n${activePrompt.content}` : activePrompt.content)} className={`px-3 py-1 text-xs text-white transition rounded-md ${currentTheme.accent}`}>🚀 发送到暂存</button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col space-y-4">
                {isEditMode ? (
                  <input type="text" value={activePrompt.title} onChange={(e) => handleContentChange('title', e.target.value)} className={`w-full ${currentTheme.inputBg} border ${currentTheme.border} rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none`} placeholder="在此输入词条标题..." />
                ) : (
                  <div>
                    {isRenamingTitle ? (
                      <input
                        type="text" value={activePrompt.title} onChange={(e) => handleContentChange('title', e.target.value)}
                        onBlur={() => setIsRenamingTitle(false)} onKeyDown={(e) => { if(e.key === 'Enter') setIsRenamingTitle(false); }} autoFocus
                        className="w-full bg-black/50 border border-blue-500 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none"
                      />
                    ) : (
                      <h1 onDoubleClick={() => setIsRenamingTitle(true)} className="text-base font-bold cursor-pointer hover:text-blue-400 transition flex items-center gap-1.5" title="双击重命名">
                        {(activePrompt.stars || 0) > 0 && <span className="text-amber-400 text-xs">{'★'.repeat(activePrompt.stars)}{'☆'.repeat(5 - activePrompt.stars)}</span>}
                        {activePrompt.title || <span className="text-slate-600 italic">双击命名此词条...</span>}
                      </h1>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-1.5">
                  {activePrompt.tags?.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      #{t}
                      {isEditMode && <button onClick={() => handleContentChange('tags', activePrompt.tags.filter(tag => tag !== t))} className="hover:text-rose-400 font-bold ml-1">✕</button>}
                    </span>
                  ))}
                  {isEditMode && (
                    <input type="text" value={newTagInput} onChange={(e) => setNewTagInput(e.target.value)} onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTagInput.trim()) { handleContentChange('tags', [...(activePrompt.tags || []), newTagInput.trim()]); setNewTagInput(''); }
                    }} placeholder="+ 标签" className={`bg-black/40 border ${currentTheme.border} rounded px-2 py-0.5 text-[11px] w-16 focus:outline-none`} />
                  )}
                </div>

                {/* 左侧内容区 + 右侧图片区 左右分栏 */}
                <div id="prompt-split-container" className="flex-1 flex min-h-[200px] gap-0">
                  {/* 左侧列：提示词 (上) + 参考例子 (下) 垂直堆叠 */}
                  <div id="prompt-ref-stack" style={{ width: `${contentImageRatio * 100}%` }} className="flex flex-col min-h-0 min-w-0">
                    {/* 提示词核心 */}
                    <div style={{ height: `${promptSplitRatio * 100}%` }} className="flex flex-col space-y-1 min-h-0">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex-shrink-0">提示词核心 Payload 字段</label>
                      {isEditMode ? (
                        <textarea value={activePrompt.content} onChange={(e) => handleContentChange('content', e.target.value)} className={`w-full flex-1 ${currentTheme.inputBg} border ${currentTheme.border} rounded-xl p-4 font-mono text-xs leading-relaxed focus:outline-none resize-none`} placeholder="输入Prompt文本..." />
                      ) : (
                        <div className={`w-full flex-1 ${currentTheme.inputBg}/40 border ${currentTheme.border} rounded-xl p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-y-auto select-text`}>{activePrompt.content || <span className="text-slate-600 italic">内容为空</span>}</div>
                      )}
                    </div>

                    {/* 水平拖拽分割线：提示词 / 参考例子 */}
                    <div
                      onMouseDown={startPromptResize}
                      className="h-2 flex-shrink-0 flex items-center justify-center cursor-row-resize group/split transition my-0.5"
                    >
                      <div className="h-0.5 flex-1 bg-slate-500/50 group-hover/split:bg-blue-400 rounded-full transition-colors mx-2" />
                      <div className="flex-shrink-0 text-[8px] text-slate-400 group-hover/split:text-slate-200 transition-colors select-none px-1">⋮</div>
                      <div className="h-0.5 flex-1 bg-slate-500/50 group-hover/split:bg-blue-400 rounded-full transition-colors mx-2" />
                    </div>

                    {/* 参考例子 */}
                    <div style={{ height: `${(1 - promptSplitRatio) * 100}%` }} className="flex flex-col space-y-1 min-h-0">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex-shrink-0">📖 提示词参考例子</label>
                      {isEditMode ? (
                        <textarea value={activePrompt.reference || ''} onChange={(e) => handleContentChange('reference', e.target.value)} className={`w-full flex-1 bg-amber-500/5 border border-dashed ${currentTheme.border} rounded-xl p-3 font-mono text-[11px] leading-relaxed focus:outline-none focus:border-amber-500/40 resize-none text-slate-400 placeholder:text-slate-600`} placeholder="参考示例，复制时排除..." />
                      ) : (
                        <div className={`w-full flex-1 bg-amber-500/5 border border-dashed border-slate-700/40 rounded-xl p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap overflow-y-auto select-text text-slate-400`}>{activePrompt.reference || <span className="text-slate-600 italic">暂无参考示例</span>}</div>
                      )}
                    </div>
                  </div>

                  {/* 垂直拖拽分割线：内容区 / 图片区 */}
                  <div
                    onMouseDown={startContentImageResize}
                    className="w-2 flex-shrink-0 flex flex-col items-center justify-center cursor-col-resize group/split transition mx-0.5"
                  >
                    <div className="w-0.5 flex-1 bg-slate-500/50 group-hover/split:bg-blue-400 rounded-full transition-colors" />
                    <div className="flex-shrink-0 text-[8px] text-slate-400 group-hover/split:text-slate-200 transition-colors select-none py-1">⋮</div>
                    <div className="w-0.5 flex-1 bg-slate-500/50 group-hover/split:bg-blue-400 rounded-full transition-colors" />
                  </div>

                  {/* 右侧列：图片大图展示 */}
                  <div style={{ width: `${(1 - contentImageRatio) * 100}%` }} className="flex flex-col space-y-1.5 min-h-0 min-w-0">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex-shrink-0">
                      {isEditMode ? '🎉 效果图 (拖拽排序 / 第一张为封面)' : '效果图预览 (点击放大)'}
                    </label>
                    <div className="flex-1 overflow-y-auto">
                      <div className="flex flex-col gap-2 pb-1">
                        {activePrompt.images?.map((img, idx) => (
                          <div
                            key={idx}
                            draggable={isEditMode}
                            onDragStart={(e) => handleImgDragStart(e, idx)}
                            onDragOver={(e) => handleImgDragOver(e, idx)}
                            onDrop={(e) => handleImgDrop(e, idx)}
                            onClick={() => { if(!isEditMode) setLightbox({ isOpen: true, images: activePrompt.images, index: idx }); }}
                            className={`relative rounded-lg overflow-hidden border bg-black ${currentTheme.border} transition-all duration-150 ${isEditMode ? 'cursor-move opacity-90 hover:opacity-100 hover:border-blue-500 border-dashed border-slate-700' : 'cursor-zoom-in hover:scale-[1.02]'}`}
                          >
                            <img src={img} alt="preview" className="w-full h-auto block pointer-events-none select-none" />
                            {isEditMode && <button onClick={(e) => { e.stopPropagation(); handleContentChange('images', activePrompt.images.filter((_, i) => i !== idx)); }} className="absolute top-1 right-1 bg-rose-600/90 hover:bg-rose-500 text-white text-[10px] px-1 rounded shadow z-10">✕</button>}
                            {idx === 0 && <span className="absolute bottom-0 left-0 right-0 bg-blue-600/95 text-white text-[9px] text-center font-bold py-0.5">封面</span>}
                          </div>
                        ))}
                        {isEditMode && (
                          <label
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('image/')) uploadImageToCloud(f); }}
                            className={`h-24 border border-dashed ${currentTheme.border} hover:border-slate-400 transition rounded-lg flex flex-col items-center justify-center cursor-pointer bg-black/10`}
                          >
                            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) uploadImageToCloud(e.target.files[0]); }} className="hidden" disabled={isUploading} />
                            <span className="text-[11px] text-slate-500">{isUploading ? '上传中...' : '+ 添加图片'}</span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">请载入树状资产以启动主中央控制区</div>
          )}
        </main>

        <div className="flex flex-col items-center flex-shrink-0 group/handle">
          <button
            onClick={() => setIsScratchpadCollapsed(!isScratchpadCollapsed)}
            className={`w-4 h-4 mt-14 rounded-full border transition cursor-pointer text-[8px] flex items-center justify-center ${isScratchpadCollapsed ? 'bg-slate-700 border-slate-500 text-slate-300 hover:text-white hover:border-blue-500' : 'bg-slate-800/60 border-slate-500/60 text-slate-400 hover:bg-slate-700 hover:border-slate-400 hover:text-white'}`}
            title={isScratchpadCollapsed ? "展开暂存板" : "隐藏暂存板"}
          >
            {isScratchpadCollapsed ? '◀' : '▶'}
          </button>
          <div
            onMouseDown={(e) => startResize('scratchpad', e)}
            className="w-1 flex-1 bg-slate-600/30 hover:bg-blue-500/50 cursor-col-resize transition duration-150"
          />
        </div>

        {/* 4. 右侧暂存拼装面板栏 */}
        <aside style={{ width: isScratchpadCollapsed ? 0 : panelWidths.scratchpad }} className={`border-l ${currentTheme.border} flex flex-col ${currentTheme.panel} flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out`}>
          <div className="p-4 flex items-center justify-between border-b border-slate-800/40 flex-shrink-0">
            <span className="text-xs font-semibold text-slate-500">📋 暂存组合板</span>
            {scratchpadText && <button onClick={() => setScratchpadText('')} className="text-[10px] text-slate-500 hover:text-rose-400">清空</button>}
          </div>
          <div className="flex-1 p-3 flex flex-col overflow-hidden">
            <textarea placeholder="追加拼接代码块..." value={scratchpadText} onChange={(e) => setScratchpadText(e.target.value)} className={`w-full flex-1 ${currentTheme.inputBg} border ${currentTheme.border} rounded-xl p-3 text-xs font-mono resize-none focus:outline-none`} />
            <button onClick={() => { navigator.clipboard.writeText(scratchpadText); setCopyStatus('已完成静默复制 ✓'); setTimeout(() => setCopyStatus('复制到剪贴板'), 1500); }} disabled={!scratchpadText} className={`mt-3 w-full py-2 text-xs font-medium rounded-lg transition ${scratchpadText ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>{copyStatus}</button>
          </div>
        </aside>

      </div>

      {/* 5. 全屏图片灯箱 — 滚轮缩放 + 左键拖拽 */}
      {lightbox.isOpen && (
        <div
          onClick={() => {
            if (!lbSuppressClick.current) setLightbox(p => ({ ...p, isOpen: false }));
            lbSuppressClick.current = false;
          }}
          className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[999] flex items-center justify-center p-4"
        >
          {/* 关闭按钮 */}
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox(p => ({ ...p, isOpen: false })); }}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white text-lg transition z-20"
            title="关闭 (Esc)"
          >✕</button>

          <button onClick={(e) => { e.stopPropagation(); setLightbox(p => ({ ...p, index: (p.index - 1 + p.images.length) % p.images.length })); }} className="absolute left-6 text-xl text-slate-500 hover:text-white bg-slate-900/50 p-3 rounded-full z-10">◀</button>
          <div
            className="flex flex-col items-center justify-center space-y-2 select-none"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setLbTransform(prev => {
                const delta = -e.deltaY * 0.002;
                const raw = prev.scale + delta * prev.scale;
                const newScale = isNaN(raw) ? prev.scale : Math.max(0.5, Math.min(8, raw));
                return { scale: newScale, x: prev.x, y: prev.y };
              });
            }}
            onMouseDown={(e) => {
              if (e.button === 0) {
                e.preventDefault();
                e.stopPropagation();
                lbDidDrag.current = false;
                lbPanRef.current = { startX: e.clientX, startY: e.clientY, panX: lbTransform.x, panY: lbTransform.y };
                const handleMove = (me) => {
                  if (!lbPanRef.current) return;
                  const dx = me.clientX - lbPanRef.current.startX;
                  const dy = me.clientY - lbPanRef.current.startY;
                  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) lbDidDrag.current = true;
                  const nx = lbPanRef.current.panX + dx;
                  const ny = lbPanRef.current.panY + dy;
                  setLbTransform(prev => ({ ...prev, x: isNaN(nx) ? prev.x : nx, y: isNaN(ny) ? prev.y : ny }));
                };
                const cleanup = () => {
                  if (lbDidDrag.current) {
                    lbSuppressClick.current = true;
                    requestAnimationFrame(() => { lbSuppressClick.current = false; });
                  }
                  lbDidDrag.current = false;
                  lbPanRef.current = null;
                  window.removeEventListener('mousemove', handleMove);
                  window.removeEventListener('mouseup', cleanup);
                };
                window.addEventListener('mousemove', handleMove);
                window.addEventListener('mouseup', cleanup);
              }
            }}
          >
            <img
              src={lightbox.images[lightbox.index]}
              alt="lightbox"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl border border-slate-800/40"
              style={{
                transform: `translate(${lbTransform.x}px, ${lbTransform.y}px) scale(${lbTransform.scale})`,
                cursor: lbPanRef.current ? 'grabbing' : (lbTransform.scale > 1.05 ? 'grab' : 'default'),
              }}
            />
            <div className="px-3 py-1 bg-slate-900/80 backdrop-blur rounded-full text-slate-400 text-[10px] font-mono border border-slate-800">
              {lightbox.index + 1} / {lightbox.images.length}
              {lbTransform.scale !== 1 && <span className="ml-2 text-blue-400">{Math.round(lbTransform.scale * 100)}%</span>}
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(p => ({ ...p, index: (p.index + 1) % p.images.length })); }} className="absolute right-6 text-xl text-slate-500 hover:text-white bg-slate-900/50 p-3 rounded-full z-10">▶</button>
        </div>
      )}

    </div>
  );
}