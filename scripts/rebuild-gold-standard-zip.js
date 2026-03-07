const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const root = process.cwd();
const themeDir = path.join(root, 'themes', 'gold-standard-restaurant');
const zipPath = path.join(root, 'themes', 'gold-standard-restaurant.zip');

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

const zip = new AdmZip();
zip.addLocalFolder(themeDir, 'gold-standard-restaurant');
zip.writeZip(zipPath);

console.log(`ZIP created: ${zipPath}`);
