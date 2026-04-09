require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

async function test() {
    console.log("Checking recipes table...");
    const { data: recipes, error } = await supabase.from('recipes').select('title, status, is_approved, is_user_recipe, created_by');
    
    if (error) {
        console.error("Error fetching:", error);
    } else {
        console.log("ALL RECIPES IN DB:");
        console.table(recipes);
    }
}
test();
