#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Prepare package.json for publishing by removing dependencies
 * since sdk-ui-preact is bundled as a self-contained package
 */
function preparePackageForPublish() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found!');
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  console.log('📦 Preparing sdk-ui-preact for self-contained publishing...');

  // Remove dependencies since the package is self-contained
  if (packageJson.dependencies) {
    delete packageJson.dependencies;
    console.log('✅ Removed dependencies (package is self-contained)');
  }

  // Write the modified package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

  console.log('✅ package.json prepared for self-contained publishing');
  console.log('📤 Ready to publish with zero runtime dependencies');
}

// Temporarily disables the script
// preparePackageForPublish();