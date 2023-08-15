const express = require('express');
const { resolve } = require('node:path');

const app = express();
const port = 3001;
const dir = resolve(process.cwd(), process.argv[2]);

if (!dir) {
  console.error(
    'Please specify a directory from which to serve static assets.\nUsage: node ./scripts/serve-static.js docs',
  );
  process.exit(1);
}

app.use(express.static(dir));

app.listen(port, () => {
  console.log(`Serving assets from "${dir}" directory at http://localhost:${port}`);
});
