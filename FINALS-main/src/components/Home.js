import React, { useState, useRef } from 'react';
import { Camera, Circle, Clock, Image, Mic, Star, Utensils, UtensilsCrossed } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { RECIPES } from '../data/recipes'; 
import { toast } from 'react-hot-toast';

const Home = () => {
    const navigate = useNavigate();
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false); // Added for AI processing state
    const carouselRef = useRef(null);

    const getMealTime = () => {
        const hour = new Date().getHours();
        if (hour < 5)  return "a midnight snack";
        if (hour < 11) return "breakfast";
        if (hour < 14) return "lunch";
        if (hour < 18) return "an afternoon snack";
        return "dinner";
    };

    const ALL_DISHES = RECIPES.map(recipe => ({
        ...recipe,
        rating: recipe.id === "lechon-kawali" ? 4.5 : 5.0
    }));

    const [activeFilter, setActiveFilter] = useState('All');
    const categories = ['All', 'Pork', 'Beef', 'Chicken', 'Vegetables', 'Seafood', 'Snacks'];

    const filteredDishes = activeFilter === 'All' 
        ? ALL_DISHES 
        : ALL_DISHES.filter(dish => dish.category === activeFilter);

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // --- UPDATED VOICE LOGIC ---
    const startVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Your browser doesn't support voice input.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            setIsListening(false);
            setIsProcessing(true);
            
            toast.loading("Gemini is parsing your items...", { id: 'voice-process' });

            try {
                // Use your Render backend to extract ingredients from the raw speech
                const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://savorsense-backend-uyx0.onrender.com';
                
                const response = await fetch(`${backendUrl}/api/process-voice`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: transcript })
                });

                const data = await response.json();

                if (data.success && data.ingredients.length > 0) {
                    toast.success(`Detected: ${data.ingredients.join(', ')}`, { id: 'voice-process' });
                    navigate('/pantry', { state: { voiceIngredients: data.ingredients } });
                } else {
                    toast.error("No ingredients recognized. Try again!", { id: 'voice-process' });
                }
            } catch (error) {
                console.error("Voice AI Error:", error);
                toast.error("AI Service busy. Try again in a second.", { id: 'voice-process' });
            } finally {
                setIsProcessing(false);
            }
        };

        recognition.onerror = (event) => {
            setIsListening(false);
            toast.error("Microphone error. Please try again.");
        };

        recognition.start();
    };

    return (
        <div className="px-[2%] max-w-[1200px] mx-auto font-inter pb-10">
            {/* Hero */}
            <div className="bg-orange-50 rounded-3xl p-10 text-center mb-6 mt-8">
                <div className="bg-white inline-block p-2 rounded-full mb-2 text-orange-600"><Utensils className="w-6 h-6" /></div>
                <h1 className="text-[2.5rem] m-0 mb-2 text-gray-900 font-black">
                    What's for <span className="text-orange-600">{getMealTime()}</span> today?
                </h1>
                <p className="text-gray-500 max-w-[500px] mx-auto text-[0.95rem]">
                    Discover delicious Filipino recipes using the ingredients you already have in your kitchen.
                </p>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 mb-14">
                <div 
                    onClick={() => navigate('/pantry')} 
                    className="bg-orange-600 text-white p-8 rounded-3xl text-center cursor-pointer transition-all duration-300 shadow-lg hover:-translate-y-1.5"
                >
                    <div className="flex justify-center mb-2"><Camera className="w-10 h-10" /></div>
                    <h3 className="m-0 mb-[5px] text-xl font-bold">Scan Ingredients</h3>
                    <p className="m-0 text-sm opacity-90">Snap a photo to detect</p>
                </div>

                <div 
                    onClick={() => navigate('/pantry')} 
                    className="bg-white border border-gray-100 p-8 rounded-3xl text-center cursor-pointer transition-all duration-300 shadow-sm hover:-translate-y-1.5"
                >
                    <div className="flex justify-center mb-2"><Image className="w-10 h-10 text-orange-500" /></div>
                    <h3 className="m-0 mb-[5px] text-gray-900 text-xl font-bold">Upload Picture</h3>
                    <p className="m-0 text-sm text-gray-500">Choose from gallery</p>
                </div>

                <div 
                    onClick={isProcessing ? null : startVoiceInput} 
                    className={`${isListening ? 'bg-red-50 border-red-500 animate-pulse' : 'bg-white border-gray-100'} border p-8 rounded-3xl text-center cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-sm`}
                >
                    <div className="flex justify-center mb-2">
                        {isListening ? (
                            <Circle className="w-8 h-8 fill-red-500 text-red-500" />
                        ) : isProcessing ? (
                            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                        ) : (
                            <Mic className="w-8 h-8 text-gray-700" />
                        )}
                    </div>
                    <h3 className={`m-0 mb-[5px] text-xl font-bold ${isListening ? 'text-red-500' : 'text-gray-900'}`}>
                        {isProcessing ? 'Processing...' : 'Voice Input'}
                    </h3>
                    <p className={`m-0 text-sm ${isListening ? 'text-red-500' : 'text-gray-500'}`}>
                        {isListening ? 'Listening...' : 'Tell me what you have'}
                    </p>
                </div>
            </div>

            {/* Popular Dishes Section */}
            <div>
                <div className="mb-4">
                    <h2 className="text-2xl text-gray-900 m-0 font-extrabold">Popular Filipino Dishes</h2>
                </div>
                <div className="flex gap-2.5 mb-8 flex-wrap">
                    {categories.map(category => (
                        <button 
                            key={category} 
                            className={`px-[18px] py-2 rounded-[20px] border cursor-pointer transition-all duration-200 font-semibold text-sm ${
                                activeFilter === category 
                                    ? 'bg-orange-400 text-white border-orange-400' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100 hover:-translate-y-0.5'
                            }`}
                            onClick={() => setActiveFilter(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                
                <div className="relative group mx-[-8px] px-[8px] md:mx-0 md:px-0">
                    <button 
                        onClick={() => scrollCarousel('left')} 
                        className="absolute left-[-5px] md:-left-5 top-1/2 -translate-y-[60%] z-10 w-[45px] h-[45px] rounded-full border border-gray-200 bg-white/95 backdrop-blur-sm text-orange-600 flex items-center justify-center transition-all shadow-md hover:scale-110 opacity-80 md:opacity-0 md:group-hover:opacity-100"
                    >
                        &larr;
                    </button>

                    <div className="flex overflow-x-auto gap-5 pb-4 pt-2 snap-x snap-mandatory scrollbar-hide px-2 md:px-0" ref={carouselRef}>
                        {filteredDishes.length > 0 ? (
                            filteredDishes.map((dish) => (
                                <div key={dish.id} className="flex-none w-full md:w-[250px] snap-center md:snap-start">
                                    <div 
                                        className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
                                        onClick={() => navigate(`/recipe/${dish.id}`, { state: { recipeData: dish } })}
                                    >
                                        <img src={dish.image} alt={dish.title} className="w-full h-[180px] object-cover border-b border-gray-100" />
                                        <div className="p-[15px]">
                                            <h3 className="text-[1.1rem] font-bold text-gray-900 m-0 mb-2 line-clamp-1">{dish.title}</h3>
                                            <div className="text-xs text-gray-500 flex justify-between items-center">
                                                <span><Clock className="w-4 h-4 inline-block mr-1" /> {dish.time}</span>
                                                <div className="flex text-orange-400">
                                                    <Star className="w-3.5 h-3.5 fill-current" />
                                                    <span className="ml-1 text-gray-600 font-bold">{dish.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center p-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 w-full flex flex-col items-center">
                                <UtensilsCrossed className="w-16 h-16 text-gray-400 mb-4" />
                                <h3 className="text-gray-700 m-0 mb-2 text-[1.4rem]">No dishes found</h3>
                                <button onClick={() => setActiveFilter('All')} className="text-orange-600 font-bold underline bg-transparent border-none cursor-pointer">Clear Filters</button>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => scrollCarousel('right')} 
                        className="absolute right-[-5px] md:-right-5 top-1/2 -translate-y-[60%] z-10 w-[45px] h-[45px] rounded-full border border-gray-200 bg-white/95 backdrop-blur-sm text-orange-600 flex items-center justify-center transition-all shadow-md hover:scale-110 opacity-80 md:opacity-0 md:group-hover:opacity-100"
                    >
                        &rarr;
                    </button>
                </div>
            </div>

            <footer className="mt-14 pt-8 border-t border-gray-100 text-center">
                <p className="m-0 mb-2 font-bold text-gray-700">SavorSense © {new Date().getFullYear()}</p>
                <p className="m-0 text-gray-500 text-[0.9rem]">Discover Filipino Recipes, One Ingredient at a Time</p>
            </footer>
        </div>
    );
};

export default Home;