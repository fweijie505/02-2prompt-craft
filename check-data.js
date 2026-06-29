import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ryydiqbaxlctcjmujcgi.supabase.co',
  'sb_publishable_sPe8qw3kndeY1eADJA0gaw_Yu9-RGwN'
);

async function checkData() {
  console.log('=== Checking Supabase data ===\n');

  const tables = ['prompts_data', 'folders_data', 'favorites_data', 'fav_folders_data'];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', 'user-promptcraft-shared')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`❌ ${table}:`, error.message);
      continue;
    }

    console.log(`📊 ${table}: ${data?.length || 0} rows`);
    if (data && data.length > 0) {
      for (const row of data.slice(0, 3)) {
        console.log('  ', JSON.stringify(row));
      }
      if (data.length > 3) console.log(`  ... and ${data.length - 3} more`);
    }
    console.log();
  }
}

checkData().catch(console.error);
