const fs = require('fs');
let ad = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
ad = ad.replace("<span>{t('admin.menu{t(\\'admin.menuSettings\\')}')}</span>", "<span>{t('admin.menuSettings')}</span>");
ad = ad.replace(/<span>\{t\('admin\.menu\{t\('admin\.menuSettings'\)\}'\)\}<\/span>/g, "<span>{t('admin.menuSettings')}</span>");
ad = ad.replace("<span>{t('admin.menu{t('admin.menuSettings')}')}</span>", "<span>{t('admin.menuSettings')}</span>");
fs.writeFileSync('src/pages/AdminDashboard.jsx', ad);
