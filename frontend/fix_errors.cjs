const fs = require('fs');
let reg = fs.readFileSync('src/pages/Register.jsx', 'utf8');
reg = reg.split("{t('register.and')}").join("and");
reg = reg.replace('Terms & Conditions" and "Privacy Policy', 'Terms & Conditions" {t(\'register.and\')} "Privacy Policy');
fs.writeFileSync('src/pages/Register.jsx', reg);

let ad = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
ad = ad.replace("{t('admin.menuSettings')}, Search, Filter, MoreVertical", "Settings, Search, Filter, MoreVertical");
fs.writeFileSync('src/pages/AdminDashboard.jsx', ad);
