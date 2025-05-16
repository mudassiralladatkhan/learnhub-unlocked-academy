
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type Enrollment = {
  id: string;
  user_id: string;
  course_id: string;
  status: 'enrolled' | 'in_progress' | 'completed';
  started_at: string;
  completed_at: string | null;
  course?: {
    title: string;
    thumbnail: string | null;
    description: string;
    instructor: string;
    difficulty: string;
    category: string;
    duration: number;
  };
  progress?: number;
};

export function useEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) {
        setEnrollments([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('enrollments')
          .select(`
            *,
            course:courses(title, thumbnail, description, instructor, difficulty, category, duration)
          `)
          .eq('user_id', user.id)
          .order('started_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Calculate progress for each enrollment
        const enrollmentsWithProgress = await Promise.all(
          data.map(async (enrollment) => {
            // Get total lesson count for the course
            const { count: totalLessons, error: lessonCountError } = await supabase
              .from('lessons')
              .select('id', { count: 'exact', head: true })
              .eq('course_id', enrollment.course_id);
              
            if (lessonCountError) {
              console.error('Error fetching lesson count:', lessonCountError);
              return { ...enrollment, progress: 0 };
            }
            
            // Get completed lessons count
            const { count: completedLessons, error: completedError } = await supabase
              .from('completed_lessons')
              .select('lesson_id', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .in('lesson_id', supabase
                .from('lessons')
                .select('id')
                .eq('course_id', enrollment.course_id)
              );
              
            if (completedError) {
              console.error('Error fetching completed lessons:', completedError);
              return { ...enrollment, progress: 0 };
            }
            
            const progress = totalLessons && totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0;
              
            return { ...enrollment, progress };
          })
        );
        
        setEnrollments(enrollmentsWithProgress);
      } catch (err: any) {
        console.error('Error fetching enrollments:', err);
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load enrollments. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnrollments();
  }, [user, toast]);
  
  const enrollInCourse = async (courseId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to enroll in courses",
        variant: "destructive",
      });
      return { success: false };
    }
    
    try {
      // Check if user is already enrolled
      const { data: existingEnrollment, error: checkError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();
      
      if (existingEnrollment) {
        toast({
          title: "Already enrolled",
          description: "You are already enrolled in this course",
        });
        return { success: true, enrollment: existingEnrollment };
      }
      
      // Create enrollment
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          status: 'enrolled',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Enrollment successful",
        description: "You have successfully enrolled in the course",
      });
      
      return { success: true, enrollment: data };
    } catch (err: any) {
      console.error('Error enrolling in course:', err);
      toast({
        title: "Enrollment failed",
        description: err.message || "Failed to enroll in course",
        variant: "destructive",
      });
      
      return { success: false, error: err.message };
    }
  };
  
  const isEnrolled = async (courseId: string) => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();
      
      if (error) {
        return false;
      }
      
      return Boolean(data);
    } catch (err) {
      return false;
    }
  };
  
  return {
    enrollments,
    loading,
    error,
    enrollInCourse,
    isEnrolled,
  };
}
