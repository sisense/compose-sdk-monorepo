const fs = require('fs');
const path = require('path');

// Check if the environment variables are set
if (!process.env.E2E_SISENSE_URL || !process.env.E2E_SISENSE_TOKEN) {
  console.error('Error: APP_SISENSE_URL and APP_SISENSE_TOKEN environment variables are required.');
  process.exit(1);
}

// Create the content for the environment file
const envContent = `export const environment = {
  APP_SISENSE_URL: '${process.env.E2E_SISENSE_URL}',
  APP_SISENSE_TOKEN: '${process.env.E2E_SISENSE_TOKEN}',
};
`;

// Define the target directory and file name
const targetDir = '../examples/angular-demo/src/environments';
const fileName = 'environment.development.ts';

// Ensure the target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Write the content to the file
fs.writeFileSync(path.join(targetDir, fileName), envContent, 'utf8');

console.log(`Environment file created at ${path.join(targetDir, fileName)}`);