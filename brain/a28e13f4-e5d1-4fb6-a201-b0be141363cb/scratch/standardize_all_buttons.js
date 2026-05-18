const fs = require('fs');

const fileUpdates = [
  {
    path: 'c:/Users/HP/Desktop/copier/components/Navbar.tsx',
    replacements: [
      {
        target: 'inline-flex items-center gap-2 shadow-[0_4px_12px_rgba(201,168,76,0.12)]"',
        replace: 'inline-flex items-center gap-2 shadow-[0_4px_12px_rgba(201,168,76,0.12)] rounded-md"'
      },
      {
        target: 'text-center border border-border py-3 hover:border-primary transition-all text-foreground"',
        replace: 'text-center border border-border py-3 hover:border-primary transition-all text-foreground rounded-md"'
      },
      {
        target: 'text-center bg-red/10 border border-red/30 text-red py-3 font-bold hover:bg-red/20 transition-all cursor-pointer"',
        replace: 'text-center bg-red/10 border border-red/30 text-red py-3 font-bold hover:bg-red/20 transition-all cursor-pointer rounded-md"'
      },
      {
        target: 'text-center bg-primary text-primary-foreground py-3 font-bold hover:bg-gold-light transition-all"',
        replace: 'text-center bg-primary text-primary-foreground py-3 font-bold hover:bg-gold-light transition-all rounded-md"'
      }
    ]
  },
  {
    path: 'c:/Users/HP/Desktop/copier/app/page.tsx',
    replacements: [
      {
        target: 'bg-primary text-primary-foreground px-9 py-4 font-bold inline-flex items-center gap-2.5 hover:bg-gold-light hover:-translate-y-0.5 transition-all"',
        replace: 'bg-primary text-primary-foreground px-9 py-4 font-bold inline-flex items-center gap-2.5 hover:bg-gold-light hover:-translate-y-0.5 transition-all rounded-md"'
      },
      {
        target: 'bg-transparent text-foreground border border-border px-9 py-4 inline-flex items-center gap-2.5 hover:border-primary hover:text-primary hover:-translate-y-0.5 transition-all"',
        replace: 'bg-transparent text-foreground border border-border px-9 py-4 inline-flex items-center gap-2.5 hover:border-primary hover:text-primary hover:-translate-y-0.5 transition-all rounded-md"'
      },
      {
        target: 'w-11 h-11 border border-border flex items-center justify-center mb-7 text-lg"',
        replace: 'w-11 h-11 border border-border flex items-center justify-center mb-7 text-lg rounded-lg"'
      },
      {
        target: 'border border-border p-10 max-w-3xl bg-background relative"',
        replace: 'border border-border p-10 max-w-3xl bg-background relative rounded-xl"'
      }
    ]
  },
  {
    path: 'c:/Users/HP/Desktop/copier/app/about/page.tsx',
    replacements: [
      {
        target: 'border border-border p-8 bg-card relative"',
        replace: 'border border-border p-8 bg-card relative rounded-xl"'
      }
    ]
  }
];

console.log("Starting final button and CTA border-radius standardization...");

fileUpdates.forEach(update => {
  if (!fs.existsSync(update.path)) {
    console.log(`- File not found (skipping): ${update.path}`);
    return;
  }
  
  let content = fs.readFileSync(update.path, 'utf8');
  let original = content;
  let count = 0;
  
  update.replacements.forEach(rep => {
    // Escape target content if needed or direct replace
    if (content.includes(rep.target)) {
      content = content.split(rep.target).join(rep.replace);
      count++;
    }
  });
  
  if (content !== original) {
    fs.writeFileSync(update.path, content, 'utf8');
    console.log(`- Standardized ${update.path}: made ${count} target class replacements.`);
  } else {
    console.log(`- No target button styles needed replacement in: ${update.path}`);
  }
});

console.log("Final border-radius standardization complete!");
