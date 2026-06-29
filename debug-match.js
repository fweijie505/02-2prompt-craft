import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ryydiqbaxlctcjmujcgi.supabase.co',
  'sb_publishable_sPe8qw3kndeY1eADJA0gaw_Yu9-RGwN'
);

async function debugMatch() {
  const uid = 'user-promptcraft-shared';

  const { data: folders } = await supabase
    .from('folders_data').select('*').eq('user_id', uid).order('created_at', { ascending: false });

  const { data: prompts } = await supabase
    .from('prompts_data').select('*').eq('user_id', uid).order('created_at', { ascending: false });

  console.log('=== Folder IDs (camelCase) ===');
  for (const f of folders) console.log('  ', JSON.stringify(f.id), 'type:', typeof f.id);

  console.log('\n=== Prompt folderIds ===');
  for (const p of prompts) {
    console.log('  prompt id:', JSON.stringify(p.id), '| folderId:', JSON.stringify(p.folderId), '| type:', typeof p.folderId);
    console.log('    folder_id (raw):', JSON.stringify(p['folder_id']), '| type:', typeof p['folder_id']);
  }

  console.log('\n=== Match check ===');
  const folderIds = new Set(folders.map(f => f.id));
  for (const p of prompts) {
    const matches = folderIds.has(p.folderId);
    console.log(`  ${p.title}: folderId="${p.folderId}" in set? ${matches}`);
  }
}

debugMatch().catch(console.error);
