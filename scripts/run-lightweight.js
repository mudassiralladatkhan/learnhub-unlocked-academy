/**
 * LearnHub Lightweight Mode Runner
 * 
 * This script runs the LearnHub application in lightweight mode
 * which optimizes performance for lower-end devices.
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.green}=== LearnHub Lightweight Mode ====${colors.reset}`);
console.log(`${colors.yellow}Starting application with performance optimizations...${colors.reset}`);

// Get current file path and determine project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

try {
  // Clean cache to ensure a fresh start
  console.log(`${colors.blue}Cleaning cache...${colors.reset}`);
  execSync('npm cache clean --force', { stdio: 'ignore', cwd: projectRoot });
  
  // Ensure dependencies are installed
  if (!fs.existsSync(path.join(projectRoot, 'node_modules'))) {
    console.log(`${colors.blue}Installing dependencies...${colors.reset}`);
    execSync('npm install', { stdio: 'inherit', cwd: projectRoot });
  }
  
  // Run the application in lightweight mode
  console.log(`${colors.green}Starting application in lightweight mode...${colors.reset}`);
  console.log(`${colors.cyan}💡 Performance optimizations enabled 💡${colors.reset}`);
  
  execSync('npm run dev:light', {
    stdio: 'inherit',
    cwd: projectRoot,
    env: {
      ...process.env,
      VITE_LIGHTWEIGHT_MODE: 'true'
    }
  });
} catch (error) {
  console.error(`${colors.red}Error running lightweight mode:${colors.reset}`, error.message);
  process.exit(1);
}
