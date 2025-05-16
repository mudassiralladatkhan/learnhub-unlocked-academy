
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Start with the basic table reference without any operations
        const baseQuery = supabase.from('courses');
        
        // Perform select operation separately 
        let data;
        let coursesError;
        
        // Build query step by step without chaining
        // First get all courses
        const selectResult = await baseQuery.select();
        
        if (selectResult.error) {
          throw selectResult.error;
        }
        
        // Apply filters to the data in JavaScript instead of in the query
        let filteredData = selectResult.data;
        
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filteredData = filteredData.filter(course => 
            course.title.toLowerCase().includes(searchLower)
          );
        }
        
        if (filters?.category && filters.category !== 'all') {
          filteredData = filteredData.filter(course => 
            course.category === filters.category
          );
        }
        
        // Check if difficulty exists on the course before filtering by it
        if (filters?.difficulty && filters.difficulty !== 'all') {
          filteredData = filteredData.filter(course => 
            course.difficulty !== undefined && course.difficulty === filters.difficulty
          );
        }
        
        // Check if instructor exists on the course before filtering by it
        if (filters?.instructor && filters.instructor !== 'all') {
          filteredData = filteredData.filter(course => 
            course.instructor !== undefined && course.instructor === filters.instructor
          );
        }
        
        // Sort by created_at in descending order
        filteredData.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        // Get lessons for each course
        const coursesWithLessons = await Promise.all(
          filteredData.map(async (course) => {
            const lessonsQuery = supabase.from('lessons');
            const lessonsResult = await lessonsQuery
              .select()
              .eq('course_id', course.id)
              .order('lesson_title', { ascending: true });
            
            if (lessonsResult.error) {
              console.error('Error fetching lessons:', lessonsResult.error);
              return { ...course, lessons: [] };
            }
            
            return { ...course, lessons: lessonsResult.data };
          })
        );
        
        setCourses(coursesWithLessons);
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
      }
    };
    
    fetchCourses();
  }, [filters, toast]);
  
  return { courses, loading, error };
}

export function useCourse(id: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Split the query into separate operations
        const courseQuery = supabase.from('courses');
        
        // Get the specific course by ID
        const courseResult = await courseQuery
          .select()
          .eq('id', id)
          .single();
        
        if (courseResult.error) {
          throw courseResult.error;
        }
        
        // Get lessons for this course
        const lessonsQuery = supabase.from('lessons');
        const lessonsResult = await lessonsQuery
          .select()
          .eq('course_id', id)
          .order('lesson_title', { ascending: true });
        
        if (lessonsResult.error) {
          console.error('Error fetching lessons:', lessonsResult.error);
          setCourse({ ...courseResult.data, lessons: [] });
        } else {
          setCourse({ ...courseResult.data, lessons: lessonsResult.data });
        }
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
    
    if (id) {
      fetchCourse();
    }
  }, [id, toast]);
  
  return { course, loading, error };
}
