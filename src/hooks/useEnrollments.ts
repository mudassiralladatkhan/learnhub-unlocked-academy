import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/contexts/SessionContext';

/**
 * NOTE: This file has been replaced by useEnrollmentSimple.ts and useEnrollmentsList.ts
 * This file remains for compatibility but new features should use the new hooks
 */

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
  const { user } = useSession();
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
        // Use type assertion to make TypeScript happy
        const result = await (supabase as any)
          .from('enrollments')
          .select(`
            *,
            course:courses(*)
          `)
          .eq('user_id', user.id)
          .order('started_at', { ascending: false });
        
        if (result.error) throw result.error;
        
        // Process the data to calculate progress
        const enrollmentsWithProgress = await Promise.all(
          result.data.map(async (enrollment: any) => {
            // Default progress
            let progress = 0;
            
            try {
              // Get total lesson count for the course
              const lessonCount = await (supabase as any)
                .from('lessons')
                .select('id', { count: 'exact', head: true })
                .eq('course_id', enrollment.course_id);
              
              const totalLessons = lessonCount.count || 0;
              
              if (totalLessons > 0) {
                // Get completed lessons
                const completedCount = await (supabase as any)
                  .from('completed_lessons')
                  .select('id', { count: 'exact', head: true })
                  .eq('user_id', user.id)
                  .eq('course_id', enrollment.course_id);
                  
                const completedLessons = completedCount.count || 0;
                
                // Calculate progress percentage
                progress = Math.round((completedLessons / totalLessons) * 100);
              }
              
            } catch (err) {
              console.error('Error calculating progress:', err);
            }
            
            return { 
              ...enrollment,
              progress 
            };
          })
        );
        
        setEnrollments(enrollmentsWithProgress);
      } catch (err: any) {
        console.error('Error fetching enrollments:', err);
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load your enrollments. Please try again later.",
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
      const checkResult = await (supabase as any)
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();
      
      if (checkResult.data) {
        toast({
          title: "Already enrolled",
          description: "You are already enrolled in this course",
        });
        return { success: true, enrollment: checkResult.data };
      }
      
      // Create enrollment
      const enrollResult = await (supabase as any)
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          status: 'enrolled',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (enrollResult.error) throw enrollResult.error;
      
      toast({
        title: "Enrollment successful",
        description: "You have successfully enrolled in the course",
      });
      
      return { success: true, enrollment: enrollResult.data };
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
  
  const isEnrolled = async (courseId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const result = await (supabase as any)
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();
      
      if (result.error) throw result.error;
      
      return !!result.data;
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
