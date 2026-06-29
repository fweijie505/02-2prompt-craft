// 诊断脚本：检查 Supabase 里是否有数据
// 使用方法：在浏览器控制台里粘贴运行

const SUPABASE_URL = 'https://ryydiqbaxlctcjmujcgi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_sPe8qw3kndeY1eADJA0gaw_Yu9-RGwN';

async function check() {
  const tables = ['folders_data', 'prompts_data', 'fav_folders_data', 'favorites_data'];
  for (const table of tables) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&eq=user_id,user-promptcraft-shared`;
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=representation'
    };
    try {
      const res = await fetch(url, { headers });
      const data = await res.json();
      console.log(`[${table}]`, data.length, 'rows:', JSON.stringify(data.slice(0, 2), null, 2));
    } catch (e) {
      console.error(`[${table}] Error:`, e.message);
    }
  }
}

check();
