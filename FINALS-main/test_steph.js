const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://dwtywmfxpisnoazlrmas.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3dHl3bWZ4cGlzbm9hemxybWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDI3ODg2OSwiZXhwIjoyMDg5ODU0ODY5fQ.limeZio-Dx1FaEn4Vw_NkWF63zVdem4XvV7GWj3iBEo'
);

async function test() {
    // Exact Javascript from Marketplace fetchRecipes
    const { data, error } = await supabase
        .from('recipes')
        .select('id, title, description, image, price, category, time, created_by, profiles(username)')
        .eq('is_user_recipe', true)
        .eq('is_approved', true)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
        
    console.log("Error:", error);
    console.log("Data length:", data ? data.length : 0);
    console.log("Data:", JSON.stringify(data, null, 2));
}
test();
