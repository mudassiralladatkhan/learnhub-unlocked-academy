
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export type Course = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  duration: number;
  thumbnail: string | null;
  created_at: string;
  rating?: number;
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
        let query = supabase.from('courses').select('*');
        
        // Apply filters if provided
        if (filters) {
          if (filters.search) {
            query = query.ilike('title', `%${filters.search}%`);
          }
          
          if (filters.category) {
            query = query.eq('category', filters.category);
          }
          
          if (filters.difficulty) {
            query = query.eq('difficulty', filters.difficulty);
          }
          
          if (filters.instructor) {
            query = query.eq('instructor', filters.instructor);
          }
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Get ratings for courses
        const coursesWithRatings = await Promise.all(
          (data as Course[]).map(async (course) => {
            const { data: reviewsData, error: reviewsError } = await supabase
              .from('reviews')
              .select('rating')
              .eq('course_id', course.id);
            
            if (reviewsError) {
              console.error('Error fetching reviews:', reviewsError);
              return { ...course, rating: 0 };
            }
            
            const ratings = reviewsData.map(r => r.rating);
            const averageRating = ratings.length > 0
              ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
              : 0;
            
            return { ...course, rating: averageRating };
          })
        );
        
        setCourses(coursesWithRatings);
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
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        // Get average rating
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('rating')
          .eq('course_id', id);
        
        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
        } else {
          const ratings = reviewsData.map(r => r.rating);
          const averageRating = ratings.length > 0
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
            : 0;
          
          setCourse({ ...data, rating: averageRating });
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
