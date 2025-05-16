
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
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type Lesson = {
  id: string;
  course_id: string;
  title: string;
  content: string;
  video_url: string | null;
  order: number;
};

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string, lessonId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<{ title: string; id: string } | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  
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
        const { data, error } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single();
        
        if (error || !data) {
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
  }, [user, courseId, navigate, toast]);
  
  useEffect(() => {
    const fetchLesson = async () => {
      if (!courseId || !lessonId || !user) return;
      
      setLoading(true);
      try {
        // Get course info
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('title, id')
          .eq('id', courseId)
          .single();
        
        if (courseError) throw courseError;
        setCourse(courseData);
        
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
        
        // Check if this lesson is completed
        const { data: completedData, error: completedError } = await supabase
          .from('completed_lessons')
          .select('*')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .single();
        
        if (completedError && completedError.code !== 'PGRST116') {
          throw completedError;
        }
        
        setIsCompleted(Boolean(completedData));
        
        // Calculate overall progress
        const { count: completedCount, error: countError } = await supabase
          .from('completed_lessons')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('lesson_id', allLessonsData.map(l => l.id));
          
        if (!countError && completedCount !== null && allLessonsData.length > 0) {
          setProgress(Math.round((completedCount / allLessonsData.length) * 100));
        }
        
        // Update enrollment status to in_progress if it's not already
        await supabase
          .from('enrollments')
          .update({ status: 'in_progress' })
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .neq('status', 'completed');
          
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
  
  const markAsComplete = async () => {
    if (!user || !lesson) return;
    
    setMarkingComplete(true);
    try {
      if (isCompleted) {
        // Remove completion record
        const { error } = await supabase
          .from('completed_lessons')
          .delete()
          .eq('user_id', user.id)
          .eq('lesson_id', lesson.id);
          
        if (error) throw error;
        
        setIsCompleted(false);
        setProgress(prev => {
          const newProgress = Math.max(0, prev - (1 / allLessons.length) * 100);
          return Math.round(newProgress);
        });
        
        toast({
          title: "Lesson unmarked",
          description: "Lesson marked as incomplete",
        });
      } else {
        // Add completion record
        const { error } = await supabase
          .from('completed_lessons')
          .insert({
            user_id: user.id,
            lesson_id: lesson.id,
            completed_at: new Date().toISOString(),
          });
          
        if (error) throw error;
        
        setIsCompleted(true);
        
        // Calculate new progress
        const newProgress = ((allLessons.filter(l => 
          l.id === lesson.id || 
          allLessons.indexOf(l) < allLessons.findIndex(l => l.id === lesson.id)
        ).length) / allLessons.length) * 100;
        
        setProgress(Math.round(newProgress));
        
        // Check if all lessons are completed
        const allCompleted = newProgress >= 100;
        
        if (allCompleted) {
          // Update enrollment status to completed
          await supabase
            .from('enrollments')
            .update({ 
              status: 'completed',
              completed_at: new Date().toISOString() 
            })
            .eq('user_id', user.id)
            .eq('course_id', courseId);
            
          toast({
            title: "Congratulations! 🎉",
            description: "You've completed the entire course!",
          });
        } else {
          toast({
            title: "Progress saved",
            description: "Lesson marked as complete",
          });
        }
      }
    } catch (err: any) {
      console.error('Error updating lesson status:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update lesson status",
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
                <div className="aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-muted-foreground">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <p className="text-muted-foreground">
                      Video player would be displayed here
                    </p>
                  </div>
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
                  onClick={markAsComplete}
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
