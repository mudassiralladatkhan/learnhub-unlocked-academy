const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Automates the build and deployment process for LearnHub
 * - Runs linting
 * - Builds the project
 * - Prepares deployment files
 * - Offers deployment options
 */

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

// Helper to run commands and log output
function runCommand(command, errorMessage) {
  try {
    console.log(`${colors.blue}Running: ${command}${colors.reset}`);
    execSync(command, { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
    return true;
  } catch (error) {
    console.error(`${colors.red}${errorMessage || 'Command failed'}${colors.reset}`);
    console.error(error.message);
    return false;
  }
}

// Create a timestamp for build version
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// Main build and deploy function
async function buildAndDeploy() {
  console.log(`${colors.green}=== LearnHub Build & Deploy Script ===${colors.reset}`);
  console.log(`${colors.blue}Starting build process at ${new Date().toLocaleString()}${colors.reset}`);
  
  // Step 1: Lint code
  console.log(`\n${colors.yellow}Step 1/4: Linting code${colors.reset}`);
  if (!runCommand('npm run lint', 'Linting failed')) {
    console.log(`${colors.yellow}Continuing despite linting issues...${colors.reset}`);
  }
  
  // Step 2: Run tests if they exist
  console.log(`\n${colors.yellow}Step 2/4: Running tests${colors.reset}`);
  if (fs.existsSync(path.resolve(__dirname, '../package.json'))) {
    const packageJson = require('../package.json');
    if (packageJson.scripts && packageJson.scripts.test) {
      if (!runCommand('npm test', 'Tests failed')) {
        const continueAnyway = process.argv.includes('--force');
        if (!continueAnyway) {
          console.log(`${colors.red}Build aborted due to test failures. Use --force to build anyway.${colors.reset}`);
          process.exit(1);
        }
        console.log(`${colors.yellow}Continuing despite test failures...${colors.reset}`);
      }
    } else {
      console.log(`${colors.yellow}No test script found in package.json, skipping tests.${colors.reset}`);
    }
  }
  
  // Step 3: Build the project
  console.log(`\n${colors.yellow}Step 3/4: Building project${colors.reset}`);
  const buildEnv = process.argv.includes('--prod') ? 'production' : 'development';
  const buildCommand = buildEnv === 'production' ? 'npm run build' : 'npm run build:dev';
  
  console.log(`${colors.blue}Building for ${buildEnv} environment${colors.reset}`);
  if (!runCommand(buildCommand, 'Build failed')) {
    console.log(`${colors.red}Build process failed. Aborting deployment.${colors.reset}`);
    process.exit(1);
  }
  
  // Step 4: Prepare for deployment
  console.log(`\n${colors.yellow}Step 4/4: Preparing for deployment${colors.reset}`);
  
  // Create a build info file
  const buildInfo = {
    version: `${timestamp}`,
    buildDate: new Date().toISOString(),
    environment: buildEnv,
    nodeVersion: process.version
  };
  
  fs.writeFileSync(
    path.resolve(__dirname, '../dist/build-info.json'),
    JSON.stringify(buildInfo, null, 2)
  );
  
  console.log(`${colors.green}Build completed successfully!${colors.reset}`);
  console.log(`${colors.green}Deployment files are ready in the 'dist' directory.${colors.reset}`);
  console.log(`\n${colors.blue}To deploy manually:${colors.reset}`);
  console.log(`${colors.yellow}1. Upload contents of 'dist' folder to your hosting provider${colors.reset}`);
  console.log(`${colors.yellow}2. Ensure proper environment variables are set up${colors.reset}`);
  console.log(`${colors.yellow}3. If using Netlify, Vercel, or similar platforms, point to your repository${colors.reset}`);
}

buildAndDeploy().catch(err => {
  console.error(`${colors.red}Unhandled error in build process:${colors.reset}`, err);
  process.exit(1);
});
