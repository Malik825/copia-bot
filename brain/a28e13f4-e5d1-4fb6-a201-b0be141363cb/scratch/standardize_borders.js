const fs = require('fs');

const files = [
  'c:/Users/HP/Desktop/copier/app/admin/page.tsx',
  'c:/Users/HP/Desktop/copier/app/pricing/page.tsx',
  'c:/Users/HP/Desktop/copier/app/contact/page.tsx',
  'c:/Users/HP/Desktop/copier/components/Navbar.tsx',
  'c:/Users/HP/Desktop/copier/app/about/page.tsx',
  'c:/Users/HP/Desktop/copier/app/page.tsx'
];

console.log("Starting global border-radius standardization...");

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`- File not found (skipping): ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  // 1. Replace sharp rounded-sm with elegant rounded-md for inputs, buttons, and badges
  const countSm = (content.match(/rounded-sm/g) || []).length;
  content = content.replace(/rounded-sm/g, 'rounded-md');
  
  // 2. Standardize basic "rounded" to "rounded-lg" for card interfaces
  // Using a regex to find "rounded" as a whole word in classNames that is NOT followed by a dash
  const classRegex = /className="([^"]*)"/g;
  let countBase = 0;
  
  content = content.replace(classRegex, (match, classList) => {
    // Check if "rounded" is in the classList but not as part of "rounded-*"
    const classes = classList.split(/\s+/);
    let modified = false;
    const newClasses = classes.map(cls => {
      if (cls === 'rounded') {
        modified = true;
        countBase++;
        return 'rounded-lg';
      }
      return cls;
    });
    return modified ? `className="${newClasses.join(' ')}"` : match;
  });
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`- Standardized ${filePath}: replaced ${countSm} 'rounded-sm' -> 'rounded-md' & ${countBase} 'rounded' -> 'rounded-lg'`);
  } else {
    console.log(`- No border radius modifications needed for: ${filePath}`);
  }
});

console.log("Global border-radius standardization complete!");
