const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://dwtywmfxpisnoazlrmas.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3dHl3bWZ4cGlzbm9hemxybWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDI3ODg2OSwiZXhwIjoyMDg5ODU0ODY5fQ.limeZio-Dx1FaEn4Vw_NkWF63zVdem4XvV7GWj3iBEo'
);

async function test() {
    const { data, error } = await supabase.from('recipes').select('id, title, image, step_photos').order('created_at', { ascending: false }).limit(1);
    if (error) {
        console.error("DB Error:", error);
    } else {
        const r = data[0];
        console.log(`Title: ${r.title}`);
        console.log(`Main Image URL: ${r.image}`);
        console.log(`Step Photos Array?`, Array.isArray(r.step_photos));
        if (r.step_photos && r.step_photos.length > 0) {
            console.log(`Step 1 Photo:`, r.step_photos[0]);
            console.log(`Step 1 Photo Type:`, typeof r.step_photos[0]);
            console.log(`Step 1 Length:`, r.step_photos[0]?.length);
        }
    }
}
test();
