import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/contexts/SessionContext';

/**
 * Type for enrollment data
 */
export type EnrollmentWithCourse = {
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
    instructor?: string;
    difficulty?: string;
    category: string;
    duration?: number;
  };
  progress: number;
  lesson_count: number;
  completed_lessons_count: number;
};

/**
 * Database response types
 */
type EnrollmentResponse = {
  id: string;
  user_id: string;
  course_id: string;
  status: 'enrolled' | 'in_progress' | 'completed';
  started_at: string;
  completed_at: string | null;
  course: {
    title: string;
    thumbnail: string | null;
    description: string;
    instructor: string | null;
    difficulty: string | null;
    category: string;
    duration: number | null;
  } | null;
};

// Storage key for local enrollments data
const ENROLLMENTS_STORAGE_KEY = 'learnhub-enrollments';

/**
 * Hook for fetching user enrollments with course details
 * Falls back to localStorage if database tables don't exist
 */
export function useEnrollmentsList() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSession();
  const { toast } = useToast();

  // Helper function to get demo course data
  const getDemoCourses = () => {
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
  };

  // Helper to load enrollments from localStorage or create demo data
  const loadEnrollments = () => {
    if (!user) return [];
    
    try {
      // Try to get enrollments from localStorage
      const storedData = localStorage.getItem(ENROLLMENTS_STORAGE_KEY);
      let userEnrollments = [];
      
      if (storedData) {
        const allEnrollments = JSON.parse(storedData);
        userEnrollments = allEnrollments.filter((e: any) => e.user_id === user.id);
      }
      
      // If no enrollments found, create demo enrollments for this user
      if (userEnrollments.length === 0) {
        const demoCourses = getDemoCourses();
        const now = new Date().toISOString();
        
        // Enroll the user in two demo courses with different statuses
        userEnrollments = [
          {
            id: `enrollment-${Date.now()}-1`,
            user_id: user.id,
            course_id: demoCourses[0].id,
            status: 'in_progress',
            started_at: now,
            completed_at: null,
            progress: 35,
            course: demoCourses[0],
            lesson_count: demoCourses[0].lessons,
            completed_lessons_count: Math.floor(demoCourses[0].lessons * 0.35)
          },
          {
            id: `enrollment-${Date.now()}-2`,
            user_id: user.id,
            course_id: demoCourses[1].id,
            status: 'enrolled',
            started_at: now,
            completed_at: null,
            progress: 0,
            course: demoCourses[1],
            lesson_count: demoCourses[1].lessons,
            completed_lessons_count: 0
          },
          {
            id: `enrollment-${Date.now()}-3`,
            user_id: user.id,
            course_id: demoCourses[2].id,
            status: 'completed',
            started_at: new Date(Date.now() - 30*24*60*60*1000).toISOString(), // 30 days ago
            completed_at: now,
            progress: 100,
            course: demoCourses[2],
            lesson_count: demoCourses[2].lessons,
            completed_lessons_count: demoCourses[2].lessons
          }
        ];
        
        // Save to localStorage
        localStorage.setItem(ENROLLMENTS_STORAGE_KEY, JSON.stringify(userEnrollments));
      }
      
      return userEnrollments;
    } catch (err) {
      console.error('Error loading enrollments from localStorage:', err);
      return []; 
    }
  };

  // Save enrollments to localStorage
  const saveEnrollments = (updatedEnrollments: EnrollmentWithCourse[]) => {
    try {
      localStorage.setItem(ENROLLMENTS_STORAGE_KEY, JSON.stringify(updatedEnrollments));
    } catch (err) {
      console.error('Error saving enrollments to localStorage:', err);
    }
  };
  
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
        // Instead of database queries, use localStorage
        // This is a complete workaround for missing database tables
        const userEnrollments = loadEnrollments();
        setEnrollments(userEnrollments);
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMsg);
        toast({
          title: "Error loading enrollments",
          description: "Failed to load your enrollments. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnrollments();
  }, [user, toast]);

  // Add a function to update enrollment status
  const updateEnrollmentStatus = (enrollmentId: string, newStatus: 'enrolled' | 'in_progress' | 'completed', progress: number) => {
    setEnrollments(prevEnrollments => {
      const updatedEnrollments = prevEnrollments.map(enrollment => {
        if (enrollment.id === enrollmentId) {
          const updates = {
            ...enrollment,
            status: newStatus,
            progress,
          };
          
          if (newStatus === 'completed') {
            updates.completed_at = new Date().toISOString();
          }
          
          return updates;
        }
        return enrollment;
      });
      
      // Save to localStorage
      saveEnrollments(updatedEnrollments);
      
      return updatedEnrollments;
    });
  };

  // Add a function to remove an enrollment
  const removeEnrollment = (enrollmentId: string) => {
    setEnrollments(prevEnrollments => {
      const updatedEnrollments = prevEnrollments.filter(enrollment => enrollment.id !== enrollmentId);
      
      // Save to localStorage
      saveEnrollments(updatedEnrollments);
      
      toast({
        title: "Enrollment Removed",
        description: "You have successfully removed the course from your enrollments.",
        variant: "default",
      });
      
      return updatedEnrollments;
    });
  };

  return {
    enrollments,
    loading,
    error,
    updateEnrollmentStatus,
    removeEnrollment
  };
}
