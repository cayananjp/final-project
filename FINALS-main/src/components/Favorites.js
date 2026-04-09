import React, { useState, useEffect } from 'react';
import { Clock, Flame, Star, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { RECIPES } from '../data/recipes';

const Favorites = () => {
    const [savedRecipes, setSavedRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFavorites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchFavorites = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            navigate('/login');
            return;
        }

        const { data, error } = await supabase
            .from('saved_recipes')
            .select('recipe_id')
            .eq('user_id', user.id)
            .limit(20);

        if (!error && data) {
            const recipeIds = data.map(item => item.recipe_id);
            const favoriteRecipes = RECIPES.filter(recipe => recipeIds.includes(recipe.id));
            setSavedRecipes(favoriteRecipes);
        }
        setLoading(false);
    };

    // Remove a recipe from favorites
    const removeFavorite = async (recipeId) => {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase
            .from('saved_recipes')
            .delete()
            .eq('user_id', user.id)
            .eq('recipe_id', recipeId);
        fetchFavorites();
    };

    if (loading) {
        return <div className="text-center p-12">Loading favorites...</div>;
    }

    return (
        <div className="max-w-[1200px] mx-auto mt-10 px-5">
            <h1 className="text-orange-600 mb-5"><Star className="w-4 h-4 inline-block" /> Your Favorite Recipes</h1>
            
            {savedRecipes.length === 0 ? (
                <p>You haven't saved any recipes yet. Browse recipes and click "Save to Favorites"!</p>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
                    {savedRecipes.map(recipe => (
                        <div 
                            key={recipe.id} 
                            onClick={() => navigate(`/recipe/${recipe.id}`, { state: { recipeData: recipe } })} 
                            className="cursor-pointer bg-white rounded-2xl overflow-hidden shadow-md"
                        >
                            <img src={recipe.image} alt={recipe.title} className="w-full h-[180px] object-cover" />
                            <div className="p-[15px]">
                                <h3 className="m-0 mb-2">{recipe.title}</h3>
                                <p className="text-gray-500 text-[0.9rem]">{recipe.description}</p>
                                <div className="flex gap-2.5 text-xs text-orange-600">
                                    <span><Clock className="w-4 h-4 inline-block" /> {recipe.time}</span>
                                    <span><Flame className="w-4 h-4 inline-block" /> {recipe.cuisine}</span>
                                </div>
                                {/* Remove Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFavorite(recipe.id);
                                    }}
                                    className="mt-2.5 bg-red-100 text-red-600 border-none px-3 py-1.5 rounded-lg cursor-pointer font-semibold w-full"
                                >
                                    <Trash2 className="w-4 h-4 inline-block" /> Remove from Favorites
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorites;