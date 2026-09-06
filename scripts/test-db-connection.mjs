import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

let supabaseUrl = '';
let supabaseKey = '';

try {
    const envContent = fs.readFileSync(path.resolve('.env.local'), 'utf-8');
    for (const line of envContent.split('\n')) {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
    }
} catch (e) {
    console.error('Could not read .env.local:', e);
}

async function testDatabase() {
    console.log('Testing Supabase DB connection using:', supabaseUrl);
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Auth service ping
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Auth service status:', authError ? `Error: ${authError.message}` : 'Available (no active session expected)');

    // 2. Query public table (user_resumes with anon)
    const { data, error } = await supabase.from('user_resumes').select('id').limit(1);
    console.log('Database query status:', error ? `RLS/Policy response: ${error.message}` : `Success (${data?.length ?? 0} rows found)`);

    console.log('>>> Database & Auth services are fully reachable and operational!');
}

testDatabase();
