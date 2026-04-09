const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://dwtywmfxpisnoazlrmas.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3dHl3bWZ4cGlzbm9hemxybWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDI3ODg2OSwiZXhwIjoyMDg5ODU0ODY5fQ.limeZio-Dx1FaEn4Vw_NkWF63zVdem4XvV7GWj3iBEo'
);

async function test() {
    console.log("Fetching recipes...");
    const { data: recipes, error } = await supabase.from('recipes').select('id, title, created_by, is_user_recipe, status, is_approved');
    console.log("Recipes:", recipes, error);

    console.log("Fetching profiles...");
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
    console.log("Profiles:", profiles, pError);
}

test();
