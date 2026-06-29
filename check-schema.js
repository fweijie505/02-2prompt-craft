import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ryydiqbaxlctcjmujcgi.supabase.co',
  'sb_publishable_sPe8qw3kndeY1eADJA0gaw_Yu9-RGwN'
);

async function checkSchema() {
  console.log('=== Checking table schemas ===\n');

  const tables = ['prompts_data', 'folders_data', 'favorites_data', 'fav_folders_data'];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`❌ ${table}:`, error.message);
      continue;
    }

    if (data && data.length > 0) {
      console.log(`📊 ${table} columns:`, Object.keys(data[0]));
      console.log('  sample:', JSON.stringify(data[0], null, 2).substring(0, 500));
    } else {
      console.log(`📊 ${table}: empty, no schema info`);
    }
    console.log();
  }
}

checkSchema().catch(console.error);
