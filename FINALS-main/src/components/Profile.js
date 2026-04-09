import React, { useState, useEffect } from 'react';
import { AlertTriangle, Award, Check, CheckCircle, ChefHat, Clock, CookingPot, Edit, FileText, Folder, Hourglass, Lock, LogOut, Package, Settings, ShoppingCart, Star, Trophy, User, UtensilsCrossed, Wallet, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { RECIPES } from '../data/recipes';
import { toast } from 'react-hot-toast';

// Change Password Component
const ChangePassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setMessage('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });
            if (error) throw error;
            setMessage('Password updated successfully!');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setMessage(err.message);
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <form onSubmit={handleChangePassword}>
            {message && (
                <div className={`p-2.5 rounded-lg mb-4 text-sm font-semibold ${
                    message.includes('successfully') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>{message}</div>
            )}
            <div className="mb-4">
                <label className="block mb-1 text-sm font-semibold text-gray-700">New Password</label>
                <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    className="w-full p-2.5 rounded-lg border border-gray-200"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block mb-1 text-sm font-semibold text-gray-700">Confirm Password</label>
                <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full p-2.5 rounded-lg border border-gray-200"
                    required
                />
            </div>
            <button 
                type="submit" 
                disabled={loading}
                className="bg-gray-800 text-white px-5 py-2.5 border-none rounded-xl cursor-pointer font-semibold disabled:opacity-50"
            >
                {loading ? 'Updating...' : 'Update Password'}
            </button>
        </form>
    );
};

// Main Profile Component
const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');
    const [savedRecipeIds, setSavedRecipeIds] = useState([]);
    const [editDisplayName, setEditDisplayName] = useState('');
    const [editBio, setEditBio] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [recipesCooked, setRecipesCooked] = useState(0);
    const [usernameError, setUsernameError] = useState('');
    const [usernameValid, setUsernameValid] = useState(false);

    // New state for marketplace integration
    const [recipesMade, setRecipesMade] = useState([]);
    const [purchasedRecipes, setPurchasedRecipes] = useState([]);
    const [wallet, setWallet] = useState(0);
    const [pantryCount, setPantryCount] = useState(0);

    useEffect(() => {
        loadUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadUserData = async () => {
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) { navigate('/login'); return; }
            setUser(currentUser);

            const { data: profileData } = await supabase
                .from('profiles')
                .select('username, bio, wallet')
                .eq('id', currentUser.id)
                .single();
            setWallet(profileData?.wallet || 0);

            const username = profileData?.username || currentUser.email?.split('@')[0] || 'User';
            const bio = profileData?.bio || 'Food enthusiast exploring Filipino cuisine!';
            setEditDisplayName(username);
            setEditBio(bio);
            validateUsername(username);

            // Saved recipes
            const { data: savedData } = await supabase
                .from('saved_recipes')
                .select('recipe_id')
                .eq('user_id', currentUser.id);
            setSavedRecipeIds(savedData?.map(item => item.recipe_id) || []);

            // Recipes cooked
            const { count: cookedCount } = await supabase
                .from('recipe_cooked')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', currentUser.id);
            setRecipesCooked(cookedCount || 0);

            // Recipes made (uploaded by this user)
            const { data: madeData } = await supabase
                .from('recipes')
                .select('*')
                .eq('created_by', currentUser.id)
                .eq('is_user_recipe', true);
            setRecipesMade(madeData || []);

            // Purchased recipes
            const { data: purchasedData } = await supabase
                .from('purchased_recipes')
                .select('recipe_id, created_at')
                .eq('user_id', currentUser.id);
            if (purchasedData && purchasedData.length > 0) {
                const purchasedIds = purchasedData.map(p => p.recipe_id);
                const { data: purchasedRecipeDetails } = await supabase
                    .from('recipes')
                    .select('*')
                    .in('id', purchasedIds);
                setPurchasedRecipes(purchasedRecipeDetails || []);
            }

            // Pantry items
            const { count: pantryItemCount } = await supabase
                .from('pantry_items')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', currentUser.id);
            setPantryCount(pantryItemCount || 0);

        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const validateUsername = (value) => {
        const regex = /^[a-zA-Z0-9]{3,20}$/;
        const lengthOk = value.length >= 3 && value.length <= 20;
        const isValid = regex.test(value) && lengthOk;
        if (!lengthOk) {
            setUsernameError(value ? '3-20 characters only' : 'Required');
        } else if (!regex.test(value)) {
            setUsernameError('Letters & numbers only');
        } else {
            setUsernameError('');
        }
        setUsernameValid(isValid);
        return isValid;
    };

    const handleTopUp = async () => {
        if (!user) return;
        const newBalance = wallet + 500;
        const { error } = await supabase.from('profiles').update({ wallet: newBalance }).eq('id', user.id);
        if (!error) {
            setWallet(newBalance);
            toast.success('₱500 added to your wallet!');
        } else {
            toast.error('Failed to add funds: ' + error.message);
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
        } else {
            toast.error('Failed to remove funds: ' + error.message);
        }
    };

    const handleSaveProfile = async () => {
        if (!user || !validateUsername(editDisplayName)) {
            setSaveMessage('Please fix username errors first');
            setTimeout(() => setSaveMessage(''), 3000);
            return;
        }
        setSaving(true);

        const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', editDisplayName)
            .neq('id', user.id)
            .single();

        if (existingUser) {
            setSaveMessage(<span><XCircle className="w-5 h-5 inline-block text-red-600" /> Username already taken! Please choose another.</span>);
            setTimeout(() => setSaveMessage(''), 3000);
            setSaving(false);
            return;
        }

        const { error } = await supabase
            .from('profiles')
            .update({ username: editDisplayName, bio: editBio })
            .eq('id', user.id);

        if (!error) {
            setSaveMessage(<span><CheckCircle className="w-5 h-5 inline-block text-green-600" /> Profile updated successfully!</span>);
            setTimeout(() => setSaveMessage(''), 2000);
        } else {
            setSaveMessage(<span><XCircle className="w-5 h-5 inline-block text-red-600" /> Error saving profile. Please try again.</span>);
            setTimeout(() => setSaveMessage(''), 3000);
        }
        setSaving(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const joinDate = user?.created_at 
        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Unknown';

    const favoriteDishes = RECIPES.filter(recipe => savedRecipeIds.includes(recipe.id));

    // Achievement calculation
    const achievements = [
        { label: <><Star className="w-4 h-4 inline-block" /> First Favorite</>, desc: 'Save your first recipe', unlocked: savedRecipeIds.length >= 1 },
        { label: <><CookingPot className="w-6 h-6 inline-block" /> First Cook</>, desc: 'Cook your first recipe', unlocked: recipesCooked >= 1 },
        { label: <><ChefHat className="w-6 h-6 inline-block" /> Home Chef</>, desc: 'Cook 5 recipes', unlocked: recipesCooked >= 5 },
        { label: <><Trophy className="w-5 h-5 inline-block" /> Master Cook</>, desc: 'Cook 10 recipes', unlocked: recipesCooked >= 10 },
        { label: <>📚 Recipe Collector</>, desc: 'Save 5 recipes', unlocked: savedRecipeIds.length >= 5 },
        { label: <>📝 Recipe Creator</>, desc: 'Upload a recipe', unlocked: recipesMade.length >= 1 },
        { label: <>🛒 First Purchase</>, desc: 'Buy a marketplace recipe', unlocked: purchasedRecipes.length >= 1 },
        { label: <>💰 Earner</>, desc: 'Earn from selling recipes', unlocked: wallet > 0 && recipesMade.length >= 1 },
    ];
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="w-10 h-10 border-[3px] border-gray-100 border-t-orange-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto mt-8 px-[2%] flex gap-8 max-md:flex-col">
            {/* Sidebar */}
            <div className="w-[260px] max-md:w-full bg-white rounded-[20px] p-6 border border-gray-200 shrink-0 self-start md:sticky md:top-24">
                {/* Mini profile in sidebar */}
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                    <div className="w-11 h-11 bg-orange-600 rounded-full flex items-center justify-center text-lg text-white font-bold shrink-0">
                        {editDisplayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="m-0 font-bold text-gray-900 text-sm truncate">{editDisplayName}</p>
                        <p className="m-0 text-gray-400 text-xs truncate">{user?.email}</p>
                    </div>
                </div>

                <ul className="list-none p-0 m-0">
                    {['Overview', 'My Recipes', 'Purchased', 'Account Settings'].map(item => (
                        <li 
                            key={item}
                            onClick={() => setActiveTab(item)}
                            className={`px-[15px] py-3 rounded-xl cursor-pointer mb-1 transition-all duration-200 ${
                                activeTab === item 
                                    ? 'font-bold text-orange-600 bg-orange-50' 
                                    : 'font-medium text-gray-600 bg-transparent hover:bg-gray-50'
                            }`}
                        >
                            {item === 'Overview' && '👤 '}
                            {item === 'My Recipes' && '📝 '}
                            {item === 'Purchased' && '🛒 '}
                            {item === 'Account Settings' && '⚙️ '}
                            {item}
                        </li>
                    ))}
                </ul>

                {/* Wallet in sidebar */}
                <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                    <p className="m-0 text-xs text-orange-700 font-semibold uppercase mb-1">Wallet Balance</p>
                    <p className="m-0 text-2xl font-black text-orange-600">₱{wallet.toFixed(2)}</p>
                </div>

                <button 
                    onClick={handleLogout} 
                    className="mt-6 w-full p-3 bg-white text-red-500 border border-red-300 rounded-xl cursor-pointer font-semibold hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5 inline-block" /> Log Out
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 pb-12">
                
                {/* ══════ OVERVIEW TAB ══════ */}
                {activeTab === 'Overview' && (
                    <>
                        {/* Profile Header */}
                        <div className="bg-white rounded-[20px] p-8 mb-6 border border-gray-200">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-[2rem] text-white font-bold shadow-lg shrink-0">
                                    {editDisplayName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="m-0 text-2xl">{editDisplayName}</h1>
                                    <p className="text-gray-500 my-1 text-sm">{user?.email} • Joined {joinDate}</p>
                                    <p className="text-gray-600 m-0 text-sm">{editBio}</p>
                                </div>
                                <button 
                                    onClick={() => setActiveTab('Account Settings')}
                                    className="bg-gray-100 border-none px-4 py-2 rounded-lg cursor-pointer text-sm font-semibold text-gray-600 hover:bg-gray-200 transition-colors shrink-0"
                                >
                                    <Edit className="w-4 h-4 inline-block" /> Edit
                                </button>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[
                                { value: favoriteDishes.length, label: 'Saved Recipes', icon: '⭐', color: 'border-l-orange-500' },
                                { value: recipesCooked, label: 'Recipes Cooked', icon: '🍳', color: 'border-l-green-500' },
                                { value: recipesMade.length, label: 'Recipes Made', icon: '📝', color: 'border-l-blue-500' },
                                { value: purchasedRecipes.length, label: 'Purchased', icon: '🛒', color: 'border-l-violet-500' },
                            ].map(stat => (
                                <div key={stat.label} className={`bg-white p-5 rounded-2xl border border-gray-200 border-l-4 ${stat.color}`}>
                                    <div className="text-[2rem] text-gray-900 font-black leading-none">{stat.value}</div>
                                    <div className="text-gray-500 text-sm font-medium mt-1">{stat.icon} {stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Quick Info Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-2xl border border-orange-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                <div>
                                    <p className="m-0 text-xs text-orange-700 font-semibold uppercase mb-1"><Wallet className="w-5 h-5 inline-block" /> Wallet</p>
                                    <p className="m-0 text-xl font-black text-orange-600">₱{wallet.toFixed(2)}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleWithdraw}
                                        className="bg-transparent text-orange-600 border border-orange-600 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors whitespace-nowrap"
                                        title="Remove ₱500 Demo Money"
                                    >
                                        - ₱500
                                    </button>
                                    <button 
                                        onClick={handleTopUp}
                                        className="bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-lg border-none cursor-pointer hover:bg-orange-700 transition-colors shadow-sm whitespace-nowrap"
                                        title="Add ₱500 Demo Money"
                                    >
                                        + ₱500
                                    </button>
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-2xl border border-green-200">
                                <p className="m-0 text-xs text-green-700 font-semibold uppercase mb-1"><Package className="w-4 h-4 inline-block" /> Pantry Items</p>
                                <p className="m-0 text-xl font-black text-green-600">{pantryCount}</p>
                            </div>
                            <div className="bg-gradient-to-br from-violet-50 to-violet-100 p-5 rounded-2xl border border-violet-200 col-span-2 lg:col-span-1">
                                <p className="m-0 text-xs text-violet-700 font-semibold uppercase mb-1"><Award className="w-5 h-5 inline-block" /> Achievements</p>
                                <p className="m-0 text-xl font-black text-violet-600">{unlockedCount}/{achievements.length}</p>
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="bg-white rounded-[20px] p-6 mb-6 border border-gray-200">
                            <h2 className="mt-0 mb-4 text-lg"><Award className="w-5 h-5 inline-block" /> Achievements</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                {achievements.map(badge => (
                                    <div 
                                        key={badge.label} 
                                        className={`p-3 rounded-xl text-center border transition-all duration-200 ${
                                            badge.unlocked 
                                                ? 'bg-orange-50 border-orange-300 shadow-sm' 
                                                : 'bg-gray-50 border-gray-200 opacity-60'
                                        }`}
                                    >
                                        <div className="text-sm font-bold mb-0.5">
                                            {badge.label} {badge.unlocked ? <Check className="w-4 h-4 inline-block" /> : <Lock className="w-5 h-5 inline-block" />}
                                        </div>
                                        <div className="text-xs text-gray-500">{badge.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Recipes Made */}
                        {recipesMade.length > 0 && (
                            <div className="bg-white rounded-[20px] p-6 mb-6 border border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="m-0 text-lg"><FileText className="w-5 h-5 inline-block" /> My Recipes</h2>
                                    <button 
                                        onClick={() => setActiveTab('My Recipes')}
                                        className="bg-transparent border-none text-orange-600 cursor-pointer font-semibold text-sm"
                                    >
                                        View All →
                                    </button>
                                </div>
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                                    {recipesMade.slice(0, 3).map(recipe => (
                                        <div key={recipe.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                                            <img src={recipe.image || '/pictures/default-recipe.jpg'} alt={recipe.title} className="w-full h-[120px] object-cover" />
                                            <div className="p-3">
                                                <h4 className="m-0 mb-1 text-sm truncate">{recipe.title}</h4>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-500">₱{recipe.price}</span>
                                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                        recipe.status === 'approved' ? 'bg-green-100 text-green-600' :
                                                        recipe.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-600'
                                                    }`}>{recipe.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Favorite Recipes */}
                        <div className="bg-white rounded-[20px] p-6 border border-gray-200">
                            <h2 className="mt-0 mb-4 text-lg"><Star className="w-4 h-4 inline-block" /> Favorite Dishes</h2>
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                                {favoriteDishes.length > 0 ? favoriteDishes.slice(0, 6).map(recipe => (
                                    <div key={recipe.id} onClick={() => navigate(`/recipe/${recipe.id}`, { state: { recipeData: recipe } })} className="bg-gray-50 rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:shadow-md transition-shadow">
                                        <img src={recipe.image} alt={recipe.title} className="w-full h-[130px] object-cover" />
                                        <div className="p-3">
                                            <h4 className="m-0 mb-1 text-sm">{recipe.title}</h4>
                                            <span className="text-orange-600 text-xs"><Clock className="w-4 h-4 inline-block" /> {recipe.time}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full text-center py-8 text-gray-400">
                                        <div className="text-3xl mb-2"><UtensilsCrossed className="w-8 h-8" /></div>
                                        <p>No saved recipes yet. Start exploring!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* ══════ MY RECIPES TAB ══════ */}
                {activeTab === 'My Recipes' && (
                    <div className="bg-white rounded-[20px] p-8 border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="m-0 text-xl"><FileText className="w-5 h-5 inline-block" /> My Recipes</h2>
                                <p className="m-0 text-gray-500 text-sm mt-1">Recipes you've created and uploaded to the Marketplace</p>
                            </div>
                            <button 
                                onClick={() => navigate('/upload-recipe')}
                                className="bg-orange-600 text-white px-5 py-2.5 border-none rounded-xl cursor-pointer font-semibold text-sm hover:bg-orange-700 transition-colors"
                            >
                                + New Recipe
                            </button>
                        </div>

                        {recipesMade.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {recipesMade.map(recipe => (
                                    <div key={recipe.id} className="flex gap-4 bg-gray-50 rounded-xl p-4 border border-gray-200 items-center">
                                        <img 
                                            src={recipe.image || '/pictures/default-recipe.jpg'} 
                                            alt={recipe.title} 
                                            className="w-20 h-20 object-cover rounded-lg shrink-0" 
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="m-0 mb-1 text-base">{recipe.title}</h3>
                                            <p className="m-0 text-gray-500 text-sm truncate">{recipe.description}</p>
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                                <span className="bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-full text-xs font-semibold"><Folder className="w-4 h-4 inline-block" /> {recipe.category}</span>
                                                <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs"><Clock className="w-4 h-4 inline-block" /> {recipe.time}</span>
                                                <span className="bg-green-50 text-green-600 px-2.5 py-0.5 rounded-full text-xs font-semibold"><Wallet className="w-5 h-5 inline-block" /> ₱{recipe.price}</span>
                                            </div>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                                recipe.status === 'approved' ? 'bg-green-100 text-green-600' :
                                                recipe.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-600'
                                            }`}>
                                                {recipe.status === 'approved' ? <><CheckCircle className="w-5 h-5 inline-block text-green-600" /> Live</> :
                                                 recipe.status === 'pending' ? <><Hourglass className="w-5 h-5 inline-block" /> Pending</> : <><XCircle className="w-5 h-5 inline-block text-red-600" /> Rejected</>}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-gray-400">
                                <div className="text-4xl mb-3"><FileText className="w-5 h-5" /></div>
                                <h3 className="text-gray-600 mb-2">No recipes yet</h3>
                                <p className="mb-4">Share your favorite Filipino dishes with the community!</p>
                                <button 
                                    onClick={() => navigate('/upload-recipe')}
                                    className="bg-orange-600 text-white px-6 py-3 border-none rounded-xl cursor-pointer font-semibold hover:bg-orange-700 transition-colors"
                                >
                                    Upload Your First Recipe
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════ PURCHASED TAB ══════ */}
                {activeTab === 'Purchased' && (
                    <div className="bg-white rounded-[20px] p-8 border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="m-0 text-xl">🛒 Purchased Recipes</h2>
                                <p className="m-0 text-gray-500 text-sm mt-1">Recipes you've bought from the Marketplace</p>
                            </div>
                            <button 
                                onClick={() => navigate('/marketplace')}
                                className="bg-orange-600 text-white px-5 py-2.5 border-none rounded-xl cursor-pointer font-semibold text-sm hover:bg-orange-700 transition-colors"
                            >
                                Browse Market
                            </button>
                        </div>

                        {purchasedRecipes.length > 0 ? (
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
                                {purchasedRecipes.map(recipe => (
                                    <div 
                                        key={recipe.id} 
                                        onClick={() => navigate(`/recipe/${recipe.id}`, { state: { recipeData: recipe } })}
                                        className="bg-gray-50 rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:shadow-md transition-shadow"
                                    >
                                        <div className="relative">
                                            <img src={recipe.image || '/pictures/default-recipe.jpg'} alt={recipe.title} className="w-full h-[150px] object-cover" />
                                            <span className="absolute top-3 right-3 bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-bold"><Check className="w-4 h-4 inline-block" /> Owned</span>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="m-0 mb-1">{recipe.title}</h3>
                                            <p className="m-0 text-gray-500 text-sm truncate">{recipe.description}</p>
                                            <div className="flex gap-2 mt-2">
                                                <span className="text-orange-600 text-xs font-semibold"><Folder className="w-4 h-4 inline-block" /> {recipe.category}</span>
                                                <span className="text-gray-500 text-xs"><Clock className="w-4 h-4 inline-block" /> {recipe.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-gray-400">
                                <div className="text-4xl mb-3"><ShoppingCart className="w-4 h-4" /></div>
                                <h3 className="text-gray-600 mb-2">No purchased recipes</h3>
                                <p className="mb-4">Browse the Marketplace to discover community-created recipes!</p>
                                <button 
                                    onClick={() => navigate('/marketplace')}
                                    className="bg-orange-600 text-white px-6 py-3 border-none rounded-xl cursor-pointer font-semibold hover:bg-orange-700 transition-colors"
                                >
                                    Explore Marketplace
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════ ACCOUNT SETTINGS TAB ══════ */}
                {activeTab === 'Account Settings' && (
                    <div className="bg-white rounded-[20px] p-8 border border-gray-200">
                        <h2 className="mt-0"><Settings className="w-6 h-6 inline-block" /> Account Settings</h2>
                        {saveMessage && (
                            <div className={`p-2.5 rounded-lg mb-4 ${saveMessage.includes('❌') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                {saveMessage}
                            </div>
                        )}
                        
                        {/* Display Name */}
                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-semibold text-gray-700">Display Name <span className="text-gray-400 font-normal">(letters & numbers only)</span></label>
                            <input 
                                type="text" 
                                value={editDisplayName} 
                                onChange={(e) => { setEditDisplayName(e.target.value); validateUsername(e.target.value); }}
                                maxLength={20}
                                className={`w-full p-2.5 rounded-lg border mt-[5px] ${usernameError ? 'border-red-500' : 'border-gray-200'} ${usernameValid ? 'bg-green-50' : usernameError ? 'bg-red-50' : 'bg-white'}`}
                            />
                            {usernameError && <p className="text-red-500 text-sm mt-1"><AlertTriangle className="w-5 h-5 inline-block text-yellow-600" /> {usernameError}</p>}
                            {!usernameError && editDisplayName && <p className="text-green-500 text-sm mt-1"><CheckCircle className="w-5 h-5 inline-block text-green-600" /> Valid username</p>}
                        </div>

                        {/* Email */}
                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-semibold text-gray-700">Email</label>
                            <input type="email" value={user?.email || ''} disabled className="w-full p-2.5 rounded-lg border border-gray-200 bg-gray-50 mt-[5px]" />
                        </div>

                        {/* Bio */}
                        <div className="mb-4">
                            <label className="block mb-1 text-sm font-semibold text-gray-700">Bio</label>
                            <textarea 
                                value={editBio} 
                                onChange={(e) => setEditBio(e.target.value.slice(0, 160))}
                                rows="3" maxLength={160}
                                placeholder="Tell us about your cooking journey (max 160 chars)..."
                                className="w-full p-2.5 rounded-lg border border-gray-200 mt-[5px]"
                            />
                            <p className={`text-xs mt-1 ${editBio.length > 140 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                                {editBio.length}/160 characters
                            </p>
                        </div>

                        {/* Save Button */}
                        <button 
                            onClick={handleSaveProfile} 
                            disabled={saving || !usernameValid || !editDisplayName}
                            className={`${(saving || !usernameValid || !editDisplayName) ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 cursor-pointer hover:bg-orange-700'} text-white py-2.5 px-5 border-none rounded-xl w-full font-semibold transition-colors`}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>

                        {/* Change Password Section */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="mb-4 text-gray-900"><Lock className="w-5 h-5 inline-block" /> Change Password</h3>
                            <ChangePassword />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;