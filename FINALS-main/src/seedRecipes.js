import { supabase } from './supabaseClient';
import { RECIPES } from './data/recipes';

export const seedRecipes = async () => {
    console.log('Seeding recipes...');
    
    const { error } = await supabase
        .from('recipes')
        .insert(RECIPES.map(r => ({
            id: r.id,
            title: r.title,
            category: r.category,
            cuisine: r.cuisine,
            time: r.time,
            description: r.description,
            image: r.image,
            required: r.required,
            ingredients: r.ingredients,
            steps: r.steps,
            video: r.video
        })));

    if (!error) {
        console.log('✅ All 60 recipes seeded successfully!');
    } else {
        console.error('❌ Seed error:', error);
    }
};
