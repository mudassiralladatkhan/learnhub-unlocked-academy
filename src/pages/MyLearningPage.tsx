
import { Tab } from '@headlessui/react';
import { CourseCard } from '@/components/courses/CourseCard';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useEnrollments } from '@/hooks/useEnrollments';
import { Link } from 'react-router-dom';

export default function MyLearningPage() {
  const { enrollments, loading } = useEnrollments();
  
  // Categorize enrollments by status
  const inProgress = enrollments.filter(enrollment => enrollment.status === 'in_progress' || enrollment.status === 'enrolled');
  const completed = enrollments.filter(enrollment => enrollment.status === 'completed');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-brand-800 dark:text-brand-100 mb-2">My Learning</h1>
      <p className="text-muted-foreground mb-8">
        Track and manage your enrolled courses
      </p>
      
      {loading ? (
        <div className="space-y-8">
          <div className="h-12 bg-muted rounded-md animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(4).fill(null).map((_, i) => (
              <div key={i} className="h-[350px] bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-brand-900/40 rounded-lg shadow-sm border border-border">
          <div className="mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-brand-400">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <h3 className="text-xl font-medium mb-2">You haven't enrolled in any courses yet</h3>
          <p className="text-muted-foreground mb-6">
            Browse our course catalog to find courses that interest you
          </p>
          <Button asChild>
            <Link to="/courses">Explore Courses</Link>
          </Button>
        </div>
      ) : (
        <Tab.Group>
          <Tab.List className="flex space-x-1 p-1 bg-muted rounded-lg mb-8">
            <Tab
              className={({ selected }) =>
                `w-full py-2.5 text-sm font-medium leading-5 rounded-md
                 ${
                   selected
                     ? 'bg-white dark:bg-brand-900/40 shadow text-brand-700 dark:text-brand-300'
                     : 'text-gray-600 hover:text-brand-700 dark:text-gray-300 dark:hover:text-brand-300'
                 }`
              }
            >
              In Progress ({inProgress.length})
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full py-2.5 text-sm font-medium leading-5 rounded-md
                 ${
                   selected
                     ? 'bg-white dark:bg-brand-900/40 shadow text-brand-700 dark:text-brand-300'
                     : 'text-gray-600 hover:text-brand-700 dark:text-gray-300 dark:hover:text-brand-300'
                 }`
              }
            >
              Completed ({completed.length})
            </Tab>
          </Tab.List>
          
          <Tab.Panels>
            <Tab.Panel>
              {inProgress.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-brand-900/40 rounded-lg shadow-sm border border-border">
                  <h3 className="text-xl font-medium mb-2">No courses in progress</h3>
                  <p className="text-muted-foreground">
                    You don't have any courses in progress
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {inProgress.map(enrollment => (
                    <div key={enrollment.id} className="bg-white dark:bg-brand-900/40 rounded-lg shadow-sm border border-border overflow-hidden">
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                        <div className="md:col-span-1">
                          <div className="aspect-video md:h-full w-full">
                            <img 
                              src={enrollment.course?.thumbnail || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=500&q=80'} 
                              alt={enrollment.course?.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="p-6 md:col-span-2 lg:col-span-3">
                          <h3 className="text-xl font-semibold mb-2 text-brand-800 dark:text-brand-100">
                            {enrollment.course?.title}
                          </h3>
                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {enrollment.course?.description}
                          </p>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{enrollment.progress || 0}%</span>
                              </div>
                              <Progress value={enrollment.progress || 0} className="h-2" />
                            </div>
                            
                            <Button asChild>
                              <Link to={`/courses/${enrollment.course_id}`}>
                                {enrollment.progress && enrollment.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                              </Link>
                            </Button>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <div>Instructor: {enrollment.course?.instructor}</div>
                            <div className="hidden sm:block">•</div>
                            <div>Difficulty: {enrollment.course?.difficulty}</div>
                            <div className="hidden sm:block">•</div>
                            <div>Category: {enrollment.course?.category}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Tab.Panel>
            <Tab.Panel>
              {completed.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-brand-900/40 rounded-lg shadow-sm border border-border">
                  <h3 className="text-xl font-medium mb-2">No completed courses</h3>
                  <p className="text-muted-foreground">
                    You haven't completed any courses yet
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {completed.map(enrollment => (
                    <CourseCard 
                      key={enrollment.id}
                      id={enrollment.course_id}
                      title={enrollment.course?.title || ''}
                      description={enrollment.course?.description || ''}
                      instructor={enrollment.course?.instructor || ''}
                      category={enrollment.course?.category || ''}
                      difficulty={enrollment.course?.difficulty || 'beginner'}
                      duration={enrollment.course?.duration || 0}
                      thumbnail={enrollment.course?.thumbnail}
                      created_at={enrollment.started_at} {/* Add the required created_at field */}
                      enrolled={true}
                      progress={100}
                    />
                  ))}
                </div>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      )}
    </div>
  );
}
