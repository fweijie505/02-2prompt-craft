import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ryydiqbaxlctcjmujcgi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_sPe8qw3kndeY1eADJA0gaw_Yu9-RGwN';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
