import React, { useState, useEffect } from 'react';
import { Camera, Check, Clock, Flame, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { RECIPES } from '../data/recipes'; 
import { logTransaction } from '../utils/logger';

const Pantry = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    
    const [ingredients, setIngredients] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [status, setStatus] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                fetchPantry();
            } else {
                setLoading(false);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchPantry = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }
        const { data, error } = await supabase
            .from('pantry_items')
            .select('ingredient_name')
            .eq('user_id', user.id)
            .limit(50);
        if (!error && data) {
            setIngredients(data.map(item => item.ingredient_name));
        }
        setLoading(false);
    };

    useEffect(() => {
        if (location.state && location.state.voiceIngredients) {
            const newItems = location.state.voiceIngredients;
            addMultipleIngredients(newItems);
            setStatus(`🎤 Added via Voice: ${newItems.join(', ')}`);
            window.history.replaceState({}, document.title);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    const addMultipleIngredients = async (newItems) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        for (const item of newItems) {
            const { error } = await supabase
                .from('pantry_items')
                .insert([{ user_id: user.id, ingredient_name: item.toLowerCase() }]);
            if (!error) {
                await logTransaction('add_ingredient', { ingredient: item.toLowerCase() });
            }
        }
        fetchPantry();
    };

    const addIngredient = async () => {
        const val = inputValue.trim().toLowerCase();
        if (!val) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setStatus("Please log in to add ingredients"); return; }
        if (ingredients.includes(val)) { setStatus("Ingredient already in pantry"); return; }
        const { error } = await supabase
            .from('pantry_items')
            .insert([{ user_id: user.id, ingredient_name: val }]);
        if (!error) {
            setInputValue("");
            setStatus("✓ Ingredient added!");
            await logTransaction('add_ingredient', { ingredient: val });
            fetchPantry();
        } else {
            setStatus("✗ Error adding ingredient");
        }
    };

    const removeIngredient = async (item) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { error } = await supabase
            .from('pantry_items')
            .delete()
            .eq('user_id', user.id)
            .eq('ingredient_name', item);
        if (!error) {
            setStatus("🗑️ Ingredient removed");
            await logTransaction('remove_ingredient', { ingredient: item });
            fetchPantry();
        } else {
            console.error("Error removing ingredient:", error);
        }
    };

    const clearAllIngredients = async () => {
        if (!window.confirm('Are you sure you want to remove all ingredients?')) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { error } = await supabase
            .from('pantry_items')
            .delete()
            .eq('user_id', user.id);
        if (!error) {
            setIngredients([]);
            setStatus('🗑️ All ingredients cleared!');
            await logTransaction('clear_pantry', { message: 'All ingredients removed' });
        } else {
            setStatus('✗ Error clearing pantry');
        }
    };

    const handleAiScan = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        console.log('📸 Starting scan...', { fileName: file.name, fileSize: file.size, fileType: file.type });
        
        setIsScanning(true);
        setStatus("🔍 Analyzing pantry items...");
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            // FIXED: Using your live Render URL for the cloud deployment
            const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://savorsense-backend-uyx0.onrender.com';
            console.log('🔗 Connecting to Backend:', backendUrl);
            
            const response = await fetch(`${backendUrl}/api/scan-ingredients`, {
                method: 'POST',
                body: formData,
            });
            
            console.log('📡 Response status:', response.status);
            const data = await response.json();
            
            if (data.success && data.ingredients && data.ingredients.length > 0) {
                await addMultipleIngredients(data.ingredients);
                await logTransaction('scan_ingredients', { ingredients: data.ingredients });
                setStatus(`✓ Found ${data.ingredients.length} items! Added to pantry.`);
            } else {
                setStatus(data.error || "No food ingredients detected. Try a clearer photo.");
            }
        } catch (error) {
            console.error("❌ Scan error:", error);
            setStatus("❌ Unable to connect to scanning service. Check if backend is live.");
        } finally {
            setIsScanning(false);
            e.target.value = null; 
        }
    };

    const filteredRecipes = RECIPES.map(recipe => {
        const required = recipe.required || recipe.ingredients || [];
        if (ingredients.length === 0 || required.length === 0) {
            return { ...recipe, matchPercentage: 0 };
        }
        let matchCount = 0;
        required.forEach(reqItem => {
            const reqStr = reqItem.toLowerCase();
            const hasMatch = ingredients.some(pantryItem => 
                pantryItem.includes(reqStr) || reqStr.includes(pantryItem)
            );
            if (hasMatch) matchCount++;
        });
        const percent = Math.round((matchCount / required.length) * 100);
        return { ...recipe, matchPercentage: percent };
    }).filter(recipe => recipe.matchPercentage > 0) 
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen font-semibold text-orange-600">
                Loading your pantry...
            </div>
        );
    }

    return (
        <div className="flex max-w-[1400px] mx-auto p-8 gap-8 items-start max-[900px]:flex-col bg-gray-50 min-h-screen">
            {/* Sidebar */}
            <aside className="w-80 shrink-0 sticky top-8 max-[900px]:w-full max-[900px]:static">
                <div className="bg-white p-6 rounded-[20px] shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="m-0 text-xl font-bold text-gray-800">Your Pantry</h2>
                        {ingredients.length > 0 && (
                            <button
                                onClick={clearAllIngredients}
                                className="bg-red-50 text-red-600 border-none px-3 py-1.5 rounded-lg cursor-pointer text-xs font-semibold hover:bg-red-100 transition-colors"
                            >
                                <Trash2 className="w-4 h-4 inline-block mr-1" /> Clear All
                            </button>
                        )}
                    </div>

                    {/* AI Photo Scanner */}
                    <div className="mb-5 p-4 bg-orange-50 border-2 border-dashed border-orange-300 rounded-xl text-center">
                        <h3 className="text-xs font-bold text-orange-800 mb-2 tracking-widest uppercase">
                            <Camera className="w-4 h-4 inline-block mr-1" /> AI Ingredient Scanner
                        </h3>
                        <input type="file" id="photo-input" accept="image/*" className="hidden" onChange={handleAiScan} disabled={isScanning} />
                        <button 
                            type="button" 
                            onClick={() => document.getElementById('photo-input').click()}
                            disabled={isScanning}
                            className={`${isScanning ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'} text-white border-none p-3 rounded-lg w-full font-bold transition-all shadow-sm cursor-pointer`}
                        >
                            {isScanning ? "Analyzing Image..." : "Scan Groceries"}
                        </button>
                        <div className="text-[10px] mt-2 text-orange-700 font-medium italic">{status}</div>
                    </div>

                    {/* Manual Input */}
                    <div className="flex items-center mb-6">
                        <input 
                            type="text" 
                            placeholder="Add manually..." 
                            value={inputValue} 
                            onChange={(e) => setInputValue(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && addIngredient()} 
                            className="flex-1 py-2.5 px-4 border border-gray-200 rounded-l-lg text-sm outline-none focus:border-orange-500"
                        />
                        <button className="bg-orange-500 text-white border-none px-4 py-2.5 rounded-r-lg font-bold cursor-pointer hover:bg-orange-600" onClick={addIngredient}>+</button>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {ingredients.map((item, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-gray-200">
                                {item} 
                                <button className="text-gray-400 hover:text-red-500 font-bold border-none bg-transparent p-0 leading-none cursor-pointer" onClick={() => removeIngredient(item)}>×</button>
                            </span>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Cook with what you have</h1>
                        <p className="text-gray-500">Matching your {ingredients.length} items with our recipe database</p>
                    </div>
                    <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                        {filteredRecipes.length} Matches Found
                    </div>
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
                    {filteredRecipes.length > 0 ? (
                        filteredRecipes.map((recipe) => (
                            <div key={recipe.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer" onClick={() => navigate(`/recipe/${recipe.id}`, { state: { recipeData: recipe } })}>
                                <div className="relative h-48">
                                    <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
                                    <div className={`absolute top-4 left-4 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${recipe.matchPercentage === 100 ? 'bg-green-500' : 'bg-orange-500'}`}>
                                        {recipe.matchPercentage}% Match
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{recipe.title}</h3>
                                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{recipe.description}</p>
                                    <div className="flex justify-between items-center text-xs text-gray-400 font-bold">
                                        <span><Clock className="w-3.5 h-3.5 inline mr-1" /> {recipe.time}</span>
                                        <span className="text-orange-500 underline uppercase">{recipe.cuisine}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 col-span-full">
                            <p className="text-gray-400 font-medium">No recipes match your ingredients yet. Try scanning more items!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Pantry;