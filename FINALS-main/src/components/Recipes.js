import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Recipe = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Catch the specific dish data passed from the Home page
    const dish = location.state?.recipeData;

    if (!dish) {
        return (
            <div className="text-center mt-[100px] font-inter">
                <h2 className="text-gray-900">Oops! No recipe selected.</h2>
                <p className="text-gray-500">Please select a recipe from the home page.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="bg-orange-600 text-white px-5 py-2.5 border-none rounded-[10px] cursor-pointer mt-5"
                >
                    Go Back Home
                </button>
            </div>
        );
    }

    return (
        <div className="px-[5%] py-5 max-w-[800px] mx-auto font-inter">
            
            {/* Back Button */}
            <button 
                onClick={() => navigate(-1)} 
                className="bg-none border-none text-orange-600 text-base font-bold cursor-pointer p-0 mb-5 flex items-center gap-[5px]"
            >
                &larr; Back
            </button>

            {/* Recipe Header (Image & Title) */}
            <img 
                src={dish.image} 
                alt={dish.title} 
                className="w-full h-[350px] object-cover rounded-3xl shadow-lg" 
            />
            
            <h1 className="text-[2.5rem] text-gray-900 mt-5 mb-2.5 font-black">
                {dish.title}
            </h1>
            
            <p className="text-gray-500 text-[1.1rem] mb-5 leading-relaxed">
                {dish.description}
            </p>

            {/* Recipe Meta Info */}
            <div className="flex flex-wrap gap-[15px] text-gray-500 mb-[30px] text-base font-medium">
                <span className="bg-gray-100 px-4 py-2 rounded-[20px]">⏱️ {dish.time}</span>
                <span className="bg-gray-100 px-4 py-2 rounded-[20px]">{dish.rating || "⭐⭐⭐⭐⭐"}</span>
                <span className="bg-gray-100 px-4 py-2 rounded-[20px]">🏷️ {dish.category}</span>
                <span className="bg-gray-100 px-4 py-2 rounded-[20px]">🌍 {dish.cuisine}</span>
            </div>

            {/* Dynamic Ingredients & Instructions */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[30px] mb-10">
                <div className="bg-orange-50 p-[25px] rounded-[20px]">
                    <h3 className="text-orange-600 mt-0 text-2xl border-b-2 border-orange-300 pb-2.5">
                        Ingredients
                    </h3>
                    <ul className="text-gray-700 leading-8 pl-5">
                        {dish.ingredients?.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                        ))}
                    </ul>
                </div>

                <div className="p-[25px]">
                    <h3 className="text-gray-900 mt-0 text-2xl border-b-2 border-gray-200 pb-2.5">
                        Instructions
                    </h3>
                    <ol className="text-gray-700 leading-8 pl-5">
                        {dish.steps?.map((step, index) => (
                            <li key={index} className="mb-2.5">{step}</li>
                        ))}
                    </ol>
                </div>
            </div>

            {/* Video Tutorial Section */}
            {dish.video && (
                <div className="mt-5 mb-10">
                    <h3 className="text-gray-900 text-2xl mb-[15px]">Video Tutorial</h3>
                    <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-[20px] shadow-lg">
                        <iframe 
                            src={dish.video} 
                            title={`${dish.title} Video Tutorial`}
                            className="absolute inset-0 w-full h-full border-none"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Recipe;