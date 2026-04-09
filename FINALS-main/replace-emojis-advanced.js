const fs = require('fs');
const path = require('path');

// Comprehensive emoji to icon mapping with context-aware sizing
const emojiToIcon = {
  // Navigation & Actions
  '🔍': { icon: 'Search', defaultSize: 'w-5 h-5', contexts: { button: 'w-5 h-5', inline: 'w-4 h-4' } },
  '☰': { icon: 'Menu', defaultSize: 'w-7 h-7' },
  '✖': { icon: 'X', defaultSize: 'w-6 h-6' },
  '🛡️': { icon: 'Shield', defaultSize: 'w-4 h-4' },
  '📦': { icon: 'Package', defaultSize: 'w-4 h-4' },
  '⭐': { icon: 'Star', defaultSize: 'w-4 h-4' },
  '🛒': { icon: 'ShoppingCart', defaultSize: 'w-4 h-4' },
  '🚪': { icon: 'LogOut', defaultSize: 'w-5 h-5' },
  
  // Food & Cooking
  '🍴': { icon: 'Utensils', defaultSize: 'w-6 h-6' },
  '👨‍🍳': { icon: 'ChefHat', defaultSize: 'w-6 h-6' },
  '🍳': { icon: 'CookingPot', defaultSize: 'w-6 h-6' },
  '🔥': { icon: 'Flame', defaultSize: 'w-4 h-4' },
  '🍽️': { icon: 'UtensilsCrossed', defaultSize: 'w-8 h-8' },
  '🧂': { icon: 'Droplet', defaultSize: 'w-4 h-4' },
  
  // Media & Content
  '📸': { icon: 'Camera', defaultSize: 'w-6 h-6' },
  '🖼️': { icon: 'Image', defaultSize: 'w-6 h-6' },
  '🎤': { icon: 'Mic', defaultSize: 'w-6 h-6' },
  '🔴': { icon: 'Circle', defaultSize: 'w-6 h-6', extraClass: 'fill-red-500 text-red-500' },
  '📷': { icon: 'Camera', defaultSize: 'w-5 h-5' },
  '🎬': { icon: 'Video', defaultSize: 'w-5 h-5' },
  
  // Time & Status
  '⏱️': { icon: 'Clock', defaultSize: 'w-4 h-4' },
  '⏳': { icon: 'Hourglass', defaultSize: 'w-5 h-5' },
  '✅': { icon: 'CheckCircle', defaultSize: 'w-5 h-5', extraClass: 'text-green-600' },
  '❌': { icon: 'XCircle', defaultSize: 'w-5 h-5', extraClass: 'text-red-600' },
  '⚠️': { icon: 'AlertTriangle', defaultSize: 'w-5 h-5', extraClass: 'text-yellow-600' },
  
  // User & Profile
  '👤': { icon: 'User', defaultSize: 'w-4 h-4' },
  '👥': { icon: 'Users', defaultSize: 'w-5 h-5' },
  '💰': { icon: 'Wallet', defaultSize: 'w-5 h-5' },
  '💵': { icon: 'Banknote', defaultSize: 'w-5 h-5' },
  
  // Actions & Features
  '🗑️': { icon: 'Trash2', defaultSize: 'w-4 h-4' },
  '✏️': { icon: 'Edit', defaultSize: 'w-4 h-4' },
  '👁️': { icon: 'Eye', defaultSize: 'w-5 h-5' },
  '🔊': { icon: 'Volume2', defaultSize: 'w-6 h-6' },
  '🔄': { icon: 'RefreshCw', defaultSize: 'w-4 h-4' },
  '⏮': { icon: 'SkipBack', defaultSize: 'w-5 h-5' },
  '⏭': { icon: 'SkipForward', defaultSize: 'w-5 h-5' },
  '▶': { icon: 'Play', defaultSize: 'w-5 h-5' },
  '⏸': { icon: 'Pause', defaultSize: 'w-5 h-5' },
  '⏹': { icon: 'Square', defaultSize: 'w-5 h-5', extraClass: 'fill-current' },
  '🔒': { icon: 'Lock', defaultSize: 'w-5 h-5' },
  '🔓': { icon: 'Unlock', defaultSize: 'w-5 h-5' },
  
  // Data & Analytics
  '📊': { icon: 'BarChart', defaultSize: 'w-6 h-6' },
  '📋': { icon: 'ClipboardList', defaultSize: 'w-6 h-6' },
  '📝': { icon: 'FileText', defaultSize: 'w-5 h-5' },
  '📂': { icon: 'Folder', defaultSize: 'w-4 h-4' },
  '⚙️': { icon: 'Settings', defaultSize: 'w-6 h-6' },
  
  // Status Indicators
  '🏅': { icon: 'Award', defaultSize: 'w-5 h-5' },
  '🏆': { icon: 'Trophy', defaultSize: 'w-5 h-5' },
  '✓': { icon: 'Check', defaultSize: 'w-4 h-4' },
  '🔔': { icon: 'Bell', defaultSize: 'w-5 h-5' },
  
  // Additional
  '✨': { icon: 'Sparkles', defaultSize: 'w-4 h-4' },
  '📬': { icon: 'Mail', defaultSize: 'w-8 h-8' },
  '✉️': { icon: 'Mail', defaultSize: 'w-8 h-8' },
  '🔐': { icon: 'KeyRound', defaultSize: 'w-4 h-4' },
  '🥕': { icon: 'Carrot', defaultSize: 'w-4 h-4' },
  '🧹': { icon: 'Broom', defaultSize: 'w-4 h-4' },
  '🤖': { icon: 'Bot', defaultSize: 'w-5 h-5' },
};

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getRequiredIcons(content) {
  const icons = new Set();
  for (const [emoji, config] of Object.entries(emojiToIcon)) {
    if (content.includes(emoji)) {
      icons.add(config.icon);
    }
  }
  return Array.from(icons).sort();
}

function replaceEmojisInContent(content) {
  let modified = content;
  const replacements = [];
  
  // Sort emojis by length (longest first) to handle multi-char emojis correctly
  const sortedEmojis = Object.entries(emojiToIcon).sort((a, b) => b[0].length - a[0].length);
  
  for (const [emoji, config] of sortedEmojis) {
    if (!modified.includes(emoji)) continue;
    
    const { icon, defaultSize, extraClass = '' } = config;
    
    // Pattern 1: Emoji in JSX text with surrounding text (e.g., "🔍 Search")
    // Match: >emoji text< or >text emoji<
    const jsxTextPattern = new RegExp(
      `>([^<]*?)${escapeRegex(emoji)}([^<]*?)<`,
      'g'
    );
    
    modified = modified.replace(jsxTextPattern, (match, before, after) => {
      const beforeTrimmed = before.trim();
      const afterTrimmed = after.trim();
      
      if (beforeTrimmed || afterTrimmed) {
        // Emoji with text - make it inline
        replacements.push({ emoji, icon, context: 'jsx-text' });
        const className = `${defaultSize} inline-block ${extraClass}`.trim();
        return `>${before}<${icon} className="${className}" />${after}<`;
      }
      return match;
    });
    
    // Pattern 2: Emoji in div/span className (e.g., <div>🔍</div>)
    const jsxOnlyPattern = new RegExp(
      `>\\s*${escapeRegex(emoji)}\\s*<`,
      'g'
    );
    
    modified = modified.replace(jsxOnlyPattern, (match) => {
      replacements.push({ emoji, icon, context: 'jsx-only' });
      const className = `${defaultSize} ${extraClass}`.trim();
      return `><${icon} className="${className}" /><`;
    });
    
    // Pattern 3: Emoji in template literals or strings (keep as is with comment)
    const stringPattern = new RegExp(
      `(['"\`])([^'"]*?)${escapeRegex(emoji)}([^'"]*?)\\1`,
      'g'
    );
    
    // Don't replace in strings, just mark them
    if (stringPattern.test(modified)) {
      replacements.push({ emoji, icon, context: 'string-literal' });
    }
  }
  
  return { modified, replacements };
}

function addIconImports(content, icons) {
  if (icons.length === 0) return content;
  
  const importPattern = /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/;
  const match = content.match(importPattern);
  
  if (match) {
    // Merge with existing imports
    const existingIcons = match[1]
      .split(',')
      .map(i => i.trim())
      .filter(Boolean);
    const allIcons = [...new Set([...existingIcons, ...icons])].sort();
    const newImport = `import { ${allIcons.join(', ')} } from 'lucide-react'`;
    return content.replace(importPattern, newImport);
  } else {
    // Find the best place to add import
    const reactImportPattern = /(import\s+React[^;]+;)/;
    const firstImportPattern = /(^import\s+[^;]+;)/m;
    
    const newImport = `import { ${icons.join(', ')} } from 'lucide-react';`;
    
    if (reactImportPattern.test(content)) {
      return content.replace(reactImportPattern, `$1\n${newImport}`);
    } else if (firstImportPattern.test(content)) {
      return content.replace(firstImportPattern, `${newImport}\n$1`);
    } else {
      return `${newImport}\n\n${content}`;
    }
  }
}

function processFile(filePath) {
  console.log(`\n📄 Processing: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  File not found, skipping...`);
    return { success: false, reason: 'not found' };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file has emojis
  const hasEmojis = Object.keys(emojiToIcon).some(emoji => content.includes(emoji));
  
  if (!hasEmojis) {
    console.log(`   ℹ️  No emojis found, skipping...`);
    return { success: true, reason: 'no emojis', skipped: true };
  }
  
  // Get required icons
  const requiredIcons = getRequiredIcons(content);
  console.log(`   🎨 Icons needed: ${requiredIcons.slice(0, 5).join(', ')}${requiredIcons.length > 5 ? '...' : ''}`);
  
  // Replace emojis
  const { modified, replacements } = replaceEmojisInContent(content);
  
  // Add imports (skip for backend/non-React files)
  let final = modified;
  const isReactFile = filePath.endsWith('.js') && filePath.includes('src/');
  
  if (isReactFile && requiredIcons.length > 0) {
    final = addIconImports(modified, requiredIcons);
  }
  
  // Only write if changes were made
  if (final !== content) {
    // Create backup
    const backupPath = filePath + '.emoji-backup';
    fs.writeFileSync(backupPath, content, 'utf8');
    
    // Write modified file
    fs.writeFileSync(filePath, final, 'utf8');
    
    console.log(`   ✅ Replaced ${replacements.length} emoji instances`);
    console.log(`   💾 Backup: ${path.basename(backupPath)}`);
    
    return { 
      success: true, 
      replacements: replacements.length,
      icons: requiredIcons,
      modified: true
    };
  } else {
    console.log(`   ℹ️  No changes needed`);
    return { success: true, reason: 'no changes', skipped: true };
  }
}

function main() {
  console.log('🚀 Emoji to Icon Replacement Script');
  console.log('=' .repeat(70));
  console.log('This script will replace emojis with Lucide React icons\n');
  
  const filesToProcess = [
    'src/App.js',
    'src/components/Home.js',
    'src/components/Pantry.js',
    'src/components/Favorites.js',
    'src/components/Login.js',
    'src/components/Signup.js',
    'src/components/Marketplace.js',
    'src/components/Profile.js',
    'src/components/RecipeTemplate.js',
    'src/components/UploadRecipe.js',
    'src/components/AdminDashboard.js',
    'src/components/TransactionHistory.js',
  ];
  
  const results = {
    processed: 0,
    skipped: 0,
    failed: 0,
    totalReplacements: 0,
    allIcons: new Set(),
  };
  
  for (const file of filesToProcess) {
    const result = processFile(file);
    
    if (result.success) {
      if (result.skipped) {
        results.skipped++;
      } else if (result.modified) {
        results.processed++;
        results.totalReplacements += result.replacements || 0;
        if (result.icons) {
          result.icons.forEach(icon => results.allIcons.add(icon));
        }
      }
    } else {
      results.failed++;
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Summary Report:');
  console.log(`   ✅ Files modified: ${results.processed}`);
  console.log(`   ⏭️  Files skipped: ${results.skipped}`);
  console.log(`   ❌ Files failed: ${results.failed}`);
  console.log(`   🔄 Total replacements: ${results.totalReplacements}`);
  console.log(`   🎨 Unique icons used: ${results.allIcons.size}`);
  
  if (results.allIcons.size > 0) {
    console.log(`\n📦 Icons imported: ${Array.from(results.allIcons).join(', ')}`);
  }
  
  console.log('\n💡 Next Steps:');
  console.log('   1. Run: npm start (to test the changes)');
  console.log('   2. Review each modified file visually');
  console.log('   3. Adjust icon sizes/colors if needed');
  console.log('   4. Check console for any React errors');
  console.log('   5. Delete .emoji-backup files once satisfied');
  console.log('\n   To restore a file: mv file.js.emoji-backup file.js');
  
  console.log('\n✨ Replacement complete!\n');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { replaceEmojisInContent, addIconImports, getRequiredIcons };
