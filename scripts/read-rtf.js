
const fs = require('fs');
const path = "/Users/soluwrx/Downloads/PressPilot-OS/PressPilot-OS/FSE Rules/Create WordPress Posts, Pages, Users and Menus Programmatically.rtfd/TXT.rtf";
try {
    const data = fs.readFileSync(path, 'utf8');
    console.log(data.substring(0, 2000)); // Print first 2000 chars
} catch (err) {
    console.error(err);
}
