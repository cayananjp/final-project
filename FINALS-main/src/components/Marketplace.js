import React, { useState, useEffect } from 'react';
import { Banknote, BarChart, Camera, CheckCircle, ChefHat, ClipboardList, Clock, CookingPot, Eye, Folder, Hourglass, Lock, Search, ShoppingCart, User, UtensilsCrossed, Video, Volume2, Wallet, XCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';
import { logTransaction } from '../utils/logger';
const Marketplace = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [wallet, setWallet] = useState(0);
    const [recipes, setRecipes] = useState([]);
    const [purchased, setPurchased] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(null);
    const [activeTab, setActiveTab] = useState('browse');
    const [myRecipes, setMyRecipes] = useState([]);
    const [earnings, setEarnings] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [previewRecipe, setPreviewRecipe] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const CATEGORIES = ['All', 'Chicken', 'Beef', 'Pork', 'Seafood', 'Vegetables', 'Snacks'];

    useEffect(() => {
        initialize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (location.state && location.state.previewRecipe) {
            setPreviewRecipe(location.state.previewRecipe);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, location.pathname]);

    const handleTopUp = async () => {
        if (!user) return;
        const newBalance = wallet + 500;
        const { error } = await supabase.from('profiles').update({ wallet: newBalance }).eq('id', user.id);
        if (!error) {
            setWallet(newBalance);
            toast.success('₱500 added to your wallet!');
        }
    };

    const handleWithdraw = async () => {
        if (!user) return;
        if (wallet < 500) {
            toast.error('Not enough demo funds to remove!');
            return;
        }
        const newBalance = wallet - 500;
        const { error } = await supabase.from('profiles').update({ wallet: newBalance }).eq('id', user.id);
        if (!error) {
            setWallet(newBalance);
            toast.success('₱500 removed from your wallet.');
        }
    };

    const initialize = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login'); return; }
        setUser(user);

        await Promise.all([
            fetchWallet(user.id),
            fetchRecipes(user.id),
            fetchPurchased(user.id),
            fetchMyRecipes(user.id),
            fetchTransactions(user.id),
        ]);
        setLoading(false);
    };

    const fetchWallet = async (userId) => {
        const { data } = await supabase.from('profiles').select('wallet').eq('id', userId).single();
        setWallet(data?.wallet || 0);
    };

    const fetchRecipes = async (userId) => {
        const { data, error } = await supabase
            .from('recipes')
            .select('id, title, description, image, price, category, time, created_by')
            .eq('is_user_recipe', true)
            .eq('is_approved', true)
            .eq('status', 'approved')
            .neq('created_by', userId)
            .order('created_at', { ascending: false });
        
        if (!error && data) {
            setRecipes(data);
        }
    };

    const fetchPurchased = async (userId) => {
        const { data } = await supabase.from('purchased_recipes').select('recipe_id').eq('user_id', userId);
        setPurchased(data?.map(p => p.recipe_id) || []);
    };

    const fetchMyRecipes = async (userId) => {
        const { data } = await supabase
            .from('recipes')
            .select('*')
            .eq('is_user_recipe', true)
            .eq('created_by', userId)
            .order('created_at', { ascending: false });
        setMyRecipes(data || []);
    };

    const fetchTransactions = async (userId) => {
        const { data } = await supabase
            .from('transactions')
            .select('*')
            .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
            .order('created_at', { ascending: false });
        setTransactions(data || []);
        const earned = data?.filter(t => t.seller_id === userId).reduce((sum, t) => sum + t.amount, 0) || 0;
        setEarnings(earned);
    };

    const handleBuy = async (recipe) => {
        if (!user) return;
        if (wallet < recipe.price) {
            toast.error(`❌ Insufficient balance! You need ₱${recipe.price} but only have ₱${wallet.toFixed(2)}.`);
            return;
        }
        const confirm = window.confirm(
            `Buy "${recipe.title}" for ₱${recipe.price}?\n\nYour balance: ₱${wallet.toFixed(2)}\nAfter purchase: ₱${(wallet - recipe.price).toFixed(2)}`
        );
        if (!confirm) return;

        setBuying(recipe.id);
        try {
            const { error: buyerError } = await supabase.from('profiles').update({ wallet: wallet - recipe.price }).eq('id', user.id);
            if (buyerError) throw buyerError;

            const { data: sellerProfile } = await supabase.from('profiles').select('wallet').eq('id', recipe.created_by).single();
            await supabase.from('profiles').update({ wallet: (sellerProfile?.wallet || 0) + recipe.price }).eq('id', recipe.created_by);

            await supabase.from('transactions').insert([{
                buyer_id: user.id,
                seller_id: recipe.created_by,
                recipe_id: recipe.id,
                recipe_title: recipe.title,
                amount: recipe.price,
            }]);

            await supabase.from('purchased_recipes').insert([{ user_id: user.id, recipe_id: recipe.id }]);

            // Log the purchase activity
            await logTransaction('purchase_recipe', {
                recipe_id: recipe.id,
                recipe_title: recipe.title,
                amount: recipe.price,
                seller_id: recipe.created_by
            });

            setWallet(prev => prev - recipe.price);
            setPurchased(prev => [...prev, recipe.id]);
            setPreviewRecipe(null);
            toast.success(<span><CheckCircle className="w-5 h-5 inline-block text-green-600" /> Purchase successful! You now have access to "{recipe.title}".</span>);
            await fetchTransactions(user.id);
        } catch (error) {
            toast.error('Transaction failed: ' + error.message);
        } finally {
            setBuying(null);
        }
    };

    const filteredRecipes = recipes
        .filter(r => activeCategory === 'All' || r.category === activeCategory)
        .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="w-10 h-10 border-[3px] border-gray-100 border-t-orange-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    const statusBadge = (status) => {
        const styles = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: <><Hourglass className="w-5 h-5 inline-block" /> Pending Approval</> },
            approved: { bg: 'bg-green-100', text: 'text-green-600', label: <><CheckCircle className="w-5 h-5 inline-block text-green-600" /> Live</> },
            rejected: { bg: 'bg-red-100', text: 'text-red-600', label: <><XCircle className="w-5 h-5 inline-block" /> Rejected</> },
        };
        const s = styles[status] || styles.pending;
        return (
            <span className={`${s.bg} ${s.text} px-2.5 py-[3px] rounded-[20px] text-xs font-bold`}>
                {s.label}
            </span>
        );
    };

    return (
        <div className="max-w-[1200px] mx-auto mt-8 px-5 pb-16">

            {/* Recipe Preview Modal */}
            {previewRecipe && (
                <div className="fixed inset-0 bg-black/70 z-[9999] flex justify-center items-start p-8 overflow-y-auto" onClick={() => setPreviewRecipe(null)}>
                    <div className="bg-white rounded-[20px] w-full max-w-[600px] overflow-hidden" onClick={e => e.stopPropagation()}>

                        {/* Hero image */}
                        <div className="relative h-[280px]">
                            <img src={previewRecipe.image || '/pictures/default-recipe.jpg'} alt={previewRecipe.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                            <button onClick={() => setPreviewRecipe(null)} className="absolute top-4 right-4 bg-black/40 border-none text-white w-9 h-9 rounded-full cursor-pointer text-xl font-bold">×</button>
                            <div className="absolute bottom-4 left-6 text-white">
                                <h2 className="m-0 text-[1.8rem] drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">{previewRecipe.title}</h2>
                                <p className="m-0 mt-1 opacity-90 text-sm">by {previewRecipe.profiles?.username || 'Anonymous'}</p>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Tags */}
                            <div className="flex gap-2 flex-wrap mb-4">
                                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-[20px] text-xs font-semibold"><Folder className="w-4 h-4 inline-block" /> {previewRecipe.category}</span>
                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-[20px] text-xs"><Clock className="w-4 h-4 inline-block" /> {previewRecipe.time}</span>
                            </div>

                            {/* Description */}
                            <p className="text-gray-700 leading-relaxed mb-6">{previewRecipe.description}</p>

                            {/* Locked content teaser */}
                            <div className="bg-gray-50 rounded-[14px] p-5 mb-6 border border-dashed border-gray-300">
                                <p className="m-0 mb-2.5 font-bold text-gray-700"><Lock className="w-5 h-5 inline-block" /> Purchase to unlock:</p>
                                <div className="flex flex-col gap-2">
                                    {[
                                        <><ClipboardList className="w-6 h-6 inline-block" /> Full ingredients list with measurements</>,
                                        <><ChefHat className="w-6 h-6 inline-block" /> Step-by-step cooking instructions</>,
                                        <><Camera className="w-6 h-6 inline-block" /> Step photos showing how it should look</>,
                                        <><Video className="w-5 h-5 inline-block" /> Full cooking video tutorial</>,
                                        <><Volume2 className="w-6 h-6 inline-block" /> Audio assistant for hands-free cooking</>,
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-gray-500 text-sm">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price + Buy */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-[2rem] font-black text-orange-600">₱{previewRecipe.price}</div>
                                    <div className="text-xs text-gray-400">Your wallet: ₱{wallet.toFixed(2)}</div>
                                </div>
                                {wallet < previewRecipe.price && (
                                    <div className="bg-red-100 text-red-600 px-3.5 py-2 rounded-lg text-xs font-semibold">
                                        <XCircle className="w-5 h-5 inline-block text-red-600" /> Insufficient balance
                                    </div>
                                )}
                            </div>

                            {purchased.includes(previewRecipe.id) ? (
                                <button
                                    onClick={() => { setPreviewRecipe(null); navigate(`/recipe/${previewRecipe.id}`); }}
                                    className="w-full py-3.5 bg-green-500 text-white border-none rounded-xl cursor-pointer font-bold text-base"
                                >
                                    <Eye className="w-5 h-5 inline-block" /> View Full Recipe
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleBuy(previewRecipe)}
                                    disabled={buying === previewRecipe.id || wallet < previewRecipe.price}
                                    className={`w-full py-3.5 ${wallet < previewRecipe.price ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : buying === previewRecipe.id ? 'bg-gray-300 cursor-wait' : 'bg-orange-600 cursor-pointer'} text-white border-none rounded-xl font-bold text-base`}
                                >
                                    {buying === previewRecipe.id ? (
                                        <><Hourglass className="w-5 h-5 inline-block" /> Processing...</>
                                    ) : (
                                        <><ShoppingCart className="w-5 h-5 inline-block" /> Buy for ₱{previewRecipe.price}</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-start md:items-center mb-6 flex-col md:flex-row gap-4">
                <div>
                    <h1 className="m-0 text-orange-600"><ShoppingCart className="w-8 h-8 inline-block" /> Recipe Marketplace</h1>
                    <p className="text-gray-500 mt-1 mb-0">Buy and sell recipes with the community</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-orange-50 border border-orange-200 rounded-xl overflow-hidden shadow-sm">
                        <button onClick={handleWithdraw} className="bg-transparent text-orange-600 px-3 py-2.5 font-bold border-none border-r border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors" title="Withdraw ₱500">-</button>
                        <div className="px-4 py-2.5 font-black text-orange-600 bg-white">
                            <Wallet className="w-5 h-5 inline-block" /> ₱{wallet.toFixed(2)}
                        </div>
                        <button onClick={handleTopUp} className="bg-transparent text-orange-600 px-3 py-2.5 font-bold border-none border-l border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors" title="Add ₱500">+</button>
                    </div>
                    <button onClick={() => navigate('/upload-recipe')} className="bg-orange-600 text-white border-none px-[18px] py-2.5 rounded-xl cursor-pointer font-bold shadow-sm hover:bg-orange-700 transition-colors">
                        + Sell a Recipe
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-gray-100 p-1.5 rounded-xl w-fit flex-wrap">
                {[
                    { key: 'browse', label: <><UtensilsCrossed className="w-5 h-5 inline-block" /> Browse</> },
                    { key: 'purchased', label: <><CheckCircle className="w-5 h-5 inline-block text-green-600" /> Purchased</> },
                    { key: 'myrecipes', label: <><CookingPot className="w-5 h-5 inline-block" /> My Recipes</> },
                    { key: 'transactions', label: <><BarChart className="w-5 h-5 inline-block" /> Transactions</> },
                ].map(tab => (
                    <button 
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-2.5 rounded-lg border-none cursor-pointer font-semibold text-sm ${activeTab === tab.key ? 'bg-orange-600 text-white' : 'bg-white text-gray-700'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* BROWSE TAB */}
            {activeTab === 'browse' && (
                <>
                    {/* Search + Filter */}
                    <div className="mb-3">
                        <input
                            type="text"
                            placeholder="🔍 Search recipes..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-[0.95rem] font-[inherit] box-border"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap mb-5">
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-1.5 rounded-[20px] border border-gray-200 cursor-pointer text-xs transition-all duration-200 ${activeCategory === cat ? 'bg-orange-600 text-white font-bold border-orange-600' : 'bg-white text-gray-700'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    {filteredRecipes.length === 0 ? (
                        <div className="text-center p-16 text-gray-400">
                            <div className="text-[3rem]"><CookingPot className="w-6 h-6" /></div>
                            <h3>No approved recipes yet!</h3>
                            <p>Be the first to sell a recipe.</p>
                            <button onClick={() => navigate('/upload-recipe')} className="bg-orange-600 text-white border-none px-6 py-3 rounded-xl cursor-pointer font-semibold">
                                + Upload Your Recipe
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
                            {filteredRecipes.map(recipe => {
                                const isPurchased = purchased.includes(recipe.id);
                                return (
                                    <div
                                        key={recipe.id}
                                        className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                                        onClick={() => setPreviewRecipe(recipe)}
                                    >
                                        {/* Image with lock overlay */}
                                        <div className="relative h-[200px]">
                                            <img src={recipe.image || '/pictures/default-recipe.jpg'} alt={recipe.title} className="w-full h-full object-cover" />

                                            {/* Price badge */}
                                            <div className="absolute top-2.5 right-2.5 bg-orange-600 text-white px-3 py-1 rounded-[20px] font-bold text-sm">
                                                ₱{recipe.price}
                                            </div>

                                            {/* Owned badge */}
                                            {isPurchased && (
                                                <div className="absolute top-2.5 left-2.5 bg-green-500 text-white px-3 py-1 rounded-[20px] font-bold text-xs">
                                                    <CheckCircle className="w-5 h-5 inline-block text-green-600" /> Owned
                                                </div>
                                            )}

                                            {/* Lock overlay if not purchased */}
                                            {!isPurchased && (
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-3">
                                                    <span className="bg-black/60 text-white px-3.5 py-1 rounded-[20px] text-xs font-semibold">
                                                        <Lock className="w-5 h-5 inline-block" /> Tap to preview
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card info */}
                                        <div className="p-[15px]">
                                            <h3 className="m-0 mb-1.5 text-[1.05rem] text-gray-900">{recipe.title}</h3>
                                            <p className="text-gray-500 text-xs m-0 mb-2.5 line-clamp-2">
                                                {recipe.description}
                                            </p>
                                            <div className="flex justify-between items-center text-xs text-gray-400">
                                                <div className="flex gap-2.5">
                                                    <span><Clock className="w-4 h-4 inline-block" /> {recipe.time}</span>
                                                    <span><Folder className="w-4 h-4 inline-block" /> {recipe.category}</span>
                                                </div>
                                                <span><User className="w-4 h-4 inline-block" /> {recipe.profiles?.username || 'Anonymous'}</span>
                                            </div>

                                            {/* Action button */}
                                            <button
                                                onClick={e => { e.stopPropagation(); isPurchased ? navigate(`/recipe/${recipe.id}`) : setPreviewRecipe(recipe); }}
                                                className={`mt-3 w-full py-2.5 ${isPurchased ? 'bg-green-500' : 'bg-orange-600'} text-white border-none rounded-lg cursor-pointer font-semibold text-sm`}
                                            >
                                                {isPurchased ? (
                                                    <><Eye className="w-5 h-5 inline-block" /> View Recipe</>
                                                ) : (
                                                    <><ShoppingCart className="w-5 h-5 inline-block" /> Buy for ₱{recipe.price}</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* PURCHASED TAB */}
            {activeTab === 'purchased' && (
                <>
                    <h2><CheckCircle className="w-5 h-5 inline-block text-green-600" /> Recipes You Own</h2>
                    {purchased.length === 0 ? (
                        <div className="text-center p-12 text-gray-400">
                            <div className="text-[3rem]"><ShoppingCart className="w-16 h-16 inline-block mx-auto" /></div>
                            <p>You haven't purchased any recipes yet.</p>
                            <button onClick={() => setActiveTab('browse')} className="bg-orange-600 text-white border-none px-5 py-2.5 rounded-xl cursor-pointer font-semibold">Browse Recipes</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
                            {recipes.filter(r => purchased.includes(r.id)).map(recipe => (
                                <div key={recipe.id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 cursor-pointer" onClick={() => navigate(`/recipe/${recipe.id}`)}>
                                    <div className="relative h-40">
                                        <img src={recipe.image || '/pictures/default-recipe.jpg'} alt={recipe.title} className="w-full h-full object-cover" />
                                        <div className="absolute top-2.5 left-2.5 bg-green-500 text-white px-3 py-1 rounded-[20px] font-bold text-xs"><CheckCircle className="w-5 h-5 inline-block text-green-600" /> Owned</div>
                                    </div>
                                    <div className="p-[15px]">
                                        <h3 className="m-0 mb-1.5">{recipe.title}</h3>
                                        <div className="flex justify-between items-center">
                                            <span className="text-green-500 font-semibold text-xs">₱{recipe.price} paid</span>
                                            <span className="text-orange-600 font-semibold text-xs">View Full Recipe →</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* MY RECIPES TAB */}
            {activeTab === 'myrecipes' && (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="m-0"><CookingPot className="w-6 h-6 inline-block" /> Recipes You're Selling</h2>
                        <div className="bg-green-100 text-green-600 px-4 py-2 rounded-lg font-bold">
                            <Banknote className="w-5 h-5 inline-block" /> Total Earned: ₱{earnings.toFixed(2)}
                        </div>
                    </div>
                    {myRecipes.length === 0 ? (
                        <div className="text-center p-12 text-gray-400">
                            <div className="text-[3rem]"><CookingPot className="w-16 h-16 inline-block mx-auto" /></div>
                            <p>You haven't uploaded any recipes yet.</p>
                            <button onClick={() => navigate('/upload-recipe')} className="bg-orange-600 text-white border-none px-5 py-2.5 rounded-xl cursor-pointer font-semibold">+ Upload Recipe</button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {myRecipes.map(recipe => (
                                <div key={recipe.id} className="bg-white rounded-[14px] border border-gray-200 overflow-hidden flex">
                                    <img src={recipe.image || '/pictures/default-recipe.jpg'} alt={recipe.title} className="w-[120px] h-[100px] object-cover shrink-0" />
                                    <div className="p-3.5 flex-1 flex justify-between items-center flex-wrap gap-2">
                                        <div>
                                            <h3 className="m-0 mb-1.5 text-base">{recipe.title}</h3>
                                            <div className="flex gap-2 items-center">
                                                {statusBadge(recipe.status)}
                                                <span className="text-gray-500 text-xs"><Folder className="w-4 h-4 inline-block" /> {recipe.category}</span>
                                            </div>
                                            {recipe.status === 'rejected' && (
                                                <p className="mt-1.5 mb-0 text-red-600 text-xs"><XCircle className="w-4 h-4 inline-block" /> Rejected by admin. You may re-upload an improved version.</p>
                                            )}
                                            {recipe.status === 'pending' && (
                                                <p className="mt-1.5 mb-0 text-orange-800 text-xs"><Hourglass className="w-4 h-4 inline-block" /> Waiting for admin review before going live.</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[1.3rem] font-black text-orange-600">₱{recipe.price}</div>
                                            <div className="text-[0.75rem] text-gray-400">listing price</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* TRANSACTIONS TAB */}
            {activeTab === 'transactions' && (
                <>
                    <h2><BarChart className="w-6 h-6 inline-block" /> Transaction History</h2>
                    {transactions.length === 0 ? (
                        <div className="text-center p-12 text-gray-400">
                            <div className="text-[3rem]"><BarChart className="w-6 h-6" /></div>
                            <p>No transactions yet.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {transactions.map(t => {
                                const isBuyer = t.buyer_id === user?.id;
                                return (
                                    <div key={t.id} className="bg-white rounded-xl px-5 py-4 border border-gray-200 flex justify-between items-center">
                                        <div className="flex items-center gap-3.5">
                                            <div className={`w-11 h-11 rounded-full ${isBuyer ? 'bg-red-100' : 'bg-green-100'} flex items-center justify-center text-[1.3rem] shrink-0`}>
                                                {isBuyer ? <ShoppingCart className="w-6 h-6 text-red-600" /> : <Banknote className="w-6 h-6 text-green-600" />}
                                            </div>
                                            <div>
                                                <div className="font-semibold mb-[3px]">{isBuyer ? 'Purchased' : 'Sold'}: {t.recipe_title}</div>
                                                <div className="text-xs text-gray-400">
                                                    {new Date(t.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`font-extrabold text-xl ${isBuyer ? 'text-red-500' : 'text-green-500'}`}>
                                            {isBuyer ? '-' : '+'}₱{t.amount.toFixed(2)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Marketplace;