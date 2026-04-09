import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';

const PublicProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            try {
                // Fetch basic public profile info
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, username, bio, created_at')
                    .eq('id', userId)
                    .single();

                if (profileError) throw profileError;
                setProfile(profileData);

                // Fetch their uploaded recipes (only approved ones)
                const { data: recipeData, error: recipeError } = await supabase
                    .from('recipes')
                    .select('*')
                    .eq('created_by', userId)
                    .eq('status', 'approved');

                if (recipeError) throw recipeError;
                setRecipes(recipeData || []);

            } catch (err) {
                console.error("Error fetching public profile:", err);
                toast.error("Could not load this user profile.");
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId, navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) return null;

    const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

    return (
        <div className="max-w-[1000px] mx-auto p-5 md:p-8 font-sans">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-8 md:p-12 border border-orange-200 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200 rounded-full blur-[80px] opacity-50 -scale-y-100 mix-blend-multiply"></div>
                
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10 text-center md:text-left">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-[3rem] text-white font-bold shadow-xl shrink-0 border-4 border-white">
                        {profile.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    
                    <div className="flex-1 mt-2">
                        <h1 className="m-0 text-3xl md:text-4xl text-gray-900 font-extrabold tracking-tight">{profile.username}</h1>
                        <p className="text-gray-500 mt-2 mb-4 font-medium">Joined SavorSense in {joinDate}</p>
                        <p className="text-gray-700 text-lg max-w-2xl">{profile.bio || 'This user is busy cooking up something delicious and hasn\'t written a bio yet!'}</p>
                    </div>
                </div>
            </div>

            {/* User's Recipes Section */}
            <div className="mb-4">
                <h2 className="text-2xl text-gray-900 m-0 font-extrabold mb-6 border-b border-gray-100 pb-4">
                    Recipes by {profile.username} <span className="text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-sm ml-2">{recipes.length}</span>
                </h2>
                
                {recipes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {recipes.map(recipe => (
                            <div 
                                onClick={() => navigate('/marketplace', { state: { previewRecipe: recipe } })}
                                key={recipe.id}
                                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_-5px_rgba(234,88,12,0.15)] no-underline flex flex-col"
                            >
                                <div className="h-[180px] w-full relative">
                                    <img src={recipe.image || '/pictures/adobo.png'} alt={recipe.title} className="w-full h-full object-cover" />
                                    {recipe.price > 0 && (
                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-orange-600 font-bold px-3 py-1 rounded-lg text-sm shadow-sm">
                                            ₱{recipe.price.toFixed(2)}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="m-0 mb-2 text-lg text-gray-900 font-bold line-clamp-1">{recipe.title}</h3>
                                    <div className="flex justify-between items-center text-sm font-medium text-gray-500 mt-auto pt-2 border-t border-gray-50">
                                        <span className="text-orange-600">{recipe.category}</span>
                                        <span>⏱️ {recipe.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 w-full flex flex-col items-center">
                        <div className="text-[3.5rem] mb-4 opacity-80">👨‍🍳</div>
                        <h3 className="text-gray-700 m-0 mb-2 text-[1.4rem]">No recipes yet</h3>
                        <p className="text-gray-500 max-w-[300px]">This user hasn't uploaded any public recipes to the SavorSense marketplace.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default PublicProfile;
