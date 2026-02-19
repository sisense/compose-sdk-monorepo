// Reference: https://dev.to/mbarzeev/yarn-workspace-scripts-refactor-a-case-study-2f25

const yargs = require('yargs/yargs');
const { glob } = require('glob');
const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m%s\x1b[0m';

async function collectFiles({ pattern, target }) {
  if (!pattern || !target) throw new Error('Missing either pattern or target params');
  console.log(GREEN, `Collecting files... into ${target}`);

  const files = await glob(pattern, {});
  files.forEach((file, index) => {
    fs.copyFileSync(file, path.resolve(target, `${index}-${path.basename(file)}`));
  });

  console.log(GREEN, `Done.`);
}

const args = yargs(process.argv.slice(2)).argv;

collectFiles(args);
