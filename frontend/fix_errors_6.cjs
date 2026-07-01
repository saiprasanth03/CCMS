const fs = require('fs');
let ad = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
ad = ad.replace(/<\{t\('admin\.menuSettings'\)\} /g, "<Settings ");
ad = ad.replace(/\{t\('admin\.system\{t\('admin\.menuSettings'\)\}'\)\}/g, "{t('admin.systemSettings')}");
fs.writeFileSync('src/pages/AdminDashboard.jsx', ad);
