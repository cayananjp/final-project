const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://dwtywmfxpisnoazlrmas.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3dHl3bWZ4cGlzbm9hemxybWFzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDI3ODg2OSwiZXhwIjoyMDg5ODU0ODY5fQ.limeZio-Dx1FaEn4Vw_NkWF63zVdem4XvV7GWj3iBEo'
);

async function test() {
    const { data, error } = await supabase.from('recipes').select('id, ingredients, steps').order('created_at', { ascending: false }).limit(1);
    if (!error && data[0]) {
        console.log("Ingredients Type:", typeof data[0].ingredients, "isArray:", Array.isArray(data[0].ingredients));
        console.log("Steps Type:", typeof data[0].steps, "isArray:", Array.isArray(data[0].steps));
    }
}
test();
