const fs = require('fs');
const { version } = require('../package.json');

fs.writeFileSync('./src/version.ts', `export default '${version}'`);
