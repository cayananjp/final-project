const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log("Testing full select...");
    const { data, error } = await supabase.from('profiles').select('id, username').limit(10);
    console.log("Data:", data);
    console.log("Error:", error);
}

test();
