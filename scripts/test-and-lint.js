const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Automated testing and code quality script for LearnHub
 * - Runs linting with auto-fixing option
 * - Executes tests with coverage reports
 * - Performs type checking
 * - Reports code quality metrics
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

// Process arguments
const args = process.argv.slice(2);
const shouldFix = args.includes('--fix');
const watchMode = args.includes('--watch');
const skipTests = args.includes('--no-tests');
const skipLint = args.includes('--no-lint');
const verbose = args.includes('--verbose');

// Main function
async function runTestsAndLint() {
  console.log(`${colors.green}=== LearnHub Testing & Linting Script ===${colors.reset}`);
  console.log(`${colors.blue}Starting at ${new Date().toLocaleString()}${colors.reset}`);
  
  // Check if package.json exists
  const packageJsonPath = path.resolve(__dirname, '../package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error(`${colors.red}package.json not found. Make sure you're in the project root.${colors.reset}`);
    process.exit(1);
  }
  
  const packageJson = require(packageJsonPath);
  
  // 1. TypeScript type checking
  console.log(`\n${colors.yellow}Running TypeScript type check...${colors.reset}`);
  const hasTsc = packageJson.devDependencies?.typescript || packageJson.dependencies?.typescript;
  
  if (hasTsc) {
    runCommand('npx tsc --noEmit', 'TypeScript type check failed', true);
  } else {
    console.log(`${colors.yellow}TypeScript not found in dependencies, skipping type check.${colors.reset}`);
  }
  
  // 2. Linting
  if (!skipLint) {
    console.log(`\n${colors.yellow}Running ESLint...${colors.reset}`);
    const hasEslint = packageJson.devDependencies?.eslint || packageJson.dependencies?.eslint;
    
    if (hasEslint) {
      const fixFlag = shouldFix ? ' --fix' : '';
      runCommand(`npx eslint . --ext .js,.jsx,.ts,.tsx${fixFlag}`, 'ESLint check failed', true);
    } else {
      console.log(`${colors.yellow}ESLint not found in dependencies, skipping linting.${colors.reset}`);
    }
  } else {
    console.log(`${colors.yellow}Skipping linting as requested with --no-lint${colors.reset}`);
  }
  
  // 3. Testing
  if (!skipTests) {
    console.log(`\n${colors.yellow}Running tests...${colors.reset}`);
    const hasTestScript = packageJson.scripts?.test;
    
    if (hasTestScript) {
      const testCommand = watchMode ? 
        (packageJson.scripts['test:watch'] ? 'npm run test:watch' : 'npm test -- --watch') :
        'npm test';
      
      runCommand(testCommand, 'Tests failed', true);
    } else {
      console.log(`${colors.yellow}No test script found in package.json, skipping tests.${colors.reset}`);
    }
  } else {
    console.log(`${colors.yellow}Skipping tests as requested with --no-tests${colors.reset}`);
  }
  
  // 4. Project stats (optional, only in verbose mode)
  if (verbose) {
    console.log(`\n${colors.yellow}Collecting project statistics...${colors.reset}`);
    
    // Count files by type
    console.log(`${colors.blue}File counts by type:${colors.reset}`);
    try {
      const sourceDir = path.resolve(__dirname, '../src');
      if (fs.existsSync(sourceDir)) {
        const jsFiles = execSync(`find "${sourceDir}" -type f -name "*.js" | wc -l`, { encoding: 'utf8' }).trim();
        const tsFiles = execSync(`find "${sourceDir}" -type f -name "*.ts" | wc -l`, { encoding: 'utf8' }).trim();
        const jsxFiles = execSync(`find "${sourceDir}" -type f -name "*.jsx" | wc -l`, { encoding: 'utf8' }).trim();
        const tsxFiles = execSync(`find "${sourceDir}" -type f -name "*.tsx" | wc -l`, { encoding: 'utf8' }).trim();
        const cssFiles = execSync(`find "${sourceDir}" -type f -name "*.css" | wc -l`, { encoding: 'utf8' }).trim();
        const scssFiles = execSync(`find "${sourceDir}" -type f -name "*.scss" | wc -l`, { encoding: 'utf8' }).trim();
        
        console.log(`${colors.cyan}JavaScript (.js): ${jsFiles}${colors.reset}`);
        console.log(`${colors.cyan}TypeScript (.ts): ${tsFiles}${colors.reset}`);
        console.log(`${colors.cyan}JSX (.jsx): ${jsxFiles}${colors.reset}`);
        console.log(`${colors.cyan}TSX (.tsx): ${tsxFiles}${colors.reset}`);
        console.log(`${colors.cyan}CSS (.css): ${cssFiles}${colors.reset}`);
        console.log(`${colors.cyan}SCSS (.scss): ${scssFiles}${colors.reset}`);
      }
    } catch (error) {
      console.log(`${colors.yellow}Could not gather file statistics.${colors.reset}`);
    }
  }
  
  console.log(`\n${colors.green}Testing and linting process completed at ${new Date().toLocaleString()}${colors.reset}`);
}

// Run the script
runTestsAndLint().catch(err => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, err);
  process.exit(1);
});
