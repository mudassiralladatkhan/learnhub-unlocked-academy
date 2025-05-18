const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Database setup and migration script for LearnHub using Supabase
 * - Validates Supabase configuration
 * - Applies SQL schema
 * - Handles database migrations
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

// Check if Supabase CLI is installed
function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Main function
async function setupDatabase() {
  console.log(`${colors.green}=== LearnHub Database Setup Script ===${colors.reset}`);
  
  // Check if Supabase CLI is installed
  if (!checkSupabaseCLI()) {
    console.log(`${colors.yellow}Supabase CLI not found. You need to install it first:${colors.reset}`);
    console.log(`${colors.cyan}npm install -g supabase${colors.reset}`);
    const installNow = await question(`${colors.yellow}Would you like to install Supabase CLI now? (y/n) ${colors.reset}`);
    
    if (installNow.toLowerCase() === 'y') {
      if (!runCommand('npm install -g supabase', 'Failed to install Supabase CLI')) {
        console.log(`${colors.red}Please install Supabase CLI manually and try again.${colors.reset}`);
        rl.close();
        return;
      }
    } else {
      console.log(`${colors.yellow}Please install Supabase CLI and run this script again.${colors.reset}`);
      rl.close();
      return;
    }
  }
  
  // Check for environment
  const schemaFile = path.resolve(__dirname, '../supabase-schema.sql');
  if (!fs.existsSync(schemaFile)) {
    console.log(`${colors.red}Schema file not found: ${schemaFile}${colors.reset}`);
    console.log(`${colors.yellow}Please make sure the schema file exists and try again.${colors.reset}`);
    rl.close();
    return;
  }
  
  // Ask for Supabase project settings if not already configured
  const supabaseConfigDir = path.resolve(__dirname, '../supabase');
  const isSupabaseInitialized = fs.existsSync(path.join(supabaseConfigDir, 'config.toml'));
  
  if (!isSupabaseInitialized) {
    console.log(`${colors.yellow}Supabase project needs to be initialized.${colors.reset}`);
    const shouldInit = await question(`${colors.yellow}Initialize Supabase project now? (y/n) ${colors.reset}`);
    
    if (shouldInit.toLowerCase() === 'y') {
      if (!runCommand('supabase init', 'Failed to initialize Supabase project')) {
        rl.close();
        return;
      }
    } else {
      console.log(`${colors.yellow}Please initialize Supabase project manually and try again.${colors.reset}`);
      rl.close();
      return;
    }
  }
  
  // Start Supabase local development
  console.log(`${colors.green}Starting Supabase local development...${colors.reset}`);
  if (!runCommand('supabase start', 'Failed to start Supabase local development')) {
    rl.close();
    return;
  }
  
  // Apply schema file
  console.log(`${colors.green}Applying database schema...${colors.reset}`);
  console.log(`${colors.blue}Using schema file: ${schemaFile}${colors.reset}`);
  
  const applySchema = await question(`${colors.yellow}Apply schema to database? This may reset existing data. (y/n) ${colors.reset}`);
  if (applySchema.toLowerCase() === 'y') {
    // For a local supabase instance you would typically use psql
    // Note: This is a simplification and would need to be adapted to your specific setup
    const schemaCommand = `supabase db reset`;
    if (!runCommand(schemaCommand, 'Failed to apply database schema')) {
      rl.close();
      return;
    }
    console.log(`${colors.green}Schema applied successfully!${colors.reset}`);
  }
  
  // Generate types from database (optional)
  console.log(`${colors.green}Generating TypeScript types from database...${colors.reset}`);
  const genTypes = await question(`${colors.yellow}Generate TypeScript types from your database? (y/n) ${colors.reset}`);
  if (genTypes.toLowerCase() === 'y') {
    if (!runCommand('supabase gen types typescript --local > src/types/supabase.ts', 'Failed to generate types')) {
      console.log(`${colors.yellow}Could not generate types automatically. You may need to do this manually.${colors.reset}`);
    } else {
      console.log(`${colors.green}Types generated successfully to src/types/supabase.ts${colors.reset}`);
    }
  }
  
  console.log(`${colors.green}Database setup completed successfully!${colors.reset}`);
  console.log(`${colors.cyan}Your local Supabase is running and ready for development.${colors.reset}`);
  rl.close();
}

setupDatabase().catch(err => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, err);
  rl.close();
  process.exit(1);
});
