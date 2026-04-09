import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Package, Star, ShoppingCart, X, Menu, Clock, LogOut } from 'lucide-react';
import { RECIPES } from './data/recipes';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Pantry from './components/Pantry';
import RecipeTemplate from './components/RecipeTemplate';
import ProfileComponent from './components/Profile';
import PublicProfile from './components/PublicProfile';
import AdminDashboard from './components/AdminDashboard';
import Favorites from './components/Favorites';
import { supabase } from './supabaseClient';
import { logTransaction } from './utils/logger';
import { seedRecipes } from './seedRecipes';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import Marketplace from './components/Marketplace';
import UploadRecipe from './components/UploadRecipe';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const searchResults = RECIPES.filter(recipe => {
    const query = searchQuery.toLowerCase();
    return (
      recipe.title.toLowerCase().includes(query) ||
      recipe.category.toLowerCase().includes(query) ||
      recipe.ingredients.some(ing => ing.toLowerCase().includes(query))
    );
  });

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.trim().length > 0) {
        const { data } = await supabase
          .from('profiles')
          .select('id, username')
          .ilike('username', `%${searchQuery}%`)
          .limit(5);
        setUserSearchResults(data || []);
      } else {
        setUserSearchResults([]);
      }
    };
    
    const timeoutId = setTimeout(() => fetchUsers(), 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    seedRecipes();

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, role')
          .eq('id', currentUser.id)
          .single();
        setProfile(profileData);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        supabase.from('profiles')
          .select('username, role')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => setProfile(data));
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (user) {
      await logTransaction('logout', { email: user.email });
    }
    await supabase.auth.signOut();
    navigate('/');
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="App">
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#333', color: '#fff' } }} />
      {/* Navbar */}
      <nav className="flex justify-between items-center px-[5%] py-4 bg-white border-b border-gray-200 sticky top-0 z-[1000]">
        <div className="flex items-center gap-2.5 font-bold text-xl">
          <Link to="/" className="flex items-center gap-3 no-underline text-gray-900">
            <img
              src="/pictures/savorsense-logo.png"
              alt="SavorSense Logo"
              className="h-[65px] object-contain"
            />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Search onClick={() => setIsSearchOpen(true)} className="cursor-pointer w-5 h-5 text-gray-700" />
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">

          {!user ? (
            <>
              <Link to="/login" className="cursor-pointer font-semibold text-[0.95rem] no-underline bg-orange-600 text-white px-5 py-2.5 rounded-[20px] transition-colors hover:bg-orange-700 inline-block">Log In</Link>
              <Link to="/signup" className="cursor-pointer font-semibold text-[0.95rem] border-none no-underline bg-orange-600 text-white px-5 py-2.5 rounded-[20px] transition-colors hover:bg-orange-700 inline-block">Sign Up</Link>
            </>
          ) : (
            <>
              {profile?.role === 'admin' && (
                <Link to="/AdminDashboard" className="bg-gray-900 text-white px-[18px] py-2 rounded-[50px] no-underline font-semibold text-[0.9rem] transition-all duration-200 inline-block shadow-sm hover:bg-black hover:-translate-y-0.5 hover:shadow-md flex items-center gap-2"><Shield className="w-4 h-4" /> Admin</Link>
              )}
              <Link to="/pantry" className="bg-orange-500 text-white px-[18px] py-2 rounded-[50px] no-underline font-semibold text-[0.9rem] transition-all duration-200 inline-block shadow-sm hover:bg-orange-600 hover:-translate-y-0.5 hover:shadow-md flex items-center gap-2"><Package className="w-4 h-4" /> Pantry</Link>
              <Link to="/favorites" className="bg-orange-500 text-white px-[18px] py-2 rounded-[50px] no-underline font-semibold text-[0.9rem] transition-all duration-200 inline-block shadow-sm hover:bg-orange-600 hover:-translate-y-0.5 hover:shadow-md flex items-center gap-2"><Star className="w-4 h-4" /> Favorites</Link>
              <Link to="/marketplace" className="bg-orange-500 text-white px-[18px] py-2 rounded-[50px] no-underline font-semibold text-[0.9rem] transition-all duration-200 inline-block shadow-sm hover:bg-orange-600 hover:-translate-y-0.5 hover:shadow-md flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Market</Link>
              <Link to="/profile" className="no-underline bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-600 rounded-[50px] pl-1 pr-5 py-1 flex items-center justify-center gap-2.5 text-[0.9rem] font-semibold transition-all duration-300 text-orange-600 cursor-pointer shadow-sm hover:bg-gradient-to-br hover:from-orange-600 hover:to-orange-400 hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:border-transparent group">
                <div className="w-9 h-9 bg-gradient-to-br from-orange-600 to-orange-400 rounded-full flex items-center justify-center text-lg font-bold text-white transition-all duration-300 shadow-sm group-hover:bg-white group-hover:text-orange-600 group-hover:scale-105">
                  {profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="max-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis font-semibold transition-colors duration-300 group-hover:text-white">{profile?.username || user?.email?.split('@')[0] || 'User'}</span>
              </Link>
              <button onClick={handleLogout} className="bg-transparent border-[1.5px] border-red-600 text-red-600 px-[18px] py-2 rounded-[50px] cursor-pointer font-semibold text-[0.9rem] transition-all duration-200 hover:bg-red-600 hover:text-white hover:-translate-y-0.5 hover:shadow-md">Logout</button>
            </>
          )}
          </div>

          {/* Hamburger Icon */}
          <button 
            className="md:hidden bg-transparent border-none cursor-pointer p-1 outline-none relative z-[1001]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-7 h-7 text-gray-700" /> : <Menu className="w-7 h-7 text-gray-700" />}
          </button>
        </div>
      </nav>

      {/* Mobile Slide-Out Menu */}
      <div className={`fixed inset-y-0 right-0 w-64 bg-white shadow-2xl z-[1000] transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col gap-4 p-6 pt-24 h-full overflow-y-auto">
          {!user ? (
            <>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center font-semibold text-lg bg-orange-100 text-orange-600 px-5 py-3 rounded-xl transition-colors hover:bg-orange-200">Log In</Link>
              <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="text-center font-semibold text-lg bg-orange-600 text-white px-5 py-3 rounded-xl transition-colors hover:bg-orange-700">Sign Up</Link>
            </>
          ) : (
            <>
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-400 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm">
                  {profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="font-bold text-orange-800 text-lg">{profile?.username || user?.email?.split('@')[0] || 'User'}</span>
              </Link>
              {profile?.role === 'admin' && (
                <Link to="/AdminDashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-lg font-bold text-gray-900 p-3 bg-gray-100 hover:bg-gray-200 rounded-xl mb-1 mt-1 border border-gray-200"><Shield className="w-5 h-5" /> Admin Dashboard</Link>
              )}
              <Link to="/pantry" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-lg font-semibold text-gray-700 p-2 hover:bg-gray-100 rounded-lg"><Package className="w-5 h-5" /> Pantry</Link>
              <Link to="/favorites" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-lg font-semibold text-gray-700 p-2 hover:bg-gray-100 rounded-lg"><Star className="w-5 h-5" /> Favorites</Link>
              <Link to="/marketplace" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-lg font-semibold text-gray-700 p-2 hover:bg-gray-100 rounded-lg"><ShoppingCart className="w-5 h-5" /> Marketplace</Link>
              <div className="mt-auto pt-4 border-t border-gray-200">
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full bg-red-50 text-red-600 border border-red-200 px-5 py-3 rounded-xl font-bold text-lg transition-colors hover:bg-red-100 flex items-center justify-center gap-2"><LogOut className="w-5 h-5" /> Logout</button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile Overlay Background */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-[999] md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex justify-center items-start pt-[10vh]" onClick={closeSearch}>
          <div className="bg-white w-[90%] max-w-[600px] rounded-[20px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center px-5 py-[15px] border-b border-gray-200">
              <Search className="w-6 h-6 mr-[15px] text-gray-600" />
              <input type="text" placeholder="Search by dish, category, or ingredient..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus className="flex-1 border-none outline-none text-xl" />
              <button onClick={closeSearch} className="bg-transparent border-none cursor-pointer"><X className="w-6 h-6 text-gray-600" /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2.5">
              {searchQuery.trim() === '' ? (
                <div className="p-8 text-center text-gray-500">Type a recipe name like "Adobo" or search for a user...</div>
              ) : (
                <>
                  {userSearchResults.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-gray-400 text-xs uppercase px-2 mb-2 font-black tracking-wider">People</h3>
                      {userSearchResults.map(u => (
                        <Link to={`/user/${u.id}`} key={`user-${u.id}`} onClick={closeSearch} className="flex items-center p-2.5 no-underline gap-[15px] hover:bg-gray-50 rounded-xl transition-colors">
                          <div className="w-[45px] h-[45px] bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0 shadow-sm">
                            {u.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span className="font-semibold text-gray-900 text-[1.1rem]">{u.username || 'User'}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {searchResults.length > 0 && (
                    <div>
                      <h3 className="text-gray-400 text-xs uppercase px-2 mb-2 font-black tracking-wider border-t border-gray-100 pt-3">Recipes</h3>
                      {searchResults.map(recipe => (
                        <Link to={`/recipe/${recipe.id}`} key={`recipe-${recipe.id}`} onClick={closeSearch} className="flex items-center p-2.5 no-underline gap-[15px] hover:bg-gray-50 rounded-xl transition-colors">
                          <img src={recipe.image} alt={recipe.title} className="w-[60px] h-[60px] rounded-[10px] object-cover shrink-0" />
                          <div>
                            <h4 className="m-0 mb-[5px] text-gray-900">{recipe.title}</h4>
                            <div className="flex gap-2.5 text-sm">
                              <span className="text-orange-600 font-semibold">{recipe.category}</span>
                              <span className="text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.time}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {userSearchResults.length === 0 && searchResults.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      No users or recipes found for "<span className="font-bold text-gray-900">{searchQuery}</span>".
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="main-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/user/:userId" element={<PublicProfile />} />
          <Route path="/pantry" element={<Pantry />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/upload-recipe" element={<UploadRecipe />} />
          <Route path="/profile" element={<ProfileComponent />} />
          <Route
            path="/AdminDashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route path="/recipe/:recipeId" element={<RecipeTemplate />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;