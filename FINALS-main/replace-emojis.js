const fs = require('fs');
const path = require('path');

// Comprehensive emoji to icon mapping
const emojiToIcon = {
  // Navigation & Actions
  '🔍': { icon: 'Search', size: 'w-5 h-5' },
  '☰': { icon: 'Menu', size: 'w-7 h-7' },
  '✖': { icon: 'X', size: 'w-6 h-6' },
  '🛡️': { icon: 'Shield', size: 'w-4 h-4' },
  '📦': { icon: 'Package', size: 'w-4 h-4' },
  '⭐': { icon: 'Star', size: 'w-4 h-4' },
  '🛒': { icon: 'ShoppingCart', size: 'w-4 h-4' },
  '🚪': { icon: 'LogOut', size: 'w-5 h-5' },
  
  // Food & Cooking
  '🍴': { icon: 'Utensils', size: 'w-6 h-6' },
  '👨‍🍳': { icon: 'ChefHat', size: 'w-6 h-6' },
  '🍳': { icon: 'CookingPot', size: 'w-6 h-6' },
  '🔥': { icon: 'Flame', size: 'w-4 h-4' },
  '🍽️': { icon: 'UtensilsCrossed', size: 'w-8 h-8' },
  '🧂': { icon: 'Droplet', size: 'w-4 h-4' },
  
  // Media & Content
  '📸': { icon: 'Camera', size: 'w-6 h-6' },
  '🖼️': { icon: 'Image', size: 'w-6 h-6' },
  '🎤': { icon: 'Mic', size: 'w-6 h-6' },
  '🔴': { icon: 'Circle', size: 'w-6 h-6', extraClass: 'fill-red-500 text-red-500' },
  '📷': { icon: 'Camera', size: 'w-5 h-5' },
  '🎬': { icon: 'Video', size: 'w-5 h-5' },
  
  // Time & Status
  '⏱️': { icon: 'Clock', size: 'w-4 h-4' },
  '⏳': { icon: 'Hourglass', size: 'w-5 h-5' },
  '✅': { icon: 'CheckCircle', size: 'w-5 h-5', extraClass: 'text-green-600' },
  '❌': { icon: 'XCircle', size: 'w-5 h-5', extraClass: 'text-red-600' },
  '⚠️': { icon: 'AlertTriangle', size: 'w-5 h-5', extraClass: 'text-yellow-600' },
  
  // User & Profile
  '👤': { icon: 'User', size: 'w-4 h-4' },
  '👥': { icon: 'Users', size: 'w-5 h-5' },
  '💰': { icon: 'Wallet', size: 'w-5 h-5' },
  '💵': { icon: 'Banknote', size: 'w-5 h-5' },
  
  // Actions & Features
  '🗑️': { icon: 'Trash2', size: 'w-4 h-4' },
  '✏️': { icon: 'Edit', size: 'w-4 h-4' },
  '👁️': { icon: 'Eye', size: 'w-5 h-5' },
  '🔊': { icon: 'Volume2', size: 'w-6 h-6' },
  '🔄': { icon: 'RefreshCw', size: 'w-4 h-4' },
  '⏮': { icon: 'SkipBack', size: 'w-5 h-5' },
  '⏭': { icon: 'SkipForward', size: 'w-5 h-5' },
  '▶': { icon: 'Play', size: 'w-5 h-5' },
  '⏸': { icon: 'Pause', size: 'w-5 h-5' },
  '⏹': { icon: 'Square', size: 'w-5 h-5' },
  '🔒': { icon: 'Lock', size: 'w-5 h-5' },
  '🔓': { icon: 'Unlock', size: 'w-5 h-5' },
  
  // Data & Analytics
  '📊': { icon: 'BarChart', size: 'w-6 h-6' },
  '📋': { icon: 'ClipboardList', size: 'w-6 h-6' },
  '📝': { icon: 'FileText', size: 'w-5 h-5' },
  '📂': { icon: 'Folder', size: 'w-4 h-4' },
  '⚙️': { icon: 'Settings', size: 'w-6 h-6' },
  
  // Status Indicators
  '🏅': { icon: 'Award', size: 'w-5 h-5' },
  '🏆': { icon: 'Trophy', size: 'w-5 h-5' },
  '✓': { icon: 'Check', size: 'w-4 h-4' },
  '🔔': { icon: 'Bell', size: 'w-5 h-5' },
  
  // Additional common emojis
  '✨': { icon: 'Sparkles', size: 'w-4 h-4' },
  '📬': { icon: 'Mail', size: 'w-8 h-8' },
  '✉️': { icon: 'Mail', size: 'w-8 h-8' },
  '🔐': { icon: 'KeyRound', size: 'w-4 h-4' },
  '🥕': { icon: 'Carrot', size: 'w-4 h-4' },
  '🧹': { icon: 'Broom', size: 'w-4 h-4' },
};

// Files to process
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
  'backend/server.js',
];

// Extract unique icons needed
function getRequiredIcons(content) {
  const icons = new Set();
  
  for (const [emoji, config] of Object.entries(emojiToIcon)) {
    if (content.includes(emoji)) {
      icons.add(config.icon);
    }
  }
  
  return Array.from(icons).sort();
}

// Replace emojis in content
function replaceEmojis(content, filePath) {
  let modified = content;
  let replacements = [];
  
  // Special handling for different contexts
  for (const [emoji, config] of Object.entries(emojiToIcon)) {
    if (!modified.includes(emoji)) continue;
    
    const { icon, size, extraClass = '' } = config;
    const className = `${size} ${extraClass}`.trim();
    
    // Pattern 1: Emoji in span with text-* class (most common)
    const spanPattern = new RegExp(
      `<span([^>]*?)>\\s*${escapeRegex(emoji)}\\s*</span>`,
      'g'
    );
    if (spanPattern.test(modified)) {
      modified = modified.replace(spanPattern, (match, attrs) => {
        replacements.push({ emoji, icon, context: 'span' });
        return `<${icon} className="${className}"${attrs.includes('className') ? ' ' + attrs : ''} />`;
      });
    }
    
    // Pattern 2: Emoji in text content (inline with text)
    const inlinePattern = new RegExp(
      `([>\\s])${escapeRegex(emoji)}([\\s<])`,
      'g'
    );
    if (inlinePattern.test(modified)) {
      modified = modified.replace(inlinePattern, (match, before, after) => {
        replacements.push({ emoji, icon, context: 'inline' });
        return `${before}<${icon} className="${className} inline" />${after}`;
      });
    }
    
    // Pattern 3: Emoji in string literals (for labels, etc.)
    const stringPattern = new RegExp(
      `(['"\`])([^'"]*?)${escapeRegex(emoji)}([^'"]*?)\\1`,
      'g'
    );
    if (stringPattern.test(modified)) {
      modified = modified.replace(stringPattern, (match, quote, before, after) => {
        replacements.push({ emoji, icon, context: 'string' });
        // Keep emoji in strings but add comment
        return `${quote}${before}${emoji}${after}${quote} {/* TODO: Replace with icon */}`;
      });
    }
  }
  
  return { modified, replacements };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Add import statement
function addIconImports(content, icons) {
  // Check if lucide-react import already exists
  const importPattern = /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/;
  const match = content.match(importPattern);
  
  if (match) {
    // Merge with existing imports
    const existingIcons = match[1].split(',').map(i => i.trim()).filter(Boolean);
    const allIcons = [...new Set([...existingIcons, ...icons])].sort();
    const newImport = `import { ${allIcons.join(', ')} } from 'lucide-react'`;
    return content.replace(importPattern, newImport);
  } else {
    // Add new import after React import
    const reactImportPattern = /(import React[^;]+;)/;
    const newImport = `\nimport { ${icons.join(', ')} } from 'lucide-react';`;
    
    if (reactImportPattern.test(content)) {
      return content.replace(reactImportPattern, `$1${newImport}`);
    } else {
      // Add at the beginning
      return newImport + '\n' + content;
    }
  }
}

// Process a single file
function processFile(filePath) {
  console.log(`\n📄 Processing: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  File not found, skipping...`);
    return { success: false, reason: 'not found' };
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file has emojis to replace
  const hasEmojis = Object.keys(emojiToIcon).some(emoji => content.includes(emoji));
  
  if (!hasEmojis) {
    console.log(`   ℹ️  No emojis found, skipping...`);
    return { success: true, reason: 'no emojis' };
  }
  
  // Get required icons
  const requiredIcons = getRequiredIcons(content);
  console.log(`   🎨 Icons needed: ${requiredIcons.join(', ')}`);
  
  // Replace emojis
  const { modified, replacements } = replaceEmojis(content, filePath);
  
  // Add imports (skip for backend files)
  let final = modified;
  if (!filePath.includes('backend') && requiredIcons.length > 0) {
    final = addIconImports(modified, requiredIcons);
  }
  
  // Create backup
  const backupPath = filePath + '.backup';
  fs.writeFileSync(backupPath, content, 'utf8');
  
  // Write modified file
  fs.writeFileSync(filePath, final, 'utf8');
  
  console.log(`   ✅ Replaced ${replacements.length} emoji instances`);
  console.log(`   💾 Backup saved to: ${backupPath}`);
  
  return { 
    success: true, 
    replacements: replacements.length,
    icons: requiredIcons 
  };
}

// Main execution
function main() {
  console.log('🚀 Starting emoji to icon replacement...\n');
  console.log('=' .repeat(60));
  
  const results = {
    processed: 0,
    skipped: 0,
    failed: 0,
    totalReplacements: 0,
  };
  
  for (const file of filesToProcess) {
    const result = processFile(file);
    
    if (result.success) {
      if (result.reason === 'no emojis') {
        results.skipped++;
      } else {
        results.processed++;
        results.totalReplacements += result.replacements || 0;
      }
    } else {
      results.failed++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`   ✅ Files processed: ${results.processed}`);
  console.log(`   ⏭️  Files skipped: ${results.skipped}`);
  console.log(`   ❌ Files failed: ${results.failed}`);
  console.log(`   🔄 Total replacements: ${results.totalReplacements}`);
  
  console.log('\n💡 Next steps:');
  console.log('   1. Review the changes in each file');
  console.log('   2. Test the application thoroughly');
  console.log('   3. Manually fix any TODO comments for string literals');
  console.log('   4. Adjust icon sizes/colors as needed');
  console.log('   5. Delete .backup files once satisfied');
  console.log('\n✨ Done!\n');
}

// Run the script
main();
