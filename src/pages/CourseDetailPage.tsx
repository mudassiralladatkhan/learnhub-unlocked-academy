
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, BarChart2, User, Calendar } from 'lucide-react';
import { useCourse } from '@/hooks/useCourses';
import { useEnrollmentSimple } from '@/hooks/useEnrollmentSimple';
import { useSession } from '@/contexts/SessionContext';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/courses/StarRating';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LessonList } from '@/components/courses/LessonList';
import { formatDistance } from 'date-fns';

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { course, loading, error } = useCourse(id || '');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const { enrollInCourse, isEnrolled: checkIsEnrolled, loading: enrollmentHookLoading } = useEnrollmentSimple();
  const { user } = useSession();
  const navigate = useNavigate();
  
  // Check if user is enrolled
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!id || !user) return;
      
      try {
        const enrolled = await checkIsEnrolled(id);
        setIsEnrolled(enrolled);
      } catch (error) {
        console.error('Error checking enrollment status:', error);
      }
    };
    
    checkEnrollmentStatus();
  }, [id, user, checkIsEnrolled]);
  
  // Handle enrollment
  const handleEnrollClick = async () => {
    if (!id) return;
    
    // If not logged in, redirect to login
    if (!user) {
      // Store the current course ID to redirect back after login
      sessionStorage.setItem('redirectAfterLogin', `/courses/${id}`);
      navigate('/login');
      return;
    }
    
    try {
      // Use the hook's enrollment function
      const result = await enrollInCourse(id);
      if (result.success) {
        setIsEnrolled(true);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-2/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/3 mb-8"></div>
          <div className="h-64 bg-muted rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-40 bg-muted rounded"></div>
            <div className="h-40 bg-muted rounded"></div>
            <div className="h-40 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !course) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Error Loading Course</h1>
        <p className="mb-6 text-muted-foreground">Unable to load course details. Please try again later.</p>
        <Button variant="outline" asChild>
          <Link to="/courses">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
          </Link>
        </Button>
      </div>
    );
  }

  const createdDate = new Date(course.created_at);
  const timeAgo = formatDistance(createdDate, new Date(), { addSuffix: true });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="outline" className="mb-6" asChild>
        <Link to="/courses">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
        </Link>
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <Badge variant="outline" className="px-2 py-1">
                {course.category}
              </Badge>
              {course.difficulty && (
                <Badge variant="secondary" className="px-2 py-1">
                  {course.difficulty}
                </Badge>
              )}
              {course.rating !== undefined && course.rating > 0 && (
                <div className="flex items-center">
                  <StarRating rating={course.rating} size={18} />
                  <span className="ml-2 text-muted-foreground">{course.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <p className="text-lg text-muted-foreground">{course.description}</p>
          </div>
          
          {/* Course metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {course.instructor && (
              <Card>
                <CardContent className="flex items-center p-4">
                  <User className="h-5 w-5 text-muted-foreground mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Instructor</p>
                    <p className="font-medium">{course.instructor}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {course.lessons && (
              <Card>
                <CardContent className="flex items-center p-4">
                  <BookOpen className="h-5 w-5 text-muted-foreground mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Lessons</p>
                    <p className="font-medium">{course.lessons.length}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {course.duration && (
              <Card>
                <CardContent className="flex items-center p-4">
                  <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{course.duration} hours</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardContent className="flex items-center p-4">
                <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{timeAgo}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Course lessons */}
          {course.lessons && course.lessons.length > 0 && (
            <LessonList lessons={course.lessons} />
          )}
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card className="overflow-hidden">
              <div className="aspect-video">
                <img 
                  src={course.thumbnail || "https://images.unsplash.com/photo-1580894742597-87bc8789db3d?auto=format&fit=crop&w=600&h=350&q=80"} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                {isEnrolled ? (
                  <div className="text-center">
                    <Badge className="mb-4 py-1.5 px-3">Enrolled</Badge>
                    <Button variant="outline" className="w-full mb-3" asChild>
                      <Link to={`/my-learning`}>Go to My Learning</Link>
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={handleEnrollClick} 
                    disabled={enrollmentLoading}
                  >
                    {enrollmentLoading ? "Enrolling..." : "Enroll in Course"}
                  </Button>
                )}
                
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold">This course includes:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {course.lessons && <li>• {course.lessons.length} lessons</li>}
                    {course.duration && <li>• {course.duration} hours of content</li>}
                    <li>• Full lifetime access</li>
                    <li>• Access on mobile and desktop</li>
                    <li>• Certificate of completion</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
