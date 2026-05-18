const fs = require('fs');

const rebrandJobs = [
  {
    path: 'c:/Users/HP/Desktop/copier/components/Navbar.tsx',
    replacements: [
      { from: 'CopierBot', to: 'TruFunder' },
      { from: 'COPIERBOT', to: 'TRUFUNDER' }
    ]
  },
  {
    path: 'c:/Users/HP/Desktop/copier/app/pricing/page.tsx',
    replacements: [
      { from: 'CopierBot', to: 'TruFunder' },
      { from: 'COPIERBOT', to: 'TRUFUNDER' }
    ]
  },
  {
    path: 'c:/Users/HP/Desktop/copier/app/contact/page.tsx',
    replacements: [
      { from: 'CopierBot', to: 'TruFunder' },
      { from: 'COPIERBOT', to: 'TRUFUNDER' },
      { from: 'support@copierbot.io', to: 'support@trufunder.com' }
    ]
  },
  {
    path: 'c:/Users/HP/Desktop/copier/app/admin/page.tsx',
    replacements: [
      { from: 'CopierBot', to: 'TruFunder' },
      { from: 'COPIERBOT', to: 'TRUFUNDER' },
      { from: 'copierbot.io', to: 'trufunder.com' }
    ]
  },
  {
    path: 'c:/Users/HP/Desktop/copier/app/(auth)/signin/page.tsx',
    replacements: [
      { from: 'Copier<span className="text-primary">Bot</span>', to: 'Tru<span className="text-primary">Funder</span>' },
      { from: '3IN1 TRADER', to: 'TRUFUNDER' }
    ]
  },
  {
    path: 'c:/Users/HP/Desktop/copier/app/(auth)/signup/page.tsx',
    replacements: [
      { from: '3IN1 TRADER', to: 'TRUFUNDER' },
      { from: 'Copier<span className="text-primary">Bot</span>', to: 'Tru<span className="text-primary">Funder</span>' }
    ]
  }
];

console.log("Initializing global rebranding to TruFunder...");

rebrandJobs.forEach(job => {
  if (!fs.existsSync(job.path)) {
    console.log(`- File not found (skipping): ${job.path}`);
    return;
  }
  
  let content = fs.readFileSync(job.path, 'utf8');
  const original = content;
  let changes = 0;
  
  job.replacements.forEach(rep => {
    if (content.includes(rep.from)) {
      content = content.split(rep.from).join(rep.to);
      changes++;
    }
  });
  
  if (content !== original) {
    fs.writeFileSync(job.path, content, 'utf8');
    console.log(`- Rebranded ${job.path}: executed ${changes} string replacements.`);
  } else {
    console.log(`- No branding modifications needed for: ${job.path}`);
  }
});

console.log("Global rebranding to TruFunder complete!");
