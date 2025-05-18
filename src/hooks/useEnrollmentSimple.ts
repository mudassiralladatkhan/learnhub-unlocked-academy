import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/contexts/SessionContext';
import { useNavigate } from 'react-router-dom';

// Storage key for local enrollments data
const ENROLLMENTS_STORAGE_KEY = 'learnhub-enrollments';

/**
 * Result type for enrollment operations
 */
type EnrollmentResult = {
  success: boolean;
  error?: string;
  redirectToCourse?: boolean;
};

/**
 * A simplified enrollment hook that focuses only on the core functionality
 * of checking enrollment status and enrolling in courses.
 */
export function useEnrollmentSimple() {
  const [loading, setLoading] = useState(false);
  const { user } = useSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  /**
   * Check if the current user is enrolled in a course
   */
  const isEnrolled = async (courseId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Check localStorage for enrollments
      const storedData = localStorage.getItem(ENROLLMENTS_STORAGE_KEY);
      if (!storedData) return false;
      
      const enrollments = JSON.parse(storedData);
      const userEnrollment = enrollments.find(
        (e: any) => e.user_id === user.id && e.course_id === courseId
      );
      
      return !!userEnrollment;
    } catch (err) {
      console.error('Error checking enrollment:', err);
      return false;
    }
  };
  
  /**
   * Get the enrollment status for a given course
   */
  const getEnrollmentStatus = async (courseId: string): Promise<'enrolled' | 'in_progress' | 'completed' | null> => {
    if (!user) return null;
    
    try {
      // Check localStorage for enrollments
      const storedData = localStorage.getItem(ENROLLMENTS_STORAGE_KEY);
      if (!storedData) return null;
      
      const enrollments = JSON.parse(storedData);
      const userEnrollment = enrollments.find(
        (e: any) => e.user_id === user.id && e.course_id === courseId
      );
      
      return userEnrollment ? userEnrollment.status : null;
    } catch (err) {
      console.error('Error getting enrollment status:', err);
      return null;
    }
  };
  
  /**
   * Helper function to get demo course data
   */
  const getDemoCourse = (courseId: string) => {
    const demoCourses = [
      {
        id: 'course-1',
        title: 'Introduction to JavaScript',
        description: 'Learn the fundamentals of JavaScript programming language',
        thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=500&q=80',
        instructor: 'John Doe',
        difficulty: 'beginner',
        category: 'Programming',
        duration: 10,
        lessons: 12
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
        lessons: 18
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
        lessons: 10
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
        lessons: 15
      }
    ];
    
    return demoCourses.find(c => c.id === courseId) || demoCourses[0];
  };

  /**
   * Enroll the current user in a course
   */
  const enrollInCourse = async (courseId: string, redirectAfterEnroll: boolean = false): Promise<EnrollmentResult> => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to enroll in courses",
        variant: "destructive",
      });
      return { success: false, error: "Authentication required" };
    }
    
    setLoading(true);
    
    try {
      // Check if user is already enrolled
      const enrolled = await isEnrolled(courseId);
      
      if (enrolled) {
        toast({
          title: "Already enrolled",
          description: "You are already enrolled in this course",
        });
        
        if (redirectAfterEnroll) {
          navigate(`/courses/${courseId}`);
          return { success: true, redirectToCourse: true };
        }
        
        return { success: true };
      }
      
      // Create a new enrollment in localStorage
      const newEnrollment = {
        id: `enrollment-${Date.now()}`,
        user_id: user.id,
        course_id: courseId,
        status: 'enrolled',
        started_at: new Date().toISOString(),
        completed_at: null,
        progress: 0,
        course: getDemoCourse(courseId),
        lesson_count: getDemoCourse(courseId).lessons || 10,
        completed_lessons_count: 0
      };
      
      // Add to localStorage
      const storedData = localStorage.getItem(ENROLLMENTS_STORAGE_KEY);
      const enrollments = storedData ? JSON.parse(storedData) : [];
      
      enrollments.push(newEnrollment);
      localStorage.setItem(ENROLLMENTS_STORAGE_KEY, JSON.stringify(enrollments));
      
      toast({
        title: "Enrollment successful",
        description: "You have successfully enrolled in the course",
      });
      
      if (redirectAfterEnroll) {
        navigate(`/courses/${courseId}`);
        return { success: true, redirectToCourse: true };
      }
      
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to enroll in course";
      console.error('Error enrolling in course:', err);
      toast({
        title: "Enrollment failed",
        description: errorMsg,
        variant: "destructive",
      });
      
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Update the progress of a course
   */
  const updateCourseProgress = async (courseId: string, lessonId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Get current enrollments from localStorage
      const storedData = localStorage.getItem(ENROLLMENTS_STORAGE_KEY);
      if (!storedData) return false;
      
      const enrollments = JSON.parse(storedData);
      const enrollmentIndex = enrollments.findIndex(
        (e: any) => e.user_id === user.id && e.course_id === courseId
      );
      
      if (enrollmentIndex === -1) return false;
      
      // Get the enrollment to update
      const enrollment = enrollments[enrollmentIndex];
      
      // Simulate completed lessons tracking
      const completedLessons = enrollment.completed_lessons || [];
      
      // If this lesson isn't already completed, add it
      if (!completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
        enrollment.completed_lessons = completedLessons;
        
        // Update progress
        const totalLessons = enrollment.lesson_count || 10;
        const completedCount = completedLessons.length;
        const progress = Math.round((completedCount / totalLessons) * 100);
        
        // Update enrollment
        enrollment.completed_lessons_count = completedCount;
        enrollment.progress = progress;
        
        // Update status based on progress
        if (progress >= 100) {
          enrollment.status = 'completed';
          enrollment.completed_at = new Date().toISOString();
        } else if (progress > 0) {
          enrollment.status = 'in_progress';
        }
        
        // Save back to localStorage
        enrollments[enrollmentIndex] = enrollment;
        localStorage.setItem(ENROLLMENTS_STORAGE_KEY, JSON.stringify(enrollments));
        
        // Notify success
        toast({
          title: "Progress updated",
          description: `Lesson completed (${completedCount} of ${totalLessons})`,
        });
      }
      
      return true;
    } catch (err) {
      console.error('Error updating course progress:', err);
      return false;
    }
  };
  
  return {
    loading,
    isEnrolled,
    getEnrollmentStatus,
    enrollInCourse,
    updateCourseProgress
  };
}
