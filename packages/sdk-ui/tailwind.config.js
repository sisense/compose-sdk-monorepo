// Based on solution from https://github.com/tailwindlabs/tailwindcss/discussions/6839#discussioncomment-3678703
const { register } = require('@swc-node/register/register');
const { readDefaultTsConfig } = require('@swc-node/register/read-default-tsconfig');
const path = require('path');
register(readDefaultTsConfig(path.join(__dirname, 'tsconfig.json')));

module.exports = require('./tailwind.config.ts').default;
