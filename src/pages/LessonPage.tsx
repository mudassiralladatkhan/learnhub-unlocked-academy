
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/contexts/SessionContext';
import { useToast } from '@/hooks/use-toast';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { useEnrollmentSimple } from '@/hooks/useEnrollmentSimple';

type Lesson = {
  id: string;
  course_id: string;
  title?: string;
  lesson_title?: string; // Support for both title formats
  content?: string;
  video_url?: string | null;
  order?: number;
  created_at?: string;
};

// Storage key for local enrollments data
const ENROLLMENTS_STORAGE_KEY = 'learnhub-enrollments';
const COURSES_STORAGE_KEY = 'learnhub-courses';

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
  const { user } = useSession();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<{ title: string; id: string } | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  
  // Use our enrollment hook instead of direct database calls
  const { isEnrolled, updateCourseProgress } = useEnrollmentSimple();
  
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access course lessons",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    const checkEnrollment = async () => {
      try {
        // Check enrollment from localStorage
        const enrolled = await isEnrolled(courseId || '');
        
        if (!enrolled) {
          toast({
            title: "Access denied",
            description: "You are not enrolled in this course",
            variant: "destructive",
          });
          navigate(`/courses/${courseId}`);
        }
      } catch (err) {
        console.error('Error checking enrollment:', err);
        navigate(`/courses/${courseId}`);
      }
    };
    
    checkEnrollment();
  }, [user, courseId, navigate, toast, isEnrolled]);
  
  useEffect(() => {
    const fetchLesson = async () => {
      if (!courseId || !lessonId || !user) return;
      
      setLoading(true);
      try {
        // Get course info from localStorage
        const storedCourses = localStorage.getItem(COURSES_STORAGE_KEY);
        let courseData = null;
        
        if (storedCourses) {
          const courses = JSON.parse(storedCourses);
          courseData = courses.find((c: any) => c.id === courseId);
          if (courseData) {
            setCourse({
              id: courseData.id,
              title: courseData.title
            });
            
            // Find the current lesson from the course's lessons
            if (courseData.lessons && courseData.lessons.length > 0) {
              const lessonData = courseData.lessons.find((l: any) => l.id === lessonId);
              if (lessonData) {
                // Normalize lesson data
                setLesson({
                  id: lessonData.id,
                  course_id: courseId || '',
                  title: lessonData.title || lessonData.lesson_title,
                  content: lessonData.content || `<h1>${lessonData.title || lessonData.lesson_title}</h1><p>Lesson content</p>`,
                  video_url: lessonData.video_url,
                  order: lessonData.order || courseData.lessons.indexOf(lessonData)
                });
                
                // Set all lessons
                setAllLessons(courseData.lessons.map((l: any) => ({
                  id: l.id,
                  course_id: courseId || '',
                  title: l.title || l.lesson_title,
                  order: l.order || courseData.lessons.indexOf(l)
                })));
                
                // Try to fetch from database only if not found in localStorage
                return;
              }
            }
          }
        }
        
        // If we couldn't get from localStorage, try database
        try {
          // Get course info
          const { data: dbCourseData, error: courseError } = await supabase
            .from('courses')
            .select('title, id')
            .eq('id', courseId)
            .single();
          
          if (courseError) throw courseError;
          setCourse(dbCourseData);
          
          // Get current lesson
          const { data: lessonData, error: lessonError } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', lessonId)
            .eq('course_id', courseId)
            .single();
          
          if (lessonError) throw lessonError;
          setLesson(lessonData);
          
          // Get all lessons for this course
          const { data: allLessonsData, error: allLessonsError } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('order', { ascending: true });
          
          if (allLessonsError) throw allLessonsError;
          setAllLessons(allLessonsData);
        } catch (err: any) {
          console.error('Error fetching lesson from database:', err);
          toast({
            title: "Error",
            description: err.message || "Failed to load lesson",
            variant: "destructive",
          });
          navigate(`/courses/${courseId}`);
        }
      } catch (err: any) {
        console.error('Error fetching lesson:', err);
        toast({
          title: "Error",
          description: err.message || "Failed to load lesson",
          variant: "destructive",
        });
        navigate(`/courses/${courseId}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLesson();
  }, [courseId, lessonId, user, navigate, toast]);
  
  useEffect(() => {
    const checkCompletionStatus = async () => {
      if (!user || !courseId || !lessonId) return;
      
      try {
        // Get enrollments from localStorage
        const storedData = localStorage.getItem(ENROLLMENTS_STORAGE_KEY);
        if (!storedData) return;
        
        const enrollments = JSON.parse(storedData);
        const userEnrollment = enrollments.find(
          (e: any) => e.user_id === user.id && e.course_id === courseId
        );
        
        if (!userEnrollment) return;
        
        // Check if this lesson is in completed lessons
        const completedLessons = userEnrollment.completed_lessons || [];
        setIsCompleted(completedLessons.includes(lessonId));
        
        // Set progress from the enrollment
        if (userEnrollment.progress !== undefined) {
          setProgress(userEnrollment.progress);
        } else if (allLessons.length > 0 && completedLessons.length > 0) {
          // Calculate if not available
          setProgress(Math.floor((completedLessons.length / allLessons.length) * 100));
        }
      } catch (error) {
        console.error('Error checking completion status from localStorage:', error);
      }
    };
    
    if (allLessons.length > 0) {
      checkCompletionStatus();
    }
  }, [user, courseId, lessonId, allLessons]);
  
  const markLessonAsCompleted = async () => {
    if (!user || !courseId || !lessonId) return;
    
    try {
      setMarkingComplete(true);
      
      // Use the hook's updateCourseProgress function to mark as complete
      const success = await updateCourseProgress(courseId, lessonId);
      
      if (success) {
        // Update local state
        setIsCompleted(true);
        
        // Get updated progress from localStorage
        const storedData = localStorage.getItem(ENROLLMENTS_STORAGE_KEY);
        if (storedData) {
          const enrollments = JSON.parse(storedData);
          const enrollment = enrollments.find(
            (e: any) => e.user_id === user.id && e.course_id === courseId
          );
          
          if (enrollment && enrollment.progress !== undefined) {
            setProgress(enrollment.progress);
          }
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to mark lesson as complete",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
      toast({
        title: "Error",
        description: "Failed to mark lesson as complete",
        variant: "destructive",
      });
    } finally {
      setMarkingComplete(false);
    }
  };
  
  const getNextLessonId = () => {
    if (!lesson) return null;
    
    const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
    if (currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1].id;
    }
    return null;
  };
  
  const getPrevLessonId = () => {
    if (!lesson) return null;
    
    const currentIndex = allLessons.findIndex(l => l.id === lesson.id);
    if (currentIndex > 0) {
      return allLessons[currentIndex - 1].id;
    }
    return null;
  };
  
  if (loading || !lesson || !course) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded-md w-1/2 mb-4"></div>
          <div className="h-6 bg-muted rounded-md w-1/4 mb-8"></div>
          <div className="h-64 bg-muted rounded-md mb-8"></div>
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded-md w-full"></div>
            <div className="h-6 bg-muted rounded-md w-full"></div>
            <div className="h-6 bg-muted rounded-md w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent pb-16">
      {/* Course Navigation Bar */}
      <div className="sticky top-16 z-10 bg-white dark:bg-brand-900/80 border-b border-border backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link 
                to={`/courses/${courseId}`}
                className="flex items-center text-muted-foreground hover:text-brand-600 dark:hover:text-brand-400"
              >
                <ChevronLeft size={20} className="mr-1" />
                <span className="hidden sm:inline">Back to Course</span>
              </Link>
              
              <div className="hidden sm:block mx-4 h-4 w-px bg-border"></div>
              
              <h1 className="text-lg font-medium truncate max-w-[150px] sm:max-w-[300px]">
                {course.title}
              </h1>
            </div>
            
            <div className="flex items-center">
              <div className="text-sm text-muted-foreground mr-4 hidden sm:block">
                <span className="font-medium">{progress}%</span> complete
              </div>
              
              <div className="w-32 hidden sm:block">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 sm:hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              <span className="font-medium">{progress}%</span> complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Lesson Content */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-brand-900/40 rounded-lg shadow-sm border border-border p-6">
              <h2 className="text-2xl font-semibold mb-6 text-brand-800 dark:text-brand-100">
                {lesson.title}
              </h2>
              
              {lesson.video_url && (
                <div className="mb-6">
                  <VideoPlayer 
                    src={lesson.video_url} 
                    title={lesson.title}
                    onProgress={(progress) => {
                      // Automatically mark as complete when 90% of the video is watched
                      if (progress >= 90 && !isCompleted) {
                        markLessonAsCompleted();
                      }
                    }}
                    onComplete={() => {
                      if (!isCompleted) {
                        markLessonAsCompleted();
                      }
                    }}
                  />
                </div>
              )}
              
              <div className="prose dark:prose-invert max-w-none">
                {lesson.content.split('\n').map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
              
              <div className="mt-8 flex items-center justify-between pt-6 border-t border-border">
                <Button
                  variant={isCompleted ? "outline" : "default"}
                  onClick={markLessonAsCompleted}
                  disabled={markingComplete}
                  className="flex items-center"
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Circle className="mr-2 h-5 w-5" />
                      Mark as Complete
                    </>
                  )}
                </Button>
                
                <div className="flex gap-2">
                  {getPrevLessonId() && (
                    <Button variant="outline" asChild>
                      <Link to={`/courses/${courseId}/lessons/${getPrevLessonId()}`}>
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Previous
                      </Link>
                    </Button>
                  )}
                  
                  {getNextLessonId() && (
                    <Button asChild>
                      <Link to={`/courses/${courseId}/lessons/${getNextLessonId()}`}>
                        Next
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Lesson Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-brand-900/40 rounded-lg shadow-sm border border-border sticky top-32">
              <div className="p-4 border-b border-border">
                <h3 className="font-medium">Course Content</h3>
              </div>
              
              <div className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {allLessons.map((l, index) => {
                  const isActive = l.id === lesson.id;
                  
                  return (
                    <Link
                      key={l.id}
                      to={`/courses/${courseId}/lessons/${l.id}`}
                      className={`flex items-center p-2 rounded-md mb-1 ${
                        isActive 
                          ? 'bg-brand-50 dark:bg-brand-800/40 text-brand-700 dark:text-brand-300' 
                          : 'hover:bg-muted/80'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                        isActive 
                          ? 'bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-brand-300'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="flex-1 truncate text-sm">{l.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
