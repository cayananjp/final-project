const fs = require('fs');

// Fix files where icons were placed inside strings/template literals
const fixes = [
  {
    file: 'src/components/Home.js',
    replacements: [
      {
        // Fix the rating line
        old: `rating: recipe.id === "lechon-kawali" ? "<Star className="w-4 h-4 inline-block" />⭐⭐⭐½" : "⭐⭐⭐⭐⭐"`,
        new: `rating: recipe.id === "lechon-kawali" ? "⭐⭐⭐⭐½" : "⭐⭐⭐⭐⭐"`
      },
      {
        // Fix the voice input conditional
        old: `<div className="text-[2.2rem] mb-2">{isListening ? '<Circle className="w-6 h-6 inline-block fill-red-500 text-red-500" />' : '<Mic className="w-6 h-6 inline-block" />'}</div>`,
        new: `<div className="flex justify-center mb-2">{isListening ? <Circle className="w-8 h-8 fill-red-500 text-red-500" /> : <Mic className="w-8 h-8 text-gray-700" />}</div>`
      },
      {
        // Fix camera icon container
        old: `<div className="text-[2.2rem] mb-2"><Camera className="w-6 h-6" /></div>`,
        new: `<div className="flex justify-center mb-2"><Camera className="w-10 h-10" /></div>`
      },
      {
        // Fix image icon container
        old: `<div className="text-[2.2rem] mb-2"><Image className="w-6 h-6" /></div>`,
        new: `<div className="flex justify-center mb-2"><Image className="w-10 h-10" /></div>`
      },
      {
        // Fix empty dish icon
        old: `<div className="text-[3.5rem] mb-4 opacity-80"><UtensilsCrossed className="w-8 h-8" /></div>`,
        new: `<div className="flex justify-center mb-4 opacity-80"><UtensilsCrossed className="w-16 h-16 text-gray-400" /></div>`
      }
    ]
  }
];

function applyFixes() {
  console.log('🔧 Applying manual fixes for icon strings...\n');
  
  let totalFixes = 0;
  
  for (const { file, replacements } of fixes) {
    console.log(`📄 Fixing: ${file}`);
    
    if (!fs.existsSync(file)) {
      console.log(`   ⚠️  File not found, skipping...`);
      continue;
    }
    
    let content = fs.readFileSync(file, 'utf8');
    let fileFixed = 0;
    
    for (const { old, new: newStr } of replacements) {
      if (content.includes(old)) {
        content = content.replace(old, newStr);
        fileFixed++;
        totalFixes++;
      }
    }
    
    if (fileFixed > 0) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`   ✅ Applied ${fileFixed} fixes`);
    } else {
      console.log(`   ℹ️  No fixes needed`);
    }
  }
  
  console.log(`\n✨ Total fixes applied: ${totalFixes}\n`);
}

applyFixes();
