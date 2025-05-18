import { supabase } from './supabase';

// Helper functions to verify database connection and table access

export async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase.from('courses').select('count()', { count: 'exact' });
    
    if (error) {
      console.error('Database connection error:', error.message);
      return {
        connected: false,
        error: error.message,
        details: error
      };
    }
    
    return {
      connected: true,
      data
    };
  } catch (e) {
    console.error('Unexpected database error:', e);
    return {
      connected: false,
      error: e instanceof Error ? e.message : 'Unknown error'
    };
  }
}

export async function verifyTables() {
  const tables = ['courses', 'users', 'enrollments', 'lessons', 'completed_lessons'];
  const results: Record<string, { exists: boolean, error?: string }> = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('count()', { count: 'exact' }).limit(1);
      
      if (error) {
        results[table] = { 
          exists: false, 
          error: error.message 
        };
      } else {
        results[table] = { exists: true };
      }
    } catch (e) {
      results[table] = { 
        exists: false, 
        error: e instanceof Error ? e.message : 'Unknown error' 
      };
    }
  }
  
  return results;
}

export async function listAllTables() {
  try {
    // This is a special query that Supabase exposes to list tables
    const { data, error } = await supabase.rpc('list_tables');
    
    if (error) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: true,
      tables: data
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Unknown error'
    };
  }
}

// Function to create missing tables if needed
export async function setupMissingTables() {
  const tables = await verifyTables();
  const missingTables = Object.entries(tables)
    .filter(([_, status]) => !status.exists)
    .map(([table]) => table);
    
  if (missingTables.length === 0) {
    return { success: true, message: 'All tables exist' };
  }
  
  const results: Record<string, { success: boolean, error?: string }> = {};
  
  // Create missing tables with basic schema
  for (const table of missingTables) {
    try {
      let query;
      
      switch (table) {
        case 'users':
          // Create users table
          query = `
            CREATE TABLE IF NOT EXISTS users (
              id UUID PRIMARY KEY REFERENCES auth.users(id),
              email TEXT NOT NULL,
              name TEXT,
              avatar TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `;
          break;
          
        case 'courses':
          // Create courses table
          query = `
            CREATE TABLE IF NOT EXISTS courses (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              title TEXT NOT NULL,
              description TEXT,
              thumbnail TEXT,
              category TEXT,
              level TEXT,
              rating NUMERIC DEFAULT 0,
              instructor_name TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `;
          break;
          
        case 'lessons':
          // Create lessons table
          query = `
            CREATE TABLE IF NOT EXISTS lessons (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              course_id UUID REFERENCES courses(id),
              title TEXT NOT NULL,
              description TEXT,
              video_url TEXT,
              duration INTEGER,
              order_index INTEGER,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `;
          break;
          
        case 'enrollments':
          // Create enrollments table
          query = `
            CREATE TABLE IF NOT EXISTS enrollments (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID REFERENCES users(id),
              course_id UUID REFERENCES courses(id),
              progress INTEGER DEFAULT 0,
              status TEXT DEFAULT 'enrolled',
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `;
          break;
          
        case 'completed_lessons':
          // Create completed_lessons table
          query = `
            CREATE TABLE IF NOT EXISTS completed_lessons (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID REFERENCES users(id),
              lesson_id UUID REFERENCES lessons(id),
              completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `;
          break;
          
        default:
          results[table] = { success: false, error: 'Unknown table' };
          continue;
      }
      
      // Run the CREATE TABLE query
      const { error } = await supabase.rpc('execute_sql', { query });
      
      if (error) {
        results[table] = { success: false, error: error.message };
      } else {
        results[table] = { success: true };
      }
    } catch (e) {
      results[table] = { 
        success: false, 
        error: e instanceof Error ? e.message : 'Unknown error' 
      };
    }
  }
  
  return {
    success: Object.values(results).every(r => r.success),
    results
  };
}
