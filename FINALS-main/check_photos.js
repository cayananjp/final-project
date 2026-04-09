const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://dwtywmfxpisnoazlrmas.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3dHl3bWZ4cGlzbm9hemxybWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDI3ODg2OSwiZXhwIjoyMDg5ODU0ODY5fQ.limeZio-Dx1FaEn4Vw_NkWF63zVdem4XvV7GWj3iBEo'
);

async function test() {
    const { data, error } = await supabase.from('recipes').select('id, title, step_photos, marinating_step_photos').order('created_at', { ascending: false }).limit(5);
    if (error) {
        console.error("DB Error:", error);
    } else {
        console.log("Recent Recipes Photos:");
        data.forEach(r => {
            console.log(`Title: ${r.title}`);
            console.log(`  Step Photos:`, r.step_photos);
            console.log(`  Marinating Step Photos:`, r.marinating_step_photos);
        });
    }
}
test();
