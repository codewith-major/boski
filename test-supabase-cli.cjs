require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function run() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

  if (!process.env.VITE_SUPABASE_URL) {
    console.log("No VITE_SUPABASE_URL provided in environment. Connection test will fail.");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase.from('schools').select('id').limit(1);
  if (error) {
    console.error("Connection failed with error:", error.message);
  } else {
    console.log("Connection succeeded! Data:", data);
  }
}

run();
