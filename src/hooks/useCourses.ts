
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
        // Use the generic type argument explicitly to avoid excessive type instantiation
        let query = supabase.from('courses');
        
        // Apply filters if provided
        if (filters) {
          if (filters.search) {
            query = query.ilike('title', `%${filters.search}%`);
          }
          
          if (filters.category && filters.category !== 'all') {
            query = query.eq('category', filters.category);
          }
          
          if (filters.difficulty && filters.difficulty !== 'all') {
            query = query.eq('difficulty', filters.difficulty);
          }
          
          if (filters.instructor && filters.instructor !== 'all') {
            query = query.eq('instructor', filters.instructor);
          }
        }
        
        const { data, error: coursesError } = await query.select().order('created_at', { ascending: false });
        
        if (coursesError) {
          throw coursesError;
        }

        // Get lessons for each course
        const coursesWithLessons = await Promise.all(
          (data as Course[]).map(async (course) => {
            const { data: lessonsData, error: lessonsError } = await supabase
              .from('lessons')
              .select('*')
              .eq('course_id', course.id)
              .order('lesson_title', { ascending: true });
            
            if (lessonsError) {
              console.error('Error fetching lessons:', lessonsError);
              return { ...course, lessons: [] };
            }
            
            return { ...course, lessons: lessonsData };
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
        const { data, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();
        
        if (courseError) {
          throw courseError;
        }

        // Get lessons for the course
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', id)
          .order('lesson_title', { ascending: true });
          
        if (lessonsError) {
          console.error('Error fetching lessons:', lessonsError);
          setCourse({ ...data, lessons: [] });
        } else {
          setCourse({ ...data, lessons: lessonsData });
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
