const fs = require('fs');
let ad = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
ad = ad.replace("<{t('admin.menuSettings')} className", "<Settings className");
fs.writeFileSync('src/pages/AdminDashboard.jsx', ad);
