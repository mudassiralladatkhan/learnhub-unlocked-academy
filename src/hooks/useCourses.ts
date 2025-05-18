
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Storage key for demo courses
const COURSES_STORAGE_KEY = 'learnhub-courses';
const ENROLLMENTS_STORAGE_KEY = 'learnhub-enrollments';

// Check if a string looks like a UUID
const isUuid = (id: string): boolean => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(id);
};

export type Course = {
  id: string;
  title: string;
  description: string;
  instructor?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | string;
  category: string;
  duration?: number;
  thumbnail?: string | null;
  created_at: string;
  rating?: number;
  lessons?: Lesson[];
};

export type Lesson = {
  id: string;
  course_id: string;
  lesson_title: string;
  video_url: string;
  created_at: string;
};

type CourseFilters = {
  search?: string;
  category?: string;
  difficulty?: string;
  instructor?: string;
};

export function useCourses(filters?: CourseFilters) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Use refs to prevent multiple simultaneous data fetches and infinite loops
  const isFetchingRef = useRef(false);
  const filterString = JSON.stringify(filters); // To reliably track filter changes

  useEffect(() => {
    const fetchCourses = async () => {
      // Prevent multiple simultaneous data fetches
      if (isFetchingRef.current) return;
      
      // Set fetching flag to true
      isFetchingRef.current = true;
      
      // Only set loading to true on first load to prevent blinking
      if (!isInitialized) {
        setLoading(true);
      }
      
      setError(null);
      
      try {
        // Get courses from localStorage first for better performance
        let courseData: Course[] = [];
        const storedData = localStorage.getItem(COURSES_STORAGE_KEY);
        
        if (storedData) {
          // If we have data in localStorage, use it immediately
          courseData = JSON.parse(storedData);
        } else {
          // Only if localStorage is empty, populate with demo/database data
          courseData = await initializeCoursesInLocalStorage();
        }
        
        // Trigger background sync if it's been more than an hour
        // This is done outside the main loading flow to prevent freezing
        setTimeout(() => {
          const lastSyncTime = localStorage.getItem('lastCoursesSyncTime');
          const currentTime = Date.now();
          const ONE_HOUR = 60 * 60 * 1000;
          
          if (!lastSyncTime || (currentTime - parseInt(lastSyncTime)) > ONE_HOUR) {
            syncCoursesFromDatabase().catch(err => {
              console.error('Background sync error:', err);
            });
          }
        }, 2000);
        
        // Apply filters to the data in JavaScript
        let filteredData = [...courseData];
        
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filteredData = filteredData.filter(course => 
            course.title.toLowerCase().includes(searchLower) ||
            course.description.toLowerCase().includes(searchLower)
          );
        }
        
        if (filters?.category && filters.category !== 'all') {
          filteredData = filteredData.filter(course => 
            course.category?.toLowerCase() === filters.category.toLowerCase()
          );
        }
        
        // Check if difficulty exists on the course before filtering by it
        if (filters?.difficulty && filters.difficulty !== 'all') {
          filteredData = filteredData.filter(course => {
            if (!course.difficulty) return false;
            
            // Get the specific difficulty value that's being filtered for
            const filterDifficulty = filters.difficulty.toLowerCase().trim();
            const courseDifficulty = course.difficulty.toLowerCase().trim();
            
            // Match exact values but also handle possible partial matches
            return courseDifficulty === filterDifficulty ||
                  courseDifficulty.includes(filterDifficulty) ||
                  filterDifficulty.includes(courseDifficulty);
          });
        }
        
        // Check if instructor exists on the course before filtering by it
        if (filters?.instructor && filters.instructor !== 'all') {
          filteredData = filteredData.filter(course => 
            course.instructor !== undefined && 
            course.instructor.toLowerCase() === filters.instructor.toLowerCase()
          );
        }
        
        // Sort by created_at in descending order
        filteredData.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        // Instead of fetching lessons for each course immediately, we'll defer that
        // This prevents the multiple re-renders that cause blinking
        setCourses(filteredData.map(course => ({
          ...course,
          // Initialize with empty lessons array
          lessons: []
        })));
        
        // Our demo courses already have lessons, so we'll use those
        setCourses(filteredData);
      } catch (err: any) {
        console.error('Error fetching courses:', err);
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load courses. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        setIsInitialized(true);
        isFetchingRef.current = false;
      }
    };
    
    fetchCourses();
    
    // Cleanup function
    return () => {
      isFetchingRef.current = false;
    };
  }, [filterString, toast, isInitialized]); // Only re-run if filters or toast change
  
  return { courses, loading, error };
}

// Function to synchronize database courses with localStorage
const syncCoursesFromDatabase = async (): Promise<Course[]> => {
  try {
    // Attempt to get courses from database
    const { data: coursesData, error: coursesError } = await supabase
      .from('courses')
      .select('*');
    
    if (coursesError) throw coursesError;
    
    // If we got courses, fetch lessons for each course
    if (coursesData && coursesData.length > 0) {
      const coursesWithLessons = await Promise.all(
        coursesData.map(async (course) => {
          try {
            const { data: lessonsData, error: lessonsError } = await supabase
              .from('lessons')
              .select('*')
              .eq('course_id', course.id);
            
            if (lessonsError) throw lessonsError;
            
            return {
              ...course,
              lessons: lessonsData || []
            };
          } catch (err) {
            console.error(`Error fetching lessons for course ${course.id}:`, err);
            return {
              ...course,
              lessons: []
            };
          }
        })
      );
      
      // Save to localStorage
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(coursesWithLessons));
      return coursesWithLessons;
    }
    
    // If no courses found, fall back to demo courses
    return getDemoCourses();
  } catch (err) {
    console.error('Error syncing courses from database:', err);
    return getDemoCourses();
  }
};

// Function to get demo courses data
const getDemoCourses = (): Course[] => {
  return [
    {
      id: 'course-1',
      title: 'Introduction to JavaScript',
      description: 'Learn the fundamentals of JavaScript programming language',
      thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=500&q=80',
      instructor: 'John Doe',
      difficulty: 'beginner',
      category: 'Programming',
      duration: 10,
      created_at: new Date().toISOString(),
      rating: 4.5,
      lessons: [
        {
          id: 'lesson-1-1',
          course_id: 'course-1',
          lesson_title: 'JavaScript Basics',
          video_url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
          created_at: new Date().toISOString()
        },
        {
          id: 'lesson-1-2',
          course_id: 'course-1',
          lesson_title: 'Variables and Data Types',
          video_url: 'https://www.youtube.com/watch?v=edlFjlzxkSI',
          created_at: new Date().toISOString()
        },
        {
          id: 'lesson-1-3',
          course_id: 'course-1',
          lesson_title: 'Functions and Objects',
          video_url: 'https://www.youtube.com/watch?v=xUI5Tsl2JpY',
          created_at: new Date().toISOString()
        }
      ]
    },
    {
      id: 'course-2',
      title: 'React Fundamentals',
      description: 'Build modern user interfaces with React',
      thumbnail: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?auto=format&fit=crop&w=500&q=80',
      instructor: 'Jane Smith',
      difficulty: 'intermediate',
      category: 'Web Development',
      duration: 15,
      created_at: new Date().toISOString(),
      rating: 4.8,
      lessons: [
        {
          id: 'lesson-2-1',
          course_id: 'course-2',
          lesson_title: 'React Components',
          video_url: 'https://www.youtube.com/watch?v=Ke90Tje7VS0',
          created_at: new Date().toISOString()
        },
        {
          id: 'lesson-2-2',
          course_id: 'course-2',
          lesson_title: 'State and Props',
          video_url: 'https://www.youtube.com/watch?v=35lXWvCuM8o',
          created_at: new Date().toISOString()
        }
      ]
    },
    {
      id: 'course-3',
      title: 'Advanced CSS Techniques',
      description: 'Master advanced CSS layouts, animations and more',
      thumbnail: 'https://images.unsplash.com/photo-1517134191118-9d595e4c8c2b?auto=format&fit=crop&w=500&q=80',
      instructor: 'Mike Johnson',
      difficulty: 'intermediate',
      category: 'Web Design',
      duration: 8,
      created_at: new Date().toISOString(),
      rating: 4.2,
      lessons: [
        {
          id: 'lesson-3-1',
          course_id: 'course-3',
          lesson_title: 'CSS Grid',
          video_url: 'https://www.youtube.com/watch?v=jV8B24rSN5o',
          created_at: new Date().toISOString()
        },
        {
          id: 'lesson-3-2',
          course_id: 'course-3',
          lesson_title: 'CSS Animations',
          video_url: 'https://www.youtube.com/watch?v=1PnVor36_40',
          created_at: new Date().toISOString()
        }
      ]
    },
    {
      id: 'course-4',
      title: 'TypeScript for React Developers',
      description: 'Add type safety to your React applications',
      thumbnail: 'https://images.unsplash.com/photo-1610986602538-431d65df4385?auto=format&fit=crop&w=500&q=80',
      instructor: 'Sarah Wilson',
      difficulty: 'advanced',
      category: 'Programming',
      duration: 12,
      created_at: new Date().toISOString(),
      rating: 4.9,
      lessons: [
        {
          id: 'lesson-4-1',
          course_id: 'course-4',
          lesson_title: 'TypeScript Basics',
          video_url: 'https://www.youtube.com/watch?v=NjN00cM18Z4',
          created_at: new Date().toISOString()
        },
        {
          id: 'lesson-4-2',
          course_id: 'course-4',
          lesson_title: 'React with TypeScript',
          video_url: 'https://www.youtube.com/watch?v=Z5iWr6Srsj8',
          created_at: new Date().toISOString()
        }
      ]
    }
  ];
};

// Initialize courses in localStorage if not already there
const initializeCoursesInLocalStorage = async () => {
  try {
    const storedData = localStorage.getItem(COURSES_STORAGE_KEY);
    
    // If we already have data in localStorage, return it immediately
    if (storedData) {
      return JSON.parse(storedData);
    }
    
    // If no stored data, try database first, then fall back to demo
    try {
      const dbCourses = await syncCoursesFromDatabase();
      if (dbCourses.length > 0) {
        localStorage.setItem('lastCoursesSyncTime', Date.now().toString());
        return dbCourses;
      }
    } catch (dbErr) {
      console.error('Error fetching from database:', dbErr);
    }
    
    // Fall back to demo courses
    const demoCourses = getDemoCourses();
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(demoCourses));
    return demoCourses;
  } catch (err) {
    console.error('Error initializing courses in localStorage:', err);
    return getDemoCourses();
  }
};

export function useCourse(id: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Try to get from localStorage first (fast path)
        const storedData = localStorage.getItem(COURSES_STORAGE_KEY);
        if (storedData) {
          const courses = JSON.parse(storedData);
          
          // Find the course by ID
          const foundCourse = courses.find((c: Course) => c.id === id);
          
          if (foundCourse) {
            setCourse(foundCourse);
            setLoading(false);
            return;
          }
        }
        
        // If not found in localStorage, try initializing with demo data
        const demoCourses = getDemoCourses();
        
        // Use ID pattern matching to find a demo course
        let fallbackCourse;
        
        if (id.startsWith('course-')) {
          // Try to extract number from course-X pattern
          const courseNum = parseInt(id.replace('course-', ''));
          if (!isNaN(courseNum) && courseNum > 0 && courseNum <= demoCourses.length) {
            fallbackCourse = demoCourses[courseNum - 1];
          }
        }
        
        // Default to first course if no match
        if (!fallbackCourse) {
          fallbackCourse = demoCourses[0];
        }
        
        // Save to localStorage if needed
        if (storedData) {
          const existingCourses = JSON.parse(storedData);
          if (!existingCourses.some((c: Course) => c.id === fallbackCourse.id)) {
            localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify([...existingCourses, fallbackCourse]));
          }
        } else {
          localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(demoCourses));
        }
        
        setCourse(fallbackCourse);
      } catch (err: any) {
        console.error('Error fetching course:', err);
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load course details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourse();
  }, [id, toast]);
  
  return { course, loading, error };
}
