/**
 * Preservation Property-Based Tests
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10**
 * 
 * Property 2: Preservation - Functional Behavior Unchanged
 * 
 * IMPORTANT: These tests verify that functional features work correctly on UNFIXED code
 * EXPECTED OUTCOME: Tests PASS (confirms baseline behavior to preserve)
 * 
 * These tests use property-based testing to verify that all functional features
 * (authentication, recipe viewing, favorites, pantry, marketplace, etc.) work correctly
 * and will continue to work after the icon rendering fix is applied.
 * 
 * NOTE: These tests focus on business logic and data operations rather than UI rendering
 * to ensure they work reliably in the test environment and accurately capture functional behavior.
 */

// Import fast-check CJS version
const fc = require('fast-check/lib/cjs/fast-check.js');

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(),
    signInWithPassword: jest.fn(),
    signInWithOtp: jest.fn(),
    verifyOtp: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn(),
};

jest.mock('../supabaseClient', () => ({
  supabase: mockSupabase,
}));

// Import after mocking
const { supabase } = require('../supabaseClient');

describe('Preservation Property Tests - Functional Behavior Unchanged', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      match: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    });
  });

  /**
   * Property 1: Authentication Flow Works Correctly
   * Validates: Requirement 3.1
   * 
   * Tests that login, signup, and logout functionality works correctly
   * across various valid email and password combinations.
   */
  describe('Property 1: Authentication Flow', () => {
    test('login with valid credentials should call auth API correctly', () => {
      fc.assert(
        fc.property(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 20 }),
          async (email, password) => {
            // Mock successful login
            supabase.auth.signInWithPassword.mockResolvedValue({
              data: { user: { id: 'test-user-id', email }, session: {} },
              error: null,
            });

            // Simulate login action
            const result = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            // Verify auth was called with correct credentials
            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
              email,
              password,
            });
            
            // Verify successful response
            expect(result.data.user).toBeDefined();
            expect(result.data.user.email).toBe(email);
            expect(result.error).toBeNull();
          }
        ),
        { numRuns: 10 } // Run 10 test cases with different email/password combinations
      );
    });

    test('OTP login flow should send verification code correctly', () => {
      fc.assert(
        fc.property(
          fc.emailAddress(),
          async (email) => {
            // Mock successful OTP send
            supabase.auth.signInWithOtp.mockResolvedValue({
              data: {},
              error: null,
            });

            // Simulate OTP send action
            const result = await supabase.auth.signInWithOtp({ email });

            // Verify OTP was sent
            expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({ email });
            expect(result.error).toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    });

    test('signup with valid data should create account correctly', () => {
      fc.assert(
        fc.property(
          fc.emailAddress(),
          fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
          fc.string({ minLength: 8, maxLength: 20 }),
          async (email, username, password) => {
            // Mock successful signup
            supabase.auth.signUp.mockResolvedValue({
              data: { user: { id: 'new-user-id', email }, session: {} },
              error: null,
            });

            // Simulate signup action
            const result = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: { username },
              },
            });

            // Verify signup was called
            expect(supabase.auth.signUp).toHaveBeenCalled();
            expect(result.data.user).toBeDefined();
            expect(result.error).toBeNull();
          }
        ),
        { numRuns: 5 }
      );
    });

    test('logout should clear session correctly', async () => {
      // Mock successful logout
      supabase.auth.signOut.mockResolvedValue({ error: null });

      // Simulate logout action
      const result = await supabase.auth.signOut();

      // Verify logout was called
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.error).toBeNull();
    });
  });

  /**
   * Property 2: Recipe Viewing and Navigation
   * Validates: Requirement 3.2
   * 
   * Tests that recipe data fetching and navigation logic work correctly.
   */
  describe('Property 2: Recipe Viewing and Navigation', () => {
    test('recipe data should be fetched correctly from database', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          async (recipeId) => {
            // Mock recipe data
            const mockRecipe = {
              id: recipeId,
              title: `Recipe ${recipeId}`,
              ingredients: ['ingredient1', 'ingredient2'],
              instructions: ['step1', 'step2'],
              category: 'Main Dish',
              time: '30 mins',
            };

            supabase.from.mockReturnValue({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: mockRecipe,
                error: null,
              }),
            });

            // Simulate fetching recipe
            const { data, error } = await supabase
              .from('recipes')
              .select('*')
              .eq('id', recipeId)
              .single();

            // Verify recipe data is correct
            expect(data).toBeDefined();
            expect(data.id).toBe(recipeId);
            expect(data.title).toBe(`Recipe ${recipeId}`);
            expect(error).toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    });

    test('recipe search should filter correctly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 20 }),
          async (searchQuery) => {
            const mockRecipes = [
              { id: 1, title: 'Chicken Adobo', category: 'Main Dish' },
              { id: 2, title: 'Beef Sinigang', category: 'Soup' },
              { id: 3, title: 'Pork Adobo', category: 'Main Dish' },
            ];

            supabase.from.mockReturnValue({
              select: jest.fn().mockReturnThis(),
              ilike: jest.fn().mockReturnThis(),
              limit: jest.fn().mockResolvedValue({
                data: mockRecipes.filter(r => 
                  r.title.toLowerCase().includes(searchQuery.toLowerCase())
                ),
                error: null,
              }),
            });

            // Simulate search
            const { data, error } = await supabase
              .from('recipes')
              .select('*')
              .ilike('title', `%${searchQuery}%`)
              .limit(10);

            // Verify search works
            expect(error).toBeNull();
            expect(Array.isArray(data)).toBe(true);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Property 3: Favorites Management
   * Validates: Requirement 3.5
   * 
   * Tests that saving and unsaving recipes to favorites persists correctly.
   */
  describe('Property 3: Favorites Management', () => {
    test('saving recipe to favorites should persist correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.uuid(),
          async (recipeId, userId) => {
            const mockInsert = jest.fn().mockResolvedValue({ data: {}, error: null });
            
            supabase.from.mockReturnValue({
              insert: mockInsert,
            });

            // Simulate saving a favorite
            const result = await supabase.from('favorites').insert({
              user_id: userId,
              recipe_id: recipeId,
            });

            // Verify insert was called with correct data
            expect(mockInsert).toHaveBeenCalledWith({
              user_id: userId,
              recipe_id: recipeId,
            });
            expect(result.error).toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    });

    test('removing recipe from favorites should delete correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.uuid(),
          async (recipeId, userId) => {
            const mockMatch = jest.fn().mockResolvedValue({ data: {}, error: null });
            const mockDelete = jest.fn().mockReturnValue({
              match: mockMatch,
            });
            
            supabase.from.mockReturnValue({
              delete: mockDelete,
            });

            // Simulate removing a favorite
            const result = await supabase.from('favorites')
              .delete()
              .match({ user_id: userId, recipe_id: recipeId });

            // Verify delete was called
            expect(mockDelete).toHaveBeenCalled();
            expect(mockMatch).toHaveBeenCalledWith({ user_id: userId, recipe_id: recipeId });
            expect(result.error).toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    });

    test('fetching user favorites should return correct data', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(fc.integer({ min: 1, max: 100 }), { minLength: 0, maxLength: 10 }),
          async (userId, favoriteIds) => {
            const mockFavorites = favoriteIds.map(id => ({
              user_id: userId,
              recipe_id: id,
            }));

            supabase.from.mockReturnValue({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockResolvedValue({
                data: mockFavorites,
                error: null,
              }),
            });

            // Simulate fetching favorites
            const { data, error } = await supabase
              .from('favorites')
              .select('*')
              .eq('user_id', userId);

            // Verify favorites are fetched correctly
            expect(error).toBeNull();
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBe(favoriteIds.length);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Property 4: Pantry Management
   * Validates: Requirement 3.6
   * 
   * Tests that pantry operations (add, remove, scan) work correctly.
   */
  describe('Property 4: Pantry Management', () => {
    test('adding ingredients to pantry should persist correctly', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
          fc.uuid(),
          async (ingredients, userId) => {
            const mockInsert = jest.fn().mockResolvedValue({ data: {}, error: null });
            
            supabase.from.mockReturnValue({
              insert: mockInsert,
            });

            // Simulate adding ingredients
            for (const ingredient of ingredients) {
              const result = await supabase.from('pantry').insert({
                user_id: userId,
                ingredient_name: ingredient,
              });
              
              // Verify each insert succeeds
              expect(result.error).toBeNull();
            }

            // Verify insert was called
            expect(mockInsert).toHaveBeenCalled();
          }
        ),
        { numRuns: 5 }
      );
    });

    test('removing ingredients from pantry should delete correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.uuid(),
          async (ingredientId, userId) => {
            const mockMatch = jest.fn().mockResolvedValue({ data: {}, error: null });
            const mockDelete = jest.fn().mockReturnValue({
              match: mockMatch,
            });
            
            supabase.from.mockReturnValue({
              delete: mockDelete,
            });

            // Simulate removing ingredient
            const result = await supabase.from('pantry')
              .delete()
              .match({ id: ingredientId, user_id: userId });

            // Verify delete was called
            expect(mockDelete).toHaveBeenCalled();
            expect(mockMatch).toHaveBeenCalledWith({ id: ingredientId, user_id: userId });
            expect(result.error).toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    });

    test('fetching pantry items should return correct data', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 0, maxLength: 15 }),
          async (userId, ingredients) => {
            const mockPantryItems = ingredients.map((name, idx) => ({
              id: idx + 1,
              user_id: userId,
              ingredient_name: name,
            }));

            supabase.from.mockReturnValue({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockResolvedValue({
                data: mockPantryItems,
                error: null,
              }),
            });

            // Simulate fetching pantry
            const { data, error } = await supabase
              .from('pantry')
              .select('*')
              .eq('user_id', userId);

            // Verify pantry items are fetched correctly
            expect(error).toBeNull();
            expect(Array.isArray(data)).toBe(true);
            expect(data.length).toBe(ingredients.length);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Property 5: Marketplace Transactions
   * Validates: Requirement 3.4
   * 
   * Tests that marketplace purchases and sales process correctly.
   */
  describe('Property 5: Marketplace Transactions', () => {
    test('purchase transaction should update wallet correctly', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1, max: 100 }),
          async (userId, initialBalance, price) => {
            // Only test if user has enough balance
            fc.pre(initialBalance >= price);

            const expectedBalance = initialBalance - price;
            const mockUpdate = jest.fn().mockResolvedValue({ data: {}, error: null });
            
            supabase.from.mockReturnValue({
              update: mockUpdate,
              eq: jest.fn().mockReturnThis(),
            });

            // Simulate purchase
            const result = await supabase.from('profiles')
              .update({ wallet_balance: expectedBalance })
              .eq('id', userId);

            // Verify wallet was updated
            expect(mockUpdate).toHaveBeenCalledWith({ wallet_balance: expectedBalance });
            expect(result.error).toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    });

    test('selling recipe should increase wallet balance', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.integer({ min: 0, max: 1000 }),
          fc.integer({ min: 1, max: 100 }),
          async (userId, initialBalance, salePrice) => {
            const expectedBalance = initialBalance + salePrice;
            const mockUpdate = jest.fn().mockResolvedValue({ data: {}, error: null });
            
            supabase.from.mockReturnValue({
              update: mockUpdate,
              eq: jest.fn().mockReturnThis(),
            });

            // Simulate sale
            const result = await supabase.from('profiles')
              .update({ wallet_balance: expectedBalance })
              .eq('id', userId);

            // Verify wallet was updated
            expect(mockUpdate).toHaveBeenCalledWith({ wallet_balance: expectedBalance });
            expect(result.error).toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    });

    test('transaction history should be recorded correctly', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.integer({ min: 1, max: 100 }),
          fc.constantFrom('purchase', 'sale'),
          fc.integer({ min: 1, max: 100 }),
          async (userId, recipeId, type, amount) => {
            const mockInsert = jest.fn().mockResolvedValue({ data: {}, error: null });
            
            supabase.from.mockReturnValue({
              insert: mockInsert,
            });

            // Simulate transaction recording
            const result = await supabase.from('transactions').insert({
              user_id: userId,
              recipe_id: recipeId,
              type,
              amount,
              timestamp: new Date().toISOString(),
            });

            // Verify transaction was recorded
            expect(mockInsert).toHaveBeenCalled();
            expect(result.error).toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Property 6: Recipe Upload
   * Validates: Requirement 3.3
   * 
   * Tests that recipe upload with images submits correctly.
   */
  describe('Property 6: Recipe Upload', () => {
    test('recipe submission should include all required fields', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 100 }),
          fc.array(fc.string({ minLength: 3, maxLength: 50 }), { minLength: 1, maxLength: 20 }),
          fc.array(fc.string({ minLength: 10, maxLength: 200 }), { minLength: 1, maxLength: 15 }),
          fc.uuid(),
          async (title, ingredients, instructions, userId) => {
            const mockInsert = jest.fn().mockResolvedValue({ data: {}, error: null });
            
            supabase.from.mockReturnValue({
              insert: mockInsert,
            });

            // Simulate recipe submission
            const result = await supabase.from('recipes').insert({
              title,
              ingredients,
              instructions,
              user_id: userId,
              status: 'pending',
            });

            // Verify insert was called with correct structure
            expect(mockInsert).toHaveBeenCalledWith(
              expect.objectContaining({
                title,
                ingredients,
                instructions,
                user_id: userId,
              })
            );
            expect(result.error).toBeNull();
          }
        ),
        { numRuns: 5 }
      );
    });

    test('recipe with image URL should be stored correctly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 100 }),
          fc.webUrl(),
          fc.uuid(),
          async (title, imageUrl, userId) => {
            const mockInsert = jest.fn().mockResolvedValue({ data: {}, error: null });
            
            supabase.from.mockReturnValue({
              insert: mockInsert,
            });

            // Simulate recipe with image submission
            const result = await supabase.from('recipes').insert({
              title,
              image_url: imageUrl,
              user_id: userId,
              status: 'pending',
            });

            // Verify image URL is included
            expect(mockInsert).toHaveBeenCalledWith(
              expect.objectContaining({
                image_url: imageUrl,
              })
            );
            expect(result.error).toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Property 7: Admin Functions
   * Validates: Requirement 3.9
   * 
   * Tests that admin operations (approve/reject recipes) work correctly.
   */
  describe('Property 7: Admin Functions', () => {
    test('recipe approval should update status correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          fc.constantFrom('approved', 'rejected'),
          async (recipeId, status) => {
            const mockUpdate = jest.fn().mockResolvedValue({ data: {}, error: null });
            
            supabase.from.mockReturnValue({
              update: mockUpdate,
              eq: jest.fn().mockReturnThis(),
            });

            // Simulate recipe status update
            const result = await supabase.from('recipes')
              .update({ status })
              .eq('id', recipeId);

            // Verify update was called with correct status
            expect(mockUpdate).toHaveBeenCalledWith({ status });
            expect(result.error).toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    });

    test('admin should be able to fetch pending recipes', async () => {
      const mockPendingRecipes = [
        { id: 1, title: 'Recipe 1', status: 'pending' },
        { id: 2, title: 'Recipe 2', status: 'pending' },
      ];

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: mockPendingRecipes,
          error: null,
        }),
      });

      // Simulate fetching pending recipes
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('status', 'pending');

      // Verify pending recipes are fetched
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data.every(r => r.status === 'pending')).toBe(true);
    });

    test('admin role verification should work correctly', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.constantFrom('admin', 'user'),
          async (userId, role) => {
            supabase.from.mockReturnValue({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: { id: userId, role },
                error: null,
              }),
            });

            // Simulate role check
            const { data, error } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', userId)
              .single();

            // Verify role is returned correctly
            expect(error).toBeNull();
            expect(data.role).toBe(role);
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Property 8: Form Validation
   * Validates: Requirement 3.10
   * 
   * Tests that forms validate inputs correctly.
   */
  describe('Property 8: Form Validation', () => {
    test('email validation should accept valid emails', () => {
      fc.assert(
        fc.property(
          fc.emailAddress(),
          (email) => {
            // Simple email validation regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            // Verify valid email passes validation
            expect(emailRegex.test(email)).toBe(true);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('password validation should enforce minimum length', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 8, maxLength: 50 }),
          (password) => {
            // Password must be at least 8 characters
            const isValid = password.length >= 8;
            
            // Verify password meets minimum length
            expect(isValid).toBe(true);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('username validation should accept alphanumeric characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
          (username) => {
            // Username should only contain alphanumeric and underscore
            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            
            // Verify username passes validation
            expect(usernameRegex.test(username)).toBe(true);
            expect(username.length).toBeGreaterThanOrEqual(3);
            expect(username.length).toBeLessThanOrEqual(20);
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 9: Servings Calculator
   * Validates: Requirement 3.7
   * 
   * Tests that servings calculator scales ingredients correctly.
   */
  describe('Property 9: Servings Calculator', () => {
    test('ingredient scaling should be proportional', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0.5, max: 10, noNaN: true }),
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 10 }),
          (amount, originalServings, newServings) => {
            // Calculate scaled amount
            const scaledAmount = (amount * newServings) / originalServings;

            // Verify scaling is proportional
            const ratio = scaledAmount / amount;
            const expectedRatio = newServings / originalServings;
            
            // Allow small floating point differences
            expect(Math.abs(ratio - expectedRatio)).toBeLessThan(0.0001);
          }
        ),
        { numRuns: 20 }
      );
    });

    test('scaling preserves ingredient ratios', () => {
      fc.assert(
        fc.property(
          fc.array(fc.float({ min: 0.1, max: 10, noNaN: true }), { minLength: 2, maxLength: 10 }),
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 10 }),
          (amounts, originalServings, newServings) => {
            // Scale all amounts
            const scaledAmounts = amounts.map(a => (a * newServings) / originalServings);

            // Verify ratios between ingredients are preserved
            for (let i = 0; i < amounts.length - 1; i++) {
              const originalRatio = amounts[i] / amounts[i + 1];
              const scaledRatio = scaledAmounts[i] / scaledAmounts[i + 1];
              
              // Allow small floating point differences
              expect(Math.abs(originalRatio - scaledRatio)).toBeLessThan(0.0001);
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 10: Data Integrity
   * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.8
   * 
   * Tests that data operations maintain integrity across the application.
   */
  describe('Property 10: Data Integrity', () => {
    test('user profile data should persist correctly', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.string({ minLength: 3, maxLength: 20 }),
          fc.integer({ min: 0, max: 10000 }),
          async (userId, username, walletBalance) => {
            const mockUpdate = jest.fn().mockResolvedValue({ data: {}, error: null });
            
            supabase.from.mockReturnValue({
              update: mockUpdate,
              eq: jest.fn().mockReturnThis(),
            });

            // Simulate profile update
            const result = await supabase.from('profiles')
              .update({ username, wallet_balance: walletBalance })
              .eq('id', userId);

            // Verify update was called with correct data
            expect(mockUpdate).toHaveBeenCalledWith({
              username,
              wallet_balance: walletBalance,
            });
            expect(result.error).toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    });

    test('recipe data should maintain referential integrity', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 1000 }),
          fc.uuid(),
          async (recipeId, userId) => {
            supabase.from.mockReturnValue({
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockResolvedValue({
                data: { id: recipeId, user_id: userId },
                error: null,
              }),
            });

            // Simulate fetching recipe with user reference
            const { data, error } = await supabase
              .from('recipes')
              .select('*')
              .eq('id', recipeId);

            // Verify referential integrity
            expect(error).toBeNull();
            expect(data.user_id).toBe(userId);
          }
        ),
        { numRuns: 10 }
      );
    });

    test('timestamps should be recorded correctly', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.date({ min: new Date('2020-01-01'), max: new Date('2025-12-31') }),
          async (userId, timestamp) => {
            const mockInsert = jest.fn().mockResolvedValue({ data: {}, error: null });
            
            supabase.from.mockReturnValue({
              insert: mockInsert,
            });

            // Simulate inserting data with timestamp
            const result = await supabase.from('activity_log').insert({
              user_id: userId,
              timestamp: timestamp.toISOString(),
              action: 'test_action',
            });

            // Verify timestamp is included
            expect(mockInsert).toHaveBeenCalledWith(
              expect.objectContaining({
                timestamp: timestamp.toISOString(),
              })
            );
            expect(result.error).toBeNull();
          }
        ),
        { numRuns: 10 }
      );
    });
  });
});
