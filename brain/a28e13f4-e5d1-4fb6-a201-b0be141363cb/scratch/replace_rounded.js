const fs = require('fs');
const filePath = 'c:/Users/HP/Desktop/copier/app/admin/page.tsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/rounded-sm/g);
  const count = match ? match.length : 0;
  
  if (count > 0) {
    content = content.replace(/rounded-sm/g, 'rounded-md');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`SUCCESS: Replaced ${count} instances of rounded-sm with rounded-md.`);
  } else {
    console.log("INFO: No instances of rounded-sm found in app/admin/page.tsx.");
  }
} catch (err) {
  console.error("ERROR running utility script:", err);
}
