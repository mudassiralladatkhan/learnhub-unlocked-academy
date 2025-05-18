const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Development environment setup script for LearnHub
 * - Installs dependencies
 * - Configures environment variables
 * - Sets up local development environment
 */

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to ask questions
function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

// Helper to run commands and log output
function runCommand(command, errorMessage, ignoreError = false) {
  try {
    console.log(`${colors.blue}Running: ${command}${colors.reset}`);
    execSync(command, { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });
    return true;
  } catch (error) {
    console.error(`${colors.red}${errorMessage || 'Command failed'}${colors.reset}`);
    console.error(error.message);
    if (ignoreError) return true;
    return false;
  }
}

// Check if a command exists
function commandExists(command) {
  try {
    execSync(`where ${command}`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Main function
async function setupDevEnvironment() {
  console.log(`${colors.green}=== LearnHub Development Environment Setup ===${colors.reset}`);
  
  // Check for Node.js
  console.log(`\n${colors.yellow}Checking for Node.js...${colors.reset}`);
  if (!commandExists('node')) {
    console.error(`${colors.red}Node.js not found! Please install Node.js before continuing.${colors.reset}`);
    console.log(`${colors.cyan}Visit https://nodejs.org/ to download and install.${colors.reset}`);
    rl.close();
    return;
  }
  
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`${colors.green}Node.js ${nodeVersion} detected.${colors.reset}`);
  
  // Check for npm
  console.log(`\n${colors.yellow}Checking for npm...${colors.reset}`);
  if (!commandExists('npm')) {
    console.error(`${colors.red}npm not found! Please install npm before continuing.${colors.reset}`);
    rl.close();
    return;
  }
  
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`${colors.green}npm ${npmVersion} detected.${colors.reset}`);
  
  // Install dependencies
  console.log(`\n${colors.yellow}Installing project dependencies...${colors.reset}`);
  const installDeps = await question(`${colors.cyan}Install dependencies now? (y/n) ${colors.reset}`);
  
  if (installDeps.toLowerCase() === 'y') {
    if (!runCommand('npm install', 'Failed to install dependencies')) {
      const retry = await question(`${colors.red}Installation failed. Retry? (y/n) ${colors.reset}`);
      if (retry.toLowerCase() === 'y') {
        console.log(`${colors.yellow}Trying with clean npm cache...${colors.reset}`);
        runCommand('npm cache clean --force', 'Failed to clean npm cache', true);
        if (!runCommand('npm install', 'Failed to install dependencies again')) {
          console.log(`${colors.red}Could not install dependencies. Please try manually with 'npm install'.${colors.reset}`);
        }
      }
    } else {
      console.log(`${colors.green}Dependencies installed successfully!${colors.reset}`);
    }
  }
  
  // Check for .env file
  const envPath = path.resolve(__dirname, '../.env');
  const envExamplePath = path.resolve(__dirname, '../.env.example');
  
  console.log(`\n${colors.yellow}Checking environment configuration...${colors.reset}`);
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      console.log(`${colors.yellow}No .env file found, but .env.example exists.${colors.reset}`);
      const copyEnv = await question(`${colors.cyan}Create .env from .env.example? (y/n) ${colors.reset}`);
      
      if (copyEnv.toLowerCase() === 'y') {
        fs.copyFileSync(envExamplePath, envPath);
        console.log(`${colors.green}.env file created from example!${colors.reset}`);
        console.log(`${colors.yellow}Please edit the .env file with your actual configuration values.${colors.reset}`);
      }
    } else {
      console.log(`${colors.yellow}No .env or .env.example file found.${colors.reset}`);
      const createEnv = await question(`${colors.cyan}Create a basic .env file? (y/n) ${colors.reset}`);
      
      if (createEnv.toLowerCase() === 'y') {
        // Create a basic .env file with default settings for the LearnHub project
        const envContent = `# LearnHub Environment Configuration
# Created by setup script on ${new Date().toISOString()}

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Application Settings
VITE_APP_URL=http://localhost:8080
VITE_API_BASE_URL=http://localhost:8080/api

# Feature Flags
VITE_ENABLE_AUTH=true
VITE_ENABLE_ANALYTICS=false
`;
        fs.writeFileSync(envPath, envContent);
        console.log(`${colors.green}Basic .env file created!${colors.reset}`);
        console.log(`${colors.yellow}Please edit the .env file with your actual configuration values.${colors.reset}`);
      }
    }
  } else {
    console.log(`${colors.green}.env file already exists.${colors.reset}`);
  }
  
  // Setup git hooks if this is a git repository
  const gitDir = path.resolve(__dirname, '../.git');
  if (fs.existsSync(gitDir)) {
    console.log(`\n${colors.yellow}Checking Git hooks...${colors.reset}`);
    
    const setupHooks = await question(`${colors.cyan}Set up Git hooks for pre-commit checks? (y/n) ${colors.reset}`);
    if (setupHooks.toLowerCase() === 'y') {
      // Check if husky is in devDependencies
      const packageJsonPath = path.resolve(__dirname, '../package.json');
      const packageJson = require(packageJsonPath);
      
      if (!packageJson.devDependencies?.husky) {
        console.log(`${colors.yellow}Husky not found in devDependencies. Installing...${colors.reset}`);
        if (!runCommand('npm install --save-dev husky lint-staged', 'Failed to install husky and lint-staged', true)) {
          console.log(`${colors.yellow}Could not install husky. Skipping Git hooks setup.${colors.reset}`);
        } else {
          // Set up husky
          runCommand('npx husky install', 'Failed to initialize husky', true);
          
          // Add pre-commit hook
          const preCommitContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
`;
          const hooksDir = path.resolve(__dirname, '../.husky');
          if (!fs.existsSync(hooksDir)) {
            fs.mkdirSync(hooksDir, { recursive: true });
          }
          fs.writeFileSync(path.join(hooksDir, 'pre-commit'), preCommitContent);
          fs.chmodSync(path.join(hooksDir, 'pre-commit'), 0o755);
          
          // Add lint-staged configuration to package.json if it doesn't exist
          if (!packageJson['lint-staged']) {
            packageJson['lint-staged'] = {
              '*.{js,jsx,ts,tsx}': [
                'eslint --fix',
                'prettier --write'
              ],
              '*.{css,scss,md,json}': [
                'prettier --write'
              ]
            };
            
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
          }
          
          console.log(`${colors.green}Git hooks set up successfully!${colors.reset}`);
        }
      } else {
        console.log(`${colors.green}Husky already installed. Setting up hooks...${colors.reset}`);
        runCommand('npx husky install', 'Failed to initialize husky', true);
        console.log(`${colors.green}Git hooks set up successfully!${colors.reset}`);
      }
    }
  }
  
  console.log(`\n${colors.green}Development environment setup completed!${colors.reset}`);
  console.log(`${colors.cyan}You can now start the development server with 'npm run dev'${colors.reset}`);
  rl.close();
}

setupDevEnvironment().catch(err => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, err);
  rl.close();
  process.exit(1);
});
