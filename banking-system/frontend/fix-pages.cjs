const fs = require('fs');
const path = require('path');
const files = [
  'src/pages/AuthPages.jsx',
  'src/pages/MainPages.jsx',
  'src/pages/FeaturePages.jsx',
  'src/pages/UserPages.jsx',
  'src/pages/AiPages.jsx',
  'src/pages/admin/AdminPages.jsx',
];

for (const file of files) {
  const full = path.join(process.cwd(), file);
  let text = fs.readFileSync(full, 'utf8');

  const imports = [...new Set((text.match(/^\s*import .*?;\n?/gm) || []))];
  text = text.replace(/^\s*import .*?;\n?/gm, '');

  const insertAt = text.indexOf('\n\n');
  const importBlock = imports.join('\n') + '\n\n';
  text = text.slice(0, insertAt + 2) + importBlock + text.slice(insertAt + 2);

  text = text.replace('export default function DashboardPage()', 'export function DashboardPage()');
  text = text.replace('export default function SpendingInsightsPage()', 'export function SpendingInsightsPage()');
  text = text.replace('export default function AdminDashboard()', 'export function AdminDashboard()');
  text = text.replace(/^export default [A-Za-z0-9_]+;\n/gm, '');

  fs.writeFileSync(full, text, 'utf8');
}

console.log('done');
