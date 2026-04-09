/**
 * Bug Condition Exploration Test
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7**
 * 
 * Property 1: Bug Condition - Icon String Literals Render as Text
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * DO NOT attempt to fix the test or the code when it fails
 * NOTE: This test encodes the expected behavior - it will validate the fix when it passes after implementation
 * GOAL: Surface counterexamples that demonstrate icon string literals are rendering as text instead of visual icons
 * 
 * This test verifies that Lucide React icons render as visual icon components, not as text strings.
 * On unfixed code, this test will FAIL because icons are placed inside string literals.
 */

import fs from 'fs';
import path from 'path';

describe('Bug Condition Exploration: Icon String Literals in Source Code', () => {
  /**
   * Helper function to check if code contains icon string literals
   * Returns array of found icon string literals
   */
  const findIconStringLiterals = (fileContent) => {
    const patterns = [
      // Pattern 1: Icon components in single quotes
      /'<[A-Z][a-zA-Z]+ className="[^"]*inline-block[^"]*"[^>]*>/g,
      // Pattern 2: Icon components in template literals
      /`<[A-Z][a-zA-Z]+ className="[^"]*inline-block[^"]*"[^>]*>/g,
      // Pattern 3: Icon components in double quotes (less common but possible)
      /"<[A-Z][a-zA-Z]+ className='[^']*inline-block[^']*'[^>]*>/g,
    ];

    const found = [];
    patterns.forEach((pattern) => {
      const matches = fileContent.match(pattern);
      if (matches) {
        found.push(...matches);
      }
    });

    return found;
  };

  /**
   * Test Case 1: Profile.js - Achievement Badges Icon String Literals
   * 
   * Expected on UNFIXED code: File contains icon string literals in achievement badges
   * Example: { label: '<Star className="w-4 h-4 inline-block" /> First Favorite', ... }
   * 
   * Expected on FIXED code: No icon string literals found
   */
  test('Profile.js should not contain icon string literals in achievement badges', () => {
    const profilePath = path.join(__dirname, 'Profile.js');
    const profileContent = fs.readFileSync(profilePath, 'utf-8');

    // Search for specific icon string literal patterns
    const starIconLiterals = profileContent.match(/'<Star className="[^"]*inline-block[^"]*"[^>]*>/g);
    const cookingPotLiterals = profileContent.match(/'<CookingPot className="[^"]*inline-block[^"]*"[^>]*>/g);
    const chefHatLiterals = profileContent.match(/'<ChefHat className="[^"]*inline-block[^"]*"[^>]*>/g);
    const trophyLiterals = profileContent.match(/'<Trophy className="[^"]*inline-block[^"]*"[^>]*>/g);

    // EXPECTED OUTCOME ON UNFIXED CODE: These will be found (test FAILS)
    // EXPECTED OUTCOME ON FIXED CODE: These will NOT be found (test PASSES)
    
    // Document counterexamples if found
    if (starIconLiterals) {
      console.log('\n🐛 COUNTEREXAMPLE FOUND - Star icon string literals:');
      starIconLiterals.forEach((literal, idx) => {
        console.log(`  ${idx + 1}. ${literal}`);
      });
    }

    if (cookingPotLiterals) {
      console.log('\n🐛 COUNTEREXAMPLE FOUND - CookingPot icon string literals:');
      cookingPotLiterals.forEach((literal, idx) => {
        console.log(`  ${idx + 1}. ${literal}`);
      });
    }

    if (chefHatLiterals) {
      console.log('\n🐛 COUNTEREXAMPLE FOUND - ChefHat icon string literals:');
      chefHatLiterals.forEach((literal, idx) => {
        console.log(`  ${idx + 1}. ${literal}`);
      });
    }

    if (trophyLiterals) {
      console.log('\n🐛 COUNTEREXAMPLE FOUND - Trophy icon string literals:');
      trophyLiterals.forEach((literal, idx) => {
        console.log(`  ${idx + 1}. ${literal}`);
      });
    }

    // Assertions - these will FAIL on unfixed code
    expect(starIconLiterals).toBeNull();
    expect(cookingPotLiterals).toBeNull();
    expect(chefHatLiterals).toBeNull();
    expect(trophyLiterals).toBeNull();
  });

  /**
   * Test Case 2: Profile.js - Status Badge Icon String Literals
   * 
   * Expected on UNFIXED code: File contains icon string literals in status badges
   * Example: '<CheckCircle className="w-5 h-5 inline-block text-green-600" /> Live'
   * 
   * Expected on FIXED code: No icon string literals found
   */
  test('Profile.js should not contain icon string literals in status badges', () => {
    const profilePath = path.join(__dirname, 'Profile.js');
    const profileContent = fs.readFileSync(profilePath, 'utf-8');

    const checkCircleLiterals = profileContent.match(/'<CheckCircle className="[^"]*inline-block[^"]*"[^>]*>/g);
    const hourglassLiterals = profileContent.match(/'<Hourglass className="[^"]*inline-block[^"]*"[^>]*>/g);
    const xCircleLiterals = profileContent.match(/'<XCircle className="[^"]*inline-block[^"]*"[^>]*>/g);

    // Document counterexamples
    if (checkCircleLiterals) {
      console.log('\n🐛 COUNTEREXAMPLE FOUND - CheckCircle icon string literals:');
      checkCircleLiterals.forEach((literal, idx) => {
        console.log(`  ${idx + 1}. ${literal}`);
      });
    }

    if (hourglassLiterals) {
      console.log('\n🐛 COUNTEREXAMPLE FOUND - Hourglass icon string literals:');
      hourglassLiterals.forEach((literal, idx) => {
        console.log(`  ${idx + 1}. ${literal}`);
      });
    }

    if (xCircleLiterals) {
      console.log('\n🐛 COUNTEREXAMPLE FOUND - XCircle icon string literals:');
      xCircleLiterals.forEach((literal, idx) => {
        console.log(`  ${idx + 1}. ${literal}`);
      });
    }

    // EXPECTED OUTCOME ON UNFIXED CODE: These assertions will FAIL
    expect(checkCircleLiterals).toBeNull();
    expect(hourglassLiterals).toBeNull();
    expect(xCircleLiterals).toBeNull();
  });

  /**
   * Test Case 3: Profile.js - Lock and Check Icon String Literals
   * 
   * Expected on UNFIXED code: File contains icon string literals for lock/check indicators
   * Example: '<Check className="w-4 h-4 inline-block" />' or '<Lock className="w-5 h-5 inline-block" />'
   * 
   * Expected on FIXED code: No icon string literals found
   */
  test('Profile.js should not contain icon string literals for lock/check indicators', () => {
    const profilePath = path.join(__dirname, 'Profile.js');
    const profileContent = fs.readFileSync(profilePath, 'utf-8');

    const checkLiterals = profileContent.match(/'<Check className="[^"]*inline-block[^"]*"[^>]*>/g);
    const lockLiterals = profileContent.match(/'<Lock className="[^"]*inline-block[^"]*"[^>]*>/g);

    // Document counterexamples
    if (checkLiterals) {
      console.log('\n🐛 COUNTEREXAMPLE FOUND - Check icon string literals:');
      checkLiterals.forEach((literal, idx) => {
        console.log(`  ${idx + 1}. ${literal}`);
      });
    }

    if (lockLiterals) {
      console.log('\n🐛 COUNTEREXAMPLE FOUND - Lock icon string literals:');
      lockLiterals.forEach((literal, idx) => {
        console.log(`  ${idx + 1}. ${literal}`);
      });
    }

    // EXPECTED OUTCOME ON UNFIXED CODE: These assertions will FAIL
    expect(checkLiterals).toBeNull();
    expect(lockLiterals).toBeNull();
  });

  /**
   * Test Case 4: Profile.js - Wallet Icon String Literal
   * 
   * Expected on UNFIXED code: File contains icon string literal in wallet section
   * Example: '<Wallet className="w-5 h-5 inline-block" /> Wallet'
   * 
   * Expected on FIXED code: No icon string literals found
   */
  test('Profile.js should not contain Wallet icon string literals', () => {
    const profilePath = path.join(__dirname, 'Profile.js');
    const profileContent = fs.readFileSync(profilePath, 'utf-8');

    const walletLiterals = profileContent.match(/'<Wallet className="[^"]*inline-block[^"]*"[^>]*>/g);

    // Document counterexamples
    if (walletLiterals) {
      console.log('\n🐛 COUNTEREXAMPLE FOUND - Wallet icon string literals:');
      walletLiterals.forEach((literal, idx) => {
        console.log(`  ${idx + 1}. ${literal}`);
      });
    }

    // EXPECTED OUTCOME ON UNFIXED CODE: This assertion will FAIL
    expect(walletLiterals).toBeNull();
  });

  /**
   * Test Case 5: Comprehensive Check - All Icon String Literals in Profile.js
   * 
   * This test provides a comprehensive overview of all icon string literals found
   */
  test('Profile.js should not contain any icon string literals', () => {
    const profilePath = path.join(__dirname, 'Profile.js');
    const profileContent = fs.readFileSync(profilePath, 'utf-8');

    const allIconLiterals = findIconStringLiterals(profileContent);

    // Document all counterexamples
    if (allIconLiterals.length > 0) {
      console.log('\n🐛 COMPREHENSIVE COUNTEREXAMPLE REPORT:');
      console.log(`   Total icon string literals found: ${allIconLiterals.length}`);
      console.log('\n   Details:');
      allIconLiterals.forEach((literal, idx) => {
        console.log(`   ${idx + 1}. ${literal.substring(0, 80)}${literal.length > 80 ? '...' : ''}`);
      });
      console.log('\n   ✅ Bug confirmed: Icon components are placed inside string literals');
      console.log('   ❌ Expected behavior: Icons should be rendered as JSX components\n');
    }

    // EXPECTED OUTCOME ON UNFIXED CODE: This assertion will FAIL
    // This confirms the bug exists
    expect(allIconLiterals.length).toBe(0);
  });
});
