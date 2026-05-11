import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

// Load .env.local manually (no dotenv dependency).
const env = readFileSync('.env.local', 'utf-8');
for (const line of env.split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) {
    let val = m[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const { data, error } = await supabase
  .from('brands')
  .select('name, secteur, ton, singularite, piliers_narratifs')
  .limit(1);
if (error) {
  console.error('FAIL colonnes brands:', error.message);
  process.exit(1);
}
console.log('OK colonnes brands : name, secteur, ton, singularite, piliers_narratifs');
console.log('Sample row count:', data?.length ?? 0);
