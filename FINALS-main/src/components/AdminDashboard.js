import React, { useState, useEffect } from 'react';
import { BarChart, BrushCleaning, Camera, Carrot, CheckCircle, ClipboardList, Clock, CookingPot, Eye, FileText, Folder, Hourglass, KeyRound, LogOut, Package, RefreshCw, Settings, Star, Trash2, User, Users, Wallet, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Overview');

    const [stats, setStats] = useState({ users: 0, recipes: 0, scans: 0, favorites: 0 });
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [pendingRecipes, setPendingRecipes] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingTransactions, setLoadingTransactions] = useState(true);
    const [loadingPending, setLoadingPending] = useState(true);
    const [previewRecipe, setPreviewRecipe] = useState(null);
    const [activityModalUser, setActivityModalUser] = useState(null);
    const [userActivities, setUserActivities] = useState([]);

    const menuItems = [
        { name: 'Overview', icon: <BarChart className="w-6 h-6 inline-block" /> },
        { name: 'Pending Approvals', icon: <Hourglass className="w-5 h-5 inline-block" /> },
        { name: 'Manage Users', icon: <Users className="w-5 h-5 inline-block" /> },
        { name: 'Manage Recipes', icon: <CookingPot className="w-6 h-6 inline-block" /> },
        { name: 'Activity Log', icon: <ClipboardList className="w-6 h-6 inline-block" /> },
        { name: 'System Settings', icon: <Settings className="w-6 h-6 inline-block" /> },
    ];


    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            // User count
            const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            
            // Scan count
            const { count: scanCount } = await supabase.from('user_transactions').select('*', { count: 'exact', head: true }).eq('action', 'scan_ingredients');
            
            // Total favorites count
            const { count: favCount } = await supabase.from('saved_recipes').select('*', { count: 'exact', head: true });
            
            // Pantry items count
            const { count: pantryCount } = await supabase.from('pantry_items').select('*', { count: 'exact', head: true });
            
            // User-made recipes count (all statuses)
            const { count: userRecipesCount } = await supabase
                .from('recipes')
                .select('*', { count: 'exact', head: true })
                .eq('is_user_recipe', true);
            
            // Pending user recipes count
            const { count: pendingCount } = await supabase
                .from('recipes')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending')
                .eq('is_user_recipe', true);
            
            // Approved user recipes count
            const { count: approvedUserRecipesCount } = await supabase
                .from('recipes')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'approved')
                .eq('is_user_recipe', true);

            setStats({
                users: userCount || 0,
                websiteRecipes: 60, // Static website recipes
                userRecipes: userRecipesCount || 0,
                approvedUserRecipes: approvedUserRecipesCount || 0,
                totalRecipes: 60 + (approvedUserRecipesCount || 0),
                scans: scanCount || 0,
                favorites: favCount || 0,
                pantryItems: pantryCount || 0,
                pending: pendingCount || 0,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const { data, error } = await supabase.from('profiles').select('id, username, role, created_at').order('created_at', { ascending: false });
            if (!error && data) setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchTransactions = async () => {
        setLoadingTransactions(true);
        try {
            // Fetch regular transactions
            const { data: transData, error: transError } = await supabase
                .from('user_transactions')
                .select('id, user_id, action, details, created_at')
                .order('created_at', { ascending: false })
                .limit(50);
            
            // Fetch recipe purchases with recipe details
            const { data: purchaseData, error: purchError } = await supabase
                .from('purchased_recipes')
                .select('id, user_id, recipe_id, created_at')
                .order('created_at', { ascending: false })
                .limit(50);
            
            // Fetch recipe uploads
            const { data: uploadData, error: uploadError } = await supabase
                .from('recipes')
                .select('id, created_by, title, status, created_at')
                .eq('is_user_recipe', true)
                .order('created_at', { ascending: false })
                .limit(50);
            
            // Combine all activities
            let allActivities = [];
            
            if (!transError && transData) {
                allActivities = [...allActivities, ...transData.map(t => ({
                    id: `trans-${t.id}`,
                    user_id: t.user_id,
                    action: t.action,
                    details: t.details,
                    created_at: t.created_at,
                    type: 'transaction'
                }))];
            }
            
            if (!purchError && purchaseData) {
                // Fetch recipe details for each purchase
                const purchasesWithDetails = await Promise.all(
                    purchaseData.map(async (p) => {
                        const { data: recipe } = await supabase
                            .from('recipes')
                            .select('title, price')
                            .eq('id', p.recipe_id)
                            .single();
                        
                        return {
                            id: `purch-${p.id}`,
                            user_id: p.user_id,
                            action: 'purchase_recipe',
                            details: { 
                                recipe_id: p.recipe_id,
                                recipe_title: recipe?.title || 'Unknown Recipe',
                                amount: recipe?.price || 0
                            },
                            created_at: p.created_at,
                            type: 'purchase'
                        };
                    })
                );
                allActivities = [...allActivities, ...purchasesWithDetails];
            }
            
            if (!uploadError && uploadData) {
                allActivities = [...allActivities, ...uploadData.map(u => ({
                    id: `upload-${u.id}`,
                    user_id: u.created_by,
                    action: 'upload_recipe',
                    details: { title: u.title, status: u.status },
                    created_at: u.created_at,
                    type: 'upload'
                }))];
            }
            
            // Sort by date and limit to 50 most recent
            allActivities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setTransactions(allActivities.slice(0, 50));
            
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoadingTransactions(false);
        }
    };


   const fetchPendingRecipes = async () => {
    setLoadingPending(true);
    try {
        const { data, error } = await supabase
            .from('recipes')
            .select('*')
            .eq('status', 'pending')
            .eq('is_user_recipe', true);
        
        if (!error && data) {
            // Manually fetch the profile username for each recipe
            const recipesWithProfiles = await Promise.all(
                data.map(async (recipe) => {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('username')
                        .eq('id', recipe.created_by)
                        .single();
                    return { ...recipe, profiles: profile };
                })
            );
            setPendingRecipes(recipesWithProfiles);
        }
        if (error) console.error('Pending fetch error:', error.message);
    } catch (error) {
        console.error('Error fetching pending recipes:', error);
    } finally {
        setLoadingPending(false);
    }
};
    useEffect(() => {
        fetchStats();
        fetchUsers();
        fetchTransactions();
        fetchPendingRecipes();
    }, []);

    const handleApprove = async (recipeId, recipeTitle) => {
        const { error } = await supabase
            .from('recipes')
            .update({ is_approved: true, status: 'approved' })
            .eq('id', recipeId);

        if (!error) {
            setPendingRecipes(prev => prev.filter(r => r.id !== recipeId));
            setStats(prev => ({ ...prev, pending: prev.pending - 1 }));
            setPreviewRecipe(null);
            toast.success(<span><CheckCircle className="w-5 h-5 inline-block text-green-600" /> "{recipeTitle}" has been approved and is now live in the Marketplace!</span>);
        } else {
            toast.error(<span><XCircle className="w-5 h-5 inline-block text-red-600" /> Error approving recipe: {error.message}</span>);
        }
    };

    const handleReject = async (recipeId, recipeTitle) => {
        const reason = window.prompt(`Reason for rejecting "${recipeTitle}"? (This will be noted)`);
        if (reason === null) return;

        const { error } = await supabase
            .from('recipes')
            .update({ is_approved: false, status: 'rejected' })
            .eq('id', recipeId);

        if (!error) {
            setPendingRecipes(prev => prev.filter(r => r.id !== recipeId));
            setStats(prev => ({ ...prev, pending: prev.pending - 1 }));
            setPreviewRecipe(null);
            toast.success(`🚫 "${recipeTitle}" has been rejected.`);
        } else {
            toast.error('❌ Error rejecting recipe: ' + error.message);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm(`Change this user's role to "${newRole}"?`)) return;
        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
        if (!error) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            toast.success(`✅ Role updated to ${newRole}`);
        } else {
            toast.error('❌ Error updating role: ' + error.message);
        }
    };

    const handleViewActivity = async (userId, username) => {
        setActivityModalUser({ id: userId, username });
        setUserActivities([]);
        
        // Fetch all activity types
        const { data: transactions, error: transError } = await supabase
            .from('user_transactions')
            .select('id, action, details, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        const { data: purchases, error: purchError } = await supabase
            .from('purchased_recipes')
            .select('id, recipe_id, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        const { data: uploads, error: uploadError } = await supabase
            .from('recipes')
            .select('id, title, created_at, status')
            .eq('created_by', userId)
            .eq('is_user_recipe', true)
            .order('created_at', { ascending: false });
        
        const { data: favorites, error: favError } = await supabase
            .from('saved_recipes')
            .select('id, recipe_id, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        // Combine all activities
        let allActivities = [];
        
        if (!transError && transactions) {
            allActivities = [...allActivities, ...transactions.map(t => ({
                id: `trans-${t.id}`,
                action: t.action,
                details: t.details,
                created_at: t.created_at,
                type: 'transaction'
            }))];
        }
        
        if (!purchError && purchases) {
            // Fetch recipe details for each purchase
            const purchasesWithDetails = await Promise.all(
                purchases.map(async (p) => {
                    const { data: recipe } = await supabase
                        .from('recipes')
                        .select('title, price')
                        .eq('id', p.recipe_id)
                        .single();
                    
                    return {
                        id: `purch-${p.id}`,
                        action: 'purchase_recipe',
                        details: { 
                            recipe_id: p.recipe_id,
                            recipe_title: recipe?.title || 'Unknown Recipe',
                            amount: recipe?.price || 0
                        },
                        created_at: p.created_at,
                        type: 'purchase'
                    };
                })
            );
            allActivities = [...allActivities, ...purchasesWithDetails];
        }
        
        if (!uploadError && uploads) {
            allActivities = [...allActivities, ...uploads.map(u => ({
                id: `upload-${u.id}`,
                action: 'upload_recipe',
                details: { title: u.title, status: u.status },
                created_at: u.created_at,
                type: 'upload'
            }))];
        }
        
        if (!favError && favorites) {
            allActivities = [...allActivities, ...favorites.map(f => ({
                id: `fav-${f.id}`,
                action: 'favorite_recipe',
                details: { recipe_id: f.recipe_id },
                created_at: f.created_at,
                type: 'favorite'
            }))];
        }
        
        // Sort by date
        allActivities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        setUserActivities(allActivities.slice(0, 50));
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to delete "${username}"? This cannot be undone!`)) return;
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (!error) {
            setUsers(prev => prev.filter(u => u.id !== userId));
            setStats(prev => ({ ...prev, users: prev.users - 1 }));
            toast.success('✅ User deleted successfully');
        } else {
            toast.error('❌ Error deleting user: ' + error.message);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Unknown';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const timeAgo = (dateStr) => {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins} min ago`;
        if (hours < 24) return `${hours} hr ago`;
        return `${days} day ago`;
    };

    const getActionIcon = (action) => {
        const icons = { 
            'login': <KeyRound className="w-4 h-4 inline-block" />, 
            'logout': <LogOut className="w-5 h-5 inline-block" />, 
            'add_ingredient': <Carrot className="w-4 h-4 inline-block" />, 
            'remove_ingredient': <Trash2 className="w-4 h-4 inline-block" />, 
            'scan_ingredients': <Camera className="w-6 h-6 inline-block" />, 
            'clear_pantry': <BrushCleaning className="w-4 h-4 inline-block" />,
            'purchase_recipe': <Wallet className="w-5 h-5 inline-block" />,
            'upload_recipe': <CookingPot className="w-6 h-6 inline-block" />
        };
        return icons[action] || <FileText className="w-5 h-5 inline-block" />;
    };

    const renderContent = () => {
        switch (activeTab) {

            case 'Overview':
            default:
                return (
                    <>
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h1 className="m-0 mb-[5px] text-[2rem] text-gray-900 font-black">Admin Dashboard</h1>
                                <p className="m-0 text-gray-500">Welcome back, Administrator.</p>
                            </div>
                            <button onClick={() => navigate('/')} className="bg-white text-gray-700 border border-gray-300 px-5 py-2.5 rounded-lg cursor-pointer font-bold">
                                View Live Site
                            </button>
                        </div>

                        {stats.pending > 0 && (
                            <div
                                onClick={() => setActiveTab('Pending Approvals')}
                                className="bg-orange-50 border border-orange-400 rounded-xl px-6 py-4 mb-6 flex justify-between items-center cursor-pointer hover:bg-orange-100 transition-colors duration-200"
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className="text-2xl"><Hourglass className="w-5 h-5" /></span>
                                    <div>
                                        <p className="m-0 font-bold text-orange-600">{stats.pending} recipe{stats.pending > 1 ? 's' : ''} waiting for approval</p>
                                        <p className="m-0 text-xs text-orange-800">Click to review and approve or reject</p>
                                    </div>
                                </div>
                                <span className="text-orange-600 font-bold">Review →</span>
                            </div>
                        )}

                        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-6 mb-10">
                            {[
                                { label: 'Total Users', value: stats.users, color: 'border-l-blue-500', icon: <Users className="w-5 h-5 inline-block" /> },
                                { label: 'Website Recipes', value: stats.websiteRecipes, color: 'border-l-emerald-500', icon: <CookingPot className="w-6 h-6 inline-block" />, subtitle: 'Built-in recipes' },
                                { label: 'User Recipes', value: stats.userRecipes, color: 'border-l-teal-500', icon: <CookingPot className="w-6 h-6 inline-block" />, subtitle: `${stats.approvedUserRecipes} approved` },
                                { label: 'Total Recipes', value: stats.totalRecipes, color: 'border-l-green-500', icon: <CookingPot className="w-6 h-6 inline-block" />, subtitle: 'Website + User' },
                                { label: 'Photo Scans', value: stats.scans, color: 'border-l-orange-600', icon: <Camera className="w-6 h-6 inline-block" /> },
                                { label: 'Saved Favorites', value: stats.favorites, color: 'border-l-violet-500', icon: <Star className="w-4 h-4 inline-block" />, subtitle: 'Total saves' },
                                { label: 'Pantry Items', value: stats.pantryItems, color: 'border-l-amber-500', icon: <Package className="w-4 h-4 inline-block" /> },
                                { label: 'Pending Recipes', value: stats.pending, color: 'border-l-red-500', icon: <Hourglass className="w-5 h-5 inline-block" />, subtitle: 'Awaiting approval' },
                            ].map(stat => (
                                <div key={stat.label} className={`bg-white p-6 rounded-2xl border border-gray-200 border-l-4 ${stat.color}`}>
                                    <div className="text-gray-500 text-xs font-bold uppercase mb-2.5">
                                        {stat.icon} {stat.label}
                                    </div>
                                    <div className="text-[2.5rem] text-gray-900 font-black leading-none">
                                        {loadingStats ? '...' : stat.value}
                                    </div>
                                    {stat.subtitle && (
                                        <div className="text-gray-400 text-xs mt-2">
                                            {stat.subtitle}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="bg-white rounded-[20px] p-8 border border-gray-200">
                            <h2 className="text-xl m-0 mb-6 text-gray-900 border-b-2 border-gray-100 pb-2.5"><ClipboardList className="w-6 h-6 inline-block" /> Recent Activity</h2>
                            {loadingTransactions ? (
                                <div className="text-center p-8 text-gray-500">Loading activity...</div>
                            ) : transactions.slice(0, 8).map(t => {
                                const getActivitySummary = () => {
                                    switch(t.action) {
                                        case 'add_ingredient':
                                            return ` — ${t.details?.ingredient || 'Unknown'}`;
                                        case 'remove_ingredient':
                                            return ` — ${t.details?.ingredient || 'Unknown'}`;
                                        case 'scan_ingredients':
                                            return ` — ${t.details?.ingredients?.length || 0} items`;
                                        case 'upload_recipe':
                                            return ` — "${t.details?.title || 'Unknown'}"`;
                                        case 'purchase_recipe':
                                            return ` — "${t.details?.recipe_title || t.details?.recipe_id || 'Unknown'}"`;
                                        case 'login':
                                        case 'logout':
                                            return t.details?.email ? ` — ${t.details.email}` : '';
                                        default:
                                            if (t.details?.ingredient) return ` — ${t.details.ingredient}`;
                                            if (t.details?.email) return ` — ${t.details.email}`;
                                            return '';
                                    }
                                };
                                
                                return (
                                    <div key={t.id} className="py-3 border-b border-gray-100 flex justify-between items-center">
                                        <span className="text-gray-700">
                                            {getActionIcon(t.action)} <b>{t.action.replace(/_/g, ' ')}</b>
                                            {getActivitySummary()}
                                        </span>
                                        <span className="text-gray-400 text-xs whitespace-nowrap ml-4">{timeAgo(t.created_at)}</span>
                                    </div>
                                );
                            })}
                            {transactions.length === 0 && !loadingTransactions && (
                                <p className="text-gray-400 text-center">No activity yet.</p>
                            )}
                        </div>
                    </>
                );

            case 'Pending Approvals':
                return (
                    <div>
                        {previewRecipe && (
                            <div className="fixed inset-0 bg-black/70 z-[9999] flex justify-center items-start p-8 overflow-y-auto" onClick={() => setPreviewRecipe(null)}>
                                <div className="bg-white rounded-[20px] w-full max-w-[700px] overflow-hidden" onClick={e => e.stopPropagation()}>
                                    <div className="relative h-[250px]">
                                        <img src={previewRecipe.image || '/pictures/default-recipe.jpg'} alt={previewRecipe.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                        <div className="absolute bottom-4 left-6 text-white">
                                            <h2 className="m-0 text-[1.8rem]">{previewRecipe.title}</h2>
                                            <p className="mt-1 mb-0 opacity-90">by {previewRecipe.profiles?.username || 'Unknown'} • ₱{previewRecipe.price}</p>
                                        </div>
                                        <button onClick={() => setPreviewRecipe(null)} className="absolute top-4 right-4 bg-white/20 border-none text-white w-9 h-9 rounded-full cursor-pointer text-xl font-bold">×</button>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex gap-3 mb-4 flex-wrap">
                                            <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-[20px] text-xs font-semibold"><Folder className="w-4 h-4 inline-block" /> {previewRecipe.category}</span>
                                            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-[20px] text-xs font-semibold"><Clock className="w-4 h-4 inline-block" /> {previewRecipe.time}</span>
                                            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-[20px] text-xs font-semibold"><Wallet className="w-5 h-5 inline-block" /> ₱{previewRecipe.price}</span>
                                        </div>

                                        <p className="text-gray-500 mb-6">{previewRecipe.description}</p>

                                        <h3 className="text-gray-900 mb-2">Ingredients ({previewRecipe.ingredients?.length || 0})</h3>
                                        <ul className="pl-5 text-gray-700 mb-6">
                                            {previewRecipe.ingredients?.map((ing, i) => <li key={i} className="mb-1">{ing}</li>)}
                                        </ul>

                                        <h3 className="text-gray-900 mb-2">Steps ({previewRecipe.steps?.length || 0})</h3>
                                        {previewRecipe.steps?.map((step, i) => (
                                            <div key={i} className="flex gap-3 mb-4 bg-gray-50 rounded-[10px] p-3">
                                                <div className="bg-orange-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0">{i + 1}</div>
                                                <div className="flex-1">
                                                    <p className="m-0 text-gray-700">{step}</p>
                                                    {previewRecipe.step_photos?.[i] && (
                                                        <img src={previewRecipe.step_photos[i]} alt={`Step ${i + 1}`} className="w-full max-h-[150px] object-cover rounded-lg mt-2" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {previewRecipe.video && (
                                            <div className="mb-6">
                                                <h3 className="text-gray-900 mb-2">Video</h3>
                                                {previewRecipe.video.includes('youtube') || previewRecipe.video.includes('embed') ? (
                                                    <div className="relative pb-[56.25%] h-0 rounded-xl overflow-hidden">
                                                        <iframe src={previewRecipe.video} className="absolute inset-0 w-full h-full" frameBorder="0" allowFullScreen title="Recipe video" />
                                                    </div>
                                                ) : (
                                                    <video controls className="w-full rounded-xl">
                                                        <source src={previewRecipe.video} />
                                                    </video>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <button onClick={() => handleApprove(previewRecipe.id, previewRecipe.title)} className="flex-1 py-3.5 bg-green-500 text-white border-none rounded-xl cursor-pointer font-bold text-base">
                                                <CheckCircle className="w-5 h-5 inline-block text-green-600" /> Approve & Publish
                                            </button>
                                            <button onClick={() => handleReject(previewRecipe.id, previewRecipe.title)} className="flex-1 py-3.5 bg-red-500 text-white border-none rounded-xl cursor-pointer font-bold text-base">
                                                🚫 Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-[20px] p-8 border border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl m-0 text-gray-900">
                                    <Hourglass className="w-5 h-5 inline-block" /> Pending Approvals
                                    <span className="text-base text-gray-500 font-normal ml-2">({pendingRecipes.length} waiting)</span>
                                </h2>
                                <button onClick={fetchPendingRecipes} className="bg-gray-100 border-none px-4 py-2 rounded-lg cursor-pointer font-semibold">
                                    <RefreshCw className="w-4 h-4 inline-block" /> Refresh
                                </button>
                            </div>

                            {loadingPending ? (
                                <div className="text-center p-12 text-gray-500">Loading pending recipes...</div>
                            ) : pendingRecipes.length === 0 ? (
                                <div className="text-center p-16 text-gray-400">
                                    <div className="text-[3rem]"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                                    <h3>All caught up!</h3>
                                    <p>No recipes waiting for approval.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {pendingRecipes.map(recipe => (
                                        <div key={recipe.id} className="flex gap-4 bg-gray-50 rounded-[14px] p-4 border border-gray-200 items-center">
                                            <img
                                                src={recipe.image || '/pictures/default-recipe.jpg'}
                                                alt={recipe.title}
                                                className="w-20 h-20 object-cover rounded-[10px] shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="m-0 mb-1 text-gray-900">{recipe.title}</h3>
                                                <p className="m-0 mb-1.5 text-gray-500 text-xs">{recipe.description}</p>
                                                <div className="flex gap-2 flex-wrap">
                                                    <span className="bg-orange-50 text-orange-600 px-2.5 py-0.5 rounded-[20px] text-xs font-semibold"><Folder className="w-4 h-4 inline-block" /> {recipe.category}</span>
                                                    <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-[20px] text-xs"><Clock className="w-4 h-4 inline-block" /> {recipe.time}</span>
                                                    <span className="bg-green-100 text-green-600 px-2.5 py-0.5 rounded-[20px] text-xs font-semibold"><Wallet className="w-5 h-5 inline-block" /> ₱{recipe.price}</span>
                                                    <span className="bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-[20px] text-xs"><User className="w-4 h-4 inline-block" /> {recipe.profiles?.username || 'Unknown'}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 shrink-0">
                                                <button onClick={() => setPreviewRecipe(recipe)} className="px-4 py-2 bg-gray-800 text-white border-none rounded-lg cursor-pointer font-semibold text-xs">
                                                    <Eye className="w-5 h-5 inline-block" /> Preview
                                                </button>
                                                <button onClick={() => handleApprove(recipe.id, recipe.title)} className="px-4 py-2 bg-green-500 text-white border-none rounded-lg cursor-pointer font-semibold text-xs">
                                                    <CheckCircle className="w-5 h-5 inline-block text-green-600" /> Approve
                                                </button>
                                                <button onClick={() => handleReject(recipe.id, recipe.title)} className="px-4 py-2 bg-red-500 text-white border-none rounded-lg cursor-pointer font-semibold text-xs">
                                                    🚫 Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'Manage Users':
                return (
                    <div className="bg-white rounded-[20px] p-8 border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl m-0 text-gray-900">
                                <Users className="w-5 h-5 inline-block" /> Registered Users <span className="text-base text-gray-500 font-normal">({users.length} total)</span>
                            </h2>
                            <button onClick={fetchUsers} className="bg-gray-100 border-none px-4 py-2 rounded-lg cursor-pointer font-semibold"><RefreshCw className="w-4 h-4 inline-block" /> Refresh</button>
                        </div>
                        {loadingUsers ? (
                            <div className="text-center p-8 text-gray-500">Loading users...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200 text-gray-500 text-sm">
                                            <th className="px-[15px] py-3">Username</th>
                                            <th className="px-[15px] py-3">User ID</th>
                                            <th className="px-[15px] py-3">Role</th>
                                            <th className="px-[15px] py-3">Joined</th>
                                            <th className="px-[15px] py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id} className="border-b border-gray-100">
                                                <td className="px-[15px] py-3 font-bold">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-[35px] h-[35px] bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                            {user.username?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                        {user.username || 'No username'}
                                                    </div>
                                                </td>
                                                <td className="px-[15px] py-3 text-gray-500 text-xs">{user.id.substring(0, 8)}...</td>
                                                <td className="px-[15px] py-3">
                                                    <span className={`${user.role === 'admin' ? 'bg-yellow-200' : 'bg-gray-200'} px-2.5 py-1 rounded text-xs font-bold`}>
                                                        {user.role || 'user'}
                                                    </span>
                                                </td>
                                                <td className="px-[15px] py-3 text-gray-500 text-xs">{formatDate(user.created_at)}</td>
                                                <td className="px-[15px] py-3">
                                                    {user.role !== 'admin' ? (
                                                        <button onClick={() => handleRoleChange(user.id, 'admin')} className="bg-yellow-200 border-none text-yellow-800 px-2.5 py-[5px] rounded-md cursor-pointer font-semibold text-xs mr-2">
                                                            Make Admin
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => handleRoleChange(user.id, 'user')} className="bg-gray-200 border-none text-gray-700 px-2.5 py-[5px] rounded-md cursor-pointer font-semibold text-xs mr-2">
                                                            Remove Admin
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleViewActivity(user.id, user.username)} className="bg-blue-50 border border-blue-200 text-blue-600 px-2.5 py-[5px] rounded-md cursor-pointer font-semibold text-xs mr-2 hover:bg-blue-100 transition-colors">
                                                        <Eye className="w-5 h-5 inline-block" /> View Activity
                                                    </button>
                                                    <button onClick={() => handleDeleteUser(user.id, user.username)} className="bg-transparent border-none text-red-500 cursor-pointer font-bold text-xs hover:underline">
                                                        <Trash2 className="w-4 h-4 inline-block" /> Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {users.length === 0 && <p className="text-center text-gray-400 p-8">No users found.</p>}
                            </div>
                        )}
                    </div>
                );

            case 'Manage Recipes':
                return (
                    <div className="bg-white rounded-[20px] p-8 border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl m-0 text-gray-900">Recipe Database</h2>
                            <span className="bg-gray-100 px-4 py-2 rounded-lg text-sm text-gray-500 font-semibold">60 recipes (local data)</span>
                        </div>
                        <div className="bg-orange-50 border border-orange-300 rounded-xl p-4 mb-6">
                            <p className="m-0 text-orange-800 text-sm">The 60 built-in website recipes are stored in <b>src/data/recipes.js</b> as static data. User-uploaded recipes are already in Supabase. To enable full CRUD management of website recipes, migrate them to the Supabase <b>recipes</b> table.</p>
                        </div>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                            {['Pork', 'Beef', 'Chicken', 'Vegetables', 'Seafood', 'Snacks'].map(category => (
                                <div key={category} className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                                    <h3 className="m-0 mb-[5px] text-gray-900 text-xl">{category}</h3>
                                    <p className="m-0 text-gray-500 text-sm">10 recipes</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'Activity Log':
                return (
                    <div className="bg-white rounded-[20px] p-8 border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl m-0 text-gray-900">
                                <ClipboardList className="w-6 h-6 inline-block" /> Activity Log <span className="text-base text-gray-500 font-normal">({transactions.length} entries)</span>
                            </h2>
                            <button onClick={fetchTransactions} className="bg-gray-100 border-none px-4 py-2 rounded-lg cursor-pointer font-semibold"><RefreshCw className="w-4 h-4 inline-block" /> Refresh</button>
                        </div>
                        {loadingTransactions ? (
                            <div className="text-center p-8 text-gray-500">Loading activity...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200 text-gray-500 text-sm">
                                            <th className="px-[15px] py-3">Action</th>
                                            <th className="px-[15px] py-3">Details</th>
                                            <th className="px-[15px] py-3">User ID</th>
                                            <th className="px-[15px] py-3">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map(t => {
                                            const getActivityDetails = () => {
                                                if (!t.details) return 'No details';
                                                
                                                switch(t.action) {
                                                    case 'add_ingredient':
                                                    case 'remove_ingredient':
                                                        return t.details.ingredient || 'Unknown ingredient';
                                                    case 'scan_ingredients':
                                                        return `Scanned ${t.details.ingredients?.length || 0} ingredients`;
                                                    case 'clear_pantry':
                                                        return t.details.message || 'Cleared all pantry items';
                                                    case 'upload_recipe':
                                                        return `Recipe: "${t.details.title}" (${t.details.status})`;
                                                    case 'purchase_recipe':
                                                        return `Recipe: "${t.details.recipe_title || t.details.recipe_id}" for ₱${t.details.amount || 'N/A'}`;
                                                    case 'login':
                                                    case 'logout':
                                                        return t.details.email || 'User session';
                                                    default:
                                                        if (t.details.ingredient) return t.details.ingredient;
                                                        if (t.details.email) return t.details.email;
                                                        if (t.details.message) return t.details.message;
                                                        return JSON.stringify(t.details).slice(0, 50);
                                                }
                                            };
                                            
                                            return (
                                                <tr key={t.id} className="border-b border-gray-100">
                                                    <td className="px-[15px] py-3">
                                                        <span className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-md text-xs font-bold">
                                                            {getActionIcon(t.action)} {t.action.replace(/_/g, ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-[15px] py-3 text-gray-500 text-xs">
                                                        {getActivityDetails()}
                                                    </td>
                                                    <td className="px-[15px] py-3 text-gray-400 text-xs">{t.user_id?.substring(0, 8)}...</td>
                                                    <td className="px-[15px] py-3 text-gray-400 text-xs whitespace-nowrap">{timeAgo(t.created_at)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {transactions.length === 0 && <p className="text-center text-gray-400 p-8">No activity logged yet.</p>}
                            </div>
                        )}
                    </div>
                );

            case 'System Settings':
                return (
                    <div className="bg-white rounded-[20px] p-8 border border-gray-200">
                        <h2 className="m-0 mb-6"><Settings className="w-6 h-6 inline-block" /> System Settings</h2>
                        <div className="mb-6">
                            <h3 className="text-gray-700 mb-4">🗄️ Database Status</h3>
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
                                {[
                                    { table: 'profiles', status: 'connected' },
                                    { table: 'pantry_items', status: 'connected' },
                                    { table: 'saved_recipes', status: 'connected' },
                                    { table: 'user_transactions', status: 'connected' },
                                    { table: 'recipes', status: 'connected' },
                                    { table: 'transactions', status: 'connected' },
                                    { table: 'purchased_recipes', status: 'connected' },
                                    { table: 'recipe_cooked', status: 'connected' },
                                ].map(item => (
                                    <div key={item.table} className="bg-gray-50 p-4 rounded-[10px] border border-gray-200 flex justify-between items-center">
                                        <span className="font-semibold text-xs">{item.table}</span>
                                        <span className="text-green-500 font-bold text-xs"><CheckCircle className="w-5 h-5 inline-block text-green-600" /> Active</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-gray-700 mb-4">ℹ️ App Info</h3>
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                {[
                                    { label: 'App Name', value: 'SavorSense' },
                                    { label: 'Frontend', value: 'React.js' },
                                    { label: 'Backend', value: 'Node.js + Express' },
                                    { label: 'Database', value: 'Supabase (PostgreSQL)' },
                                    { label: 'Image Recognition', value: 'Cloud Vision' },
                                    { label: 'Total Recipes', value: '60 Filipino Recipes' },
                                ].map(item => (
                                    <div key={item.label} className="flex justify-between py-2 border-b border-gray-200">
                                        <span className="text-gray-500 font-semibold">{item.label}</span>
                                        <span className="text-gray-900 font-medium">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto mt-8 px-[2%] flex gap-8 font-inter items-start">
            <div className="w-[260px] bg-gray-900 rounded-[20px] p-6 shadow-xl shrink-0 sticky top-8 text-white">
                <div className="flex items-center gap-2.5 mb-8 px-2.5">
                    <div className="bg-orange-600 text-white w-[35px] h-[35px] rounded-lg flex items-center justify-center font-bold text-xl">SS</div>
                    <h3 className="m-0 text-xl font-extrabold">Admin Panel</h3>
                </div>
                <ul className="list-none p-0 m-0 flex flex-col gap-[5px]">
                    {menuItems.map((item) => (
                        <li
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={`px-[15px] py-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all duration-200 ${
                                activeTab === item.name 
                                    ? 'font-bold text-white bg-gray-700' 
                                    : 'font-medium text-gray-400 bg-transparent hover:text-white'
                            }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {item.name}
                            {item.name === 'Pending Approvals' && stats.pending > 0 && (
                                <span className="ml-auto bg-red-500 text-white rounded-full w-[22px] h-[22px] flex items-center justify-center text-xs font-bold">
                                    {stats.pending}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
                <button onClick={() => navigate('/')} className="mt-8 w-full py-2.5 bg-transparent text-gray-400 border border-gray-700 rounded-[10px] cursor-pointer font-semibold">
                    ← Back to Site
                </button>
            </div>

            <div className="flex-1 min-w-0">
                {renderContent()}
            </div>

            {/* User Activity Modal */}
            {activityModalUser && (
                <div className="fixed inset-0 bg-black/60 z-[1000] flex justify-center items-center p-5 backdrop-blur-sm" onClick={() => setActivityModalUser(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-[700px] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                        <div className="bg-orange-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
                            <div>
                                <h2 className="m-0 text-[1.25rem] font-bold">Activity Log</h2>
                                <p className="m-0 text-orange-100 text-sm mt-1">User: <span className="font-semibold">{activityModalUser.username}</span></p>
                            </div>
                            <button onClick={() => setActivityModalUser(null)} className="bg-transparent border-none text-white text-[1.75rem] cursor-pointer opacity-80 hover:opacity-100 p-0 leading-none">×</button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
                            {userActivities.length === 0 ? (
                                <div className="text-center text-gray-500 py-8 flex flex-col items-center">
                                    <div className="text-[3rem] mb-2">📭</div>
                                    <p className="m-0">No recent activities found for this user.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {userActivities.map((act) => {
                                        const getActivityIcon = () => {
                                            switch(act.action) {
                                                case 'login': return <KeyRound className="w-5 h-5 text-blue-600" />;
                                                case 'logout': return <LogOut className="w-5 h-5 text-gray-600" />;
                                                case 'add_ingredient': return <Carrot className="w-5 h-5 text-green-600" />;
                                                case 'remove_ingredient': return <Trash2 className="w-5 h-5 text-red-600" />;
                                                case 'scan_ingredients': return <Camera className="w-5 h-5 text-purple-600" />;
                                                case 'clear_pantry': return <BrushCleaning className="w-5 h-5 text-orange-600" />;
                                                case 'upload_recipe': return <CookingPot className="w-5 h-5 text-orange-600" />;
                                                case 'purchase_recipe': return <Wallet className="w-5 h-5 text-green-600" />;
                                                case 'favorite_recipe': return <Star className="w-5 h-5 text-yellow-600" />;
                                                case 'unfavorite_recipe': return <Star className="w-5 h-5 text-gray-400" />;
                                                case 'change_password': return <KeyRound className="w-5 h-5 text-indigo-600" />;
                                                case 'change_username': return <User className="w-5 h-5 text-indigo-600" />;
                                                default: return <FileText className="w-5 h-5 text-gray-600" />;
                                            }
                                        };
                                        
                                        const getActivityDetails = () => {
                                            if (!act.details) return 'No details';
                                            
                                            switch(act.action) {
                                                case 'add_ingredient':
                                                case 'remove_ingredient':
                                                    return `Ingredient: ${act.details.ingredient || 'Unknown'}`;
                                                case 'scan_ingredients':
                                                    return `Scanned ${act.details.ingredients?.length || 0} ingredients${act.details.isMock ? ' (demo mode)' : ''}`;
                                                case 'clear_pantry':
                                                    return act.details.message || 'Cleared all pantry items';
                                                case 'upload_recipe':
                                                    return `Recipe: "${act.details.title}" (${act.details.status})`;
                                                case 'purchase_recipe':
                                                    return `Recipe: "${act.details.recipe_title}" for ₱${act.details.amount}`;
                                                case 'favorite_recipe':
                                                    return `Saved recipe: "${act.details.recipe_title || act.details.recipe_id}"`;
                                                case 'unfavorite_recipe':
                                                    return `Removed recipe: "${act.details.recipe_title || act.details.recipe_id}"`;
                                                case 'login':
                                                case 'logout':
                                                    return act.details.email || 'User session';
                                                case 'change_password':
                                                    return 'Password updated';
                                                case 'change_username':
                                                    return `New username: ${act.details.new_username || 'Unknown'}`;
                                                default:
                                                    if (typeof act.details === 'string') return act.details;
                                                    if (typeof act.details === 'object') {
                                                        return Object.entries(act.details)
                                                            .map(([key, val]) => `${key}: ${val}`)
                                                            .join(', ');
                                                    }
                                                    return 'Activity logged';
                                            }
                                        };
                                        
                                        return (
                                            <div key={act.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow">
                                                <div className="mt-1">{getActivityIcon()}</div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1 gap-2">
                                                        <span className="font-bold text-gray-800 text-sm capitalize">
                                                            {act.action.replace(/_/g, ' ')}
                                                        </span>
                                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                                            {formatDate(act.created_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm m-0 break-words">
                                                        {getActivityDetails()}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 bg-white border-t border-gray-100 text-right shrink-0">
                            <button onClick={() => setActivityModalUser(null)} className="bg-gray-200 border-none px-6 py-2.5 rounded-lg cursor-pointer font-semibold text-gray-700 hover:bg-gray-300 transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;