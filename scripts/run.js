#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * LearnHub Script Runner
 * A utility script to run all automation scripts with a consistent interface
 */

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Available scripts
const scripts = {
  'build': {
    file: 'build-deploy.js',
    description: 'Build and prepare the project for deployment',
    options: [
      { flag: '--prod', description: 'Build for production' },
      { flag: '--force', description: 'Continue despite test failures' }
    ]
  },
  'db': {
    file: 'db-setup.js',
    description: 'Set up and configure the database',
    options: []
  },
  'test': {
    file: 'test-and-lint.js',
    description: 'Run tests and linting',
    options: [
      { flag: '--fix', description: 'Auto-fix linting issues where possible' },
      { flag: '--watch', description: 'Run tests in watch mode' },
      { flag: '--no-tests', description: 'Skip tests' },
      { flag: '--no-lint', description: 'Skip linting' },
      { flag: '--verbose', description: 'Show detailed output' }
    ]
  },
  'setup': {
    file: 'setup-dev.js',
    description: 'Set up the development environment',
    options: []
  }
};

// Print help information
function printHelp() {
  console.log(`${colors.green}=== LearnHub Script Runner ===${colors.reset}`);
  console.log(`\n${colors.cyan}Usage:${colors.reset} node scripts/run.js [script] [options]`);
  console.log(`\n${colors.cyan}Available scripts:${colors.reset}`);
  
  Object.keys(scripts).forEach(scriptName => {
    const script = scripts[scriptName];
    console.log(`  ${colors.yellow}${scriptName}${colors.reset}: ${script.description}`);
    
    if (script.options.length > 0) {
      script.options.forEach(option => {
        console.log(`    ${colors.blue}${option.flag}${colors.reset}: ${option.description}`);
      });
    }
  });
  
  console.log(`\n${colors.cyan}Examples:${colors.reset}`);
  console.log(`  ${colors.blue}node scripts/run.js setup${colors.reset} - Set up the development environment`);
  console.log(`  ${colors.blue}node scripts/run.js build --prod${colors.reset} - Build for production`);
  console.log(`  ${colors.blue}node scripts/run.js test --fix --no-tests${colors.reset} - Run linting with auto-fix and skip tests`);
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const scriptName = args[0];
  
  // If no script specified or help requested, print help and exit
  if (!scriptName || scriptName === 'help' || scriptName === '--help') {
    printHelp();
    return;
  }
  
  // Check if the requested script exists
  if (!scripts[scriptName]) {
    console.error(`${colors.red}Error: Unknown script '${scriptName}'${colors.reset}`);
    console.log(`${colors.yellow}Run 'node scripts/run.js help' to see available scripts.${colors.reset}`);
    process.exit(1);
  }
  
  const script = scripts[scriptName];
  const scriptPath = path.resolve(__dirname, script.file);
  
  // Check if the script file exists
  if (!fs.existsSync(scriptPath)) {
    console.error(`${colors.red}Error: Script file not found: ${scriptPath}${colors.reset}`);
    process.exit(1);
  }
  
  // Get all arguments except the script name
  const scriptArgs = args.slice(1).join(' ');
  
  try {
    console.log(`${colors.green}Running ${scriptName} script...${colors.reset}`);
    execSync(`node "${scriptPath}" ${scriptArgs}`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`${colors.red}Script execution failed with exit code: ${error.status}${colors.reset}`);
    process.exit(error.status);
  }
}

main();
