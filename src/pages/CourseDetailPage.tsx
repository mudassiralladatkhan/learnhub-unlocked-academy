
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Clock, 
  ChevronDown, 
  Book, 
  Play, 
  Check, 
  Star, 
  User 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { StarRating } from '@/components/courses/StarRating';
import { useCourse } from '@/hooks/useCourses';
import { useEnrollments } from '@/hooks/useEnrollments';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type Lesson = {
  id: string;
  title: string;
  content: string;
  video_url: string | null;
  order: number;
  isCompleted?: boolean;
};

type Review = {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user?: {
    name: string;
    avatar: string | null;
  };
};

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { course, loading } = useCourse(id || '');
  const { user } = useAuth();
  const { enrollInCourse } = useEnrollments();
  const { toast } = useToast();
  
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // Fetch lessons
  useEffect(() => {
    const fetchLessons = async () => {
      if (!course) return;
      
      setLoadingLessons(true);
      try {
        // Fetch lessons
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', course.id)
          .order('order', { ascending: true });
        
        if (lessonsError) throw lessonsError;
        
        // If user is logged in, check which lessons are completed
        if (user) {
          const { data: completedData, error: completedError } = await supabase
            .from('completed_lessons')
            .select('lesson_id')
            .eq('user_id', user.id);
          
          if (completedError) throw completedError;
          
          const completedLessonIds = new Set(completedData.map(cl => cl.lesson_id));
          
          setLessons(lessonsData.map(lesson => ({
            ...lesson,
            isCompleted: completedLessonIds.has(lesson.id)
          })));
          
          // Calculate progress
          const completedCount = lessonsData.filter(lesson => 
            completedLessonIds.has(lesson.id)
          ).length;
          
          const progressPercentage = lessonsData.length > 0 
            ? Math.round((completedCount / lessonsData.length) * 100)
            : 0;
            
          setProgress(progressPercentage);
        } else {
          setLessons(lessonsData);
        }
      } catch (err) {
        console.error('Error fetching lessons:', err);
        toast({
          title: "Error",
          description: "Failed to load course lessons",
          variant: "destructive",
        });
      } finally {
        setLoadingLessons(false);
      }
    };
    
    fetchLessons();
  }, [course, user, toast]);
  
  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!course) return;
      
      setLoadingReviews(true);
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            user:users(name, avatar)
          `)
          .eq('course_id', course.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setReviews(data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };
    
    fetchReviews();
  }, [course]);
  
  // Check enrollment status
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!course || !user) {
        setIsEnrolled(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', course.id)
          .single();
        
        if (error) {
          setIsEnrolled(false);
          return;
        }
        
        setIsEnrolled(Boolean(data));
      } catch (err) {
        setIsEnrolled(false);
      }
    };
    
    checkEnrollment();
  }, [course, user]);
  
  const handleEnroll = async () => {
    if (!course) return;
    
    setEnrollmentLoading(true);
    try {
      const result = await enrollInCourse(course.id);
      
      if (result.success) {
        setIsEnrolled(true);
      }
    } finally {
      setEnrollmentLoading(false);
    }
  };
  
  if (loading || !course) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-12 bg-muted rounded-md w-2/3 mb-4"></div>
          <div className="h-6 bg-muted rounded-md w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-2">
              <div className="h-64 bg-muted rounded-md mb-8"></div>
              <div className="space-y-4">
                <div className="h-6 bg-muted rounded-md w-full"></div>
                <div className="h-6 bg-muted rounded-md w-full"></div>
                <div className="h-6 bg-muted rounded-md w-3/4"></div>
              </div>
            </div>
            <div>
              <div className="h-96 bg-muted rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 dark:bg-transparent min-h-screen pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-brand-900/40 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <Badge variant="outline" className="mb-2">{course.category}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-800 dark:text-brand-100">
              {course.title}
            </h1>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center text-muted-foreground mb-4">
            <div className="flex items-center">
              <StarRating rating={course.rating || 0} />
              <span className="ml-2">{course.rating?.toFixed(1) || "0.0"}</span>
              <span className="ml-1">({reviews.length} reviews)</span>
            </div>
            
            <div className="flex items-center gap-1">
              <User size={16} />
              <span>{course.instructor}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{course.duration} hours</span>
            </div>
            
            <Badge className={
              course.difficulty === 'beginner' ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800' :
              course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800' :
              'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800'
            }>
              {course.difficulty}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80'} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="bg-white dark:bg-brand-900/40 rounded-lg p-6 shadow-sm border border-border">
                  <h2 className="text-2xl font-semibold mb-4 text-brand-800 dark:text-brand-100">About This Course</h2>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {course.description}
                  </p>
                </div>
                
                <div className="bg-white dark:bg-brand-900/40 rounded-lg p-6 shadow-sm border border-border">
                  <h2 className="text-2xl font-semibold mb-4 text-brand-800 dark:text-brand-100">What You'll Learn</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "Understand key concepts and principles",
                      "Build practical skills through hands-on projects",
                      "Apply knowledge to real-world scenarios",
                      "Master important techniques and methodologies",
                      "Gain insights from industry experts",
                      "Develop problem-solving abilities",
                    ].map((item, index) => (
                      <li key={index} className="flex items-start">
                        <Check size={20} className="mr-2 text-green-500 flex-shrink-0 mt-1" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-white dark:bg-brand-900/40 rounded-lg p-6 shadow-sm border border-border">
                  <h2 className="text-2xl font-semibold mb-4 text-brand-800 dark:text-brand-100">About the Instructor</h2>
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xl font-semibold mr-4">
                      {course.instructor.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{course.instructor}</h3>
                      <p className="text-muted-foreground">Expert Instructor</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">
                    An experienced professional with extensive knowledge in {course.category}. Committed to helping students master concepts through practical, engaging instruction.
                  </p>
                </div>
              </TabsContent>
              
              {/* Curriculum Tab */}
              <TabsContent value="curriculum" className="space-y-6">
                <div className="bg-white dark:bg-brand-900/40 rounded-lg p-6 shadow-sm border border-border">
                  <h2 className="text-2xl font-semibold mb-4 text-brand-800 dark:text-brand-100">Course Curriculum</h2>
                  
                  {isEnrolled && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Your progress</span>
                        <span>{progress}% complete</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                  
                  {loadingLessons ? (
                    <div className="space-y-4">
                      {Array(5).fill(null).map((_, i) => (
                        <div key={i} className="h-12 bg-muted rounded-md animate-pulse"></div>
                      ))}
                    </div>
                  ) : (
                    <Accordion type="single" collapsible className="w-full">
                      {lessons.map((lesson, index) => (
                        <AccordionItem key={lesson.id} value={lesson.id}>
                          <AccordionTrigger className="hover:bg-muted/50 px-4 py-2 rounded-md">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-800 flex items-center justify-center text-brand-700 dark:text-brand-300 mr-3">
                                {isEnrolled && lesson.isCompleted ? (
                                  <Check size={16} />
                                ) : (
                                  <span>{index + 1}</span>
                                )}
                              </div>
                              <span className="text-left">{lesson.title}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 py-2">
                            <p className="text-muted-foreground mb-4">{lesson.content}</p>
                            
                            {lesson.video_url && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium mb-2">Video Content:</h4>
                                {isEnrolled ? (
                                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                                    <div className="text-center">
                                      <Play size={36} className="mx-auto mb-2 text-brand-500" />
                                      <span>Video content available when enrolled</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                                    <div className="text-center">
                                      <Play size={36} className="mx-auto mb-2 text-muted-foreground" />
                                      <span>Video content available when enrolled</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {isEnrolled && (
                              <div className="flex justify-between items-center">
                                <Link 
                                  to={`/courses/${course.id}/lessons/${lesson.id}`}
                                  className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium"
                                >
                                  {lesson.isCompleted ? 'Review Lesson' : 'Start Learning'}
                                </Link>
                                
                                {lesson.isCompleted && (
                                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                    Completed
                                  </Badge>
                                )}
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </div>
              </TabsContent>
              
              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6">
                <div className="bg-white dark:bg-brand-900/40 rounded-lg p-6 shadow-sm border border-border">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-brand-800 dark:text-brand-100">Student Reviews</h2>
                    
                    {isEnrolled && (
                      <Button variant="outline" asChild>
                        <Link to={`/courses/${course.id}/review`}>
                          <Star className="mr-2 h-4 w-4" />
                          Write a Review
                        </Link>
                      </Button>
                    )}
                  </div>
                  
                  {loadingReviews ? (
                    <div className="space-y-6">
                      {Array(3).fill(null).map((_, i) => (
                        <div key={i} className="h-28 bg-muted rounded-md animate-pulse"></div>
                      ))}
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                      <p className="text-muted-foreground">Be the first to review this course</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map(review => (
                        <div key={review.id} className="border-b border-border pb-6 last:border-0 last:pb-0">
                          <div className="flex items-start">
                            <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 mr-4">
                              {review.user?.avatar ? (
                                <img 
                                  src={review.user.avatar} 
                                  alt={review.user.name || 'User'} 
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <span>{(review.user?.name || 'U').charAt(0)}</span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                                <h4 className="font-medium">{review.user?.name || 'Anonymous User'}</h4>
                                <div className="flex items-center">
                                  <StarRating rating={review.rating} />
                                  <span className="ml-2 text-muted-foreground text-sm">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-brand-900/40 rounded-lg shadow-sm border border-border sticky top-24">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-brand-800 dark:text-brand-100">Course Information</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{course.duration} hours</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level:</span>
                    <span 
                      className={`font-medium ${
                        course.difficulty === 'beginner' ? 'text-green-600 dark:text-green-400' :
                        course.difficulty === 'intermediate' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {course.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{course.category}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lessons:</span>
                    <span className="font-medium">{lessons.length}</span>
                  </div>
                  
                  {isEnrolled && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                  )}
                </div>
                
                {isEnrolled ? (
                  <>
                    <Button 
                      className="w-full mb-4" 
                      asChild
                    >
                      <Link to={`/courses/${course.id}/lessons/${lessons[0]?.id || ''}`}>
                        {progress > 0 ? 'Continue Learning' : 'Start Learning'}
                      </Link>
                    </Button>
                    
                    <div className="text-center text-sm text-muted-foreground">
                      You are enrolled in this course
                    </div>
                  </>
                ) : (
                  <>
                    <Button 
                      className="w-full" 
                      onClick={handleEnroll}
                      disabled={enrollmentLoading}
                    >
                      {enrollmentLoading ? 'Enrolling...' : 'Enroll Now'}
                    </Button>
                    
                    {!user && (
                      <div className="mt-4 text-center text-sm text-muted-foreground">
                        <Link to="/login" className="text-brand-600 hover:underline">Sign in</Link>
                        {' '}to enroll in this course
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="border-t border-border p-6">
                <h4 className="font-medium mb-4">This course includes:</h4>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Book size={18} className="mr-3 text-brand-500" />
                    <span>{lessons.length} lessons</span>
                  </li>
                  <li className="flex items-center">
                    <Play size={18} className="mr-3 text-brand-500" />
                    <span>Video lectures</span>
                  </li>
                  <li className="flex items-center">
                    <Check size={18} className="mr-3 text-brand-500" />
                    <span>Lifetime access</span>
                  </li>
                  <li className="flex items-center">
                    <Star size={18} className="mr-3 text-brand-500" />
                    <span>Course certificate</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
