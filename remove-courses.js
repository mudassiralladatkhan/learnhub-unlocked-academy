// Script to remove 5 courses from the database
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = 'https://szuaqgltwxmzaznzgguu.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6dWFxZ2x0d3htemF6bnpnZ3V1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTUzMjAyMDgsImV4cCI6MjAxMDg5NjIwOH0.8qBtt_g_5aFB6a7sC7YC_3_3J5NWkFdKmKpJ2iVdOQo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, category, difficulty')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
  
  return data;
}

async function removeCourses() {
  try {
    // First, get all courses to see what we're working with
    const courses = await getCourses();
    console.log(`Found ${courses.length} total courses`);
    
    if (courses.length <= 10) {
      console.log('There are already 10 or fewer courses. No need to remove any.');
      return;
    }
    
    // Determine how many courses to remove
    const coursesToRemove = courses.length - 10;
    console.log(`Will remove ${coursesToRemove} courses`);
    
    // Select the last N courses (oldest ones) to remove
    const courseIdsToRemove = courses.slice(-coursesToRemove).map(course => {
      console.log(`Marking for removal: ${course.title} (${course.id}) - ${course.category}, ${course.difficulty}`);
      return course.id;
    });
    
    // Remove the selected courses
    const { error } = await supabase
      .from('courses')
      .delete()
      .in('id', courseIdsToRemove);
    
    if (error) {
      console.error('Error removing courses:', error);
      return;
    }
    
    console.log(`Successfully removed ${coursesToRemove} courses. Now there are 10 courses remaining.`);
    
    // Verify the new count
    const remainingCourses = await getCourses();
    console.log(`Verification: Now there are ${remainingCourses.length} courses in the database`);
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the function
removeCourses();
