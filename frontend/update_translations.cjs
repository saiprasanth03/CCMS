const fs = require('fs');

function updateTranslation(file, eng, tel) {
  let content = fs.readFileSync(file, 'utf8');
  // insert at the end of the admin section
  content = content.replace("locationNotProvided: 'Location not provided',", "locationNotProvided: 'Location not provided',\n    deleteFailed: '" + eng + "',\n    confirmDelete: '" + tel + "',");
  fs.writeFileSync(file, content);
}

updateTranslation('src/i18n/en.js', 'Failed to delete complaint', 'Are you sure you want to delete this complaint?');
updateTranslation('src/i18n/te.js', 'ఫిర్యాదును తొలగించడం విఫలమైంది', 'మీరు ఈ ఫిర్యాదును ఖచ్చితంగా తొలగించాలనుకుంటున్నారా?');
