const fs = require('fs');
let ad = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
ad = ad.replace("{item.is{t('admin.anonymous')} &&", "{item.isAnonymous &&");
fs.writeFileSync('src/pages/AdminDashboard.jsx', ad);
