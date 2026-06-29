import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ryydiqbaxlctcjmujcgi.supabase.co',
  'sb_publishable_sPe8qw3kndeY1eADJA0gaw_Yu9-RGwN'
);

async function checkFolders() {
  const { data } = await supabase
    .from('folders_data')
    .select('*')
    .eq('user_id', 'user-promptcraft-shared')
    .order('created_at');

  console.log('=== All folders_data ===');
  for (const f of data) {
    console.log(`  id=${f.id}  name="${f.name}"  icon="${f.icon}"  children=${JSON.stringify(f.children)}  is_open=${f.is_open}`);
  }

  console.log('\n=== All prompts_data (folder_id mapping) ===');
  const { data: prompts } = await supabase
    .from('prompts_data')
    .select('id, title, folder_id')
    .eq('user_id', 'user-promptcraft-shared');

  for (const p of prompts) {
    console.log(`  id=${p.id}  title="${p.title}"  folder_id=${p.folder_id}`);
  }
}

checkFolders().catch(console.error);
