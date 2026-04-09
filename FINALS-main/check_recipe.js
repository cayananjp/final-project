const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://dwtywmfxpisnoazlrmas.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3dHl3bWZ4cGlzbm9hemxybWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDI3ODg2OSwiZXhwIjoyMDg5ODU0ODY5fQ.limeZio-Dx1FaEn4Vw_NkWF63zVdem4XvV7GWj3iBEo'
);

async function test() {
    const { data, error } = await supabase.from('recipes').select('*');
    if (error) {
        console.error("DB Error:", error);
    } else {
        const userRecipes = data.filter(d => d.created_by !== null);
        console.log("Found User Recipes Count:", userRecipes.length);
        userRecipes.forEach(r => {
            console.log(`Title: ${r.title}`);
            console.log(`  is_user_recipe: ${r.is_user_recipe}`);
            console.log(`  is_approved: ${r.is_approved}`);
            console.log(`  status: ${r.status}`);
            console.log(`  created_by: ${r.created_by}`);
            console.log(`  id: ${r.id}`);
        });
    }
}
test();
