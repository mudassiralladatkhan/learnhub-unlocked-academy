
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSession } from '@/contexts/SessionContext';
import { useEnrollmentsList } from '@/hooks/useEnrollmentsList';
import { RecommendedCourses } from '@/components/dashboard/RecommendedCourses';
import { LearningActivity } from '@/components/dashboard/LearningActivity';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export default function DashboardPage() {
  const { user, loading: userLoading } = useSession();
  const { enrollments, loading: enrollmentsLoading } = useEnrollmentsList();
  
  // Debug user and session
  useEffect(() => {
    console.log("Dashboard page loaded, checking auth state...");
    if (user) {
      console.log("✅ Dashboard loaded with authenticated user:", user.id, user.email);
    } else if (!userLoading) {
      console.log("⚠️ Dashboard loaded but no user found (not loading state)");
    } else {
      console.log("⏳ Dashboard loading user authentication data...");
    }
  }, [user, userLoading]);
  
  // For Hackathon Demo: Keep showing dashboard even for unauthenticated users
  // Remove the strict auth requirement for demo purposes
  // useAuthRedirect({
  //   requireAuth: true,
  //   redirectTo: '/login'
  // });
  
  // Calculate stats (use defaults if data isn't available)
  const loading = userLoading || enrollmentsLoading;
  const totalCourses = enrollments?.length || 0;
  const inProgressCourses = enrollments?.filter(e => e.status === 'in_progress' || e.status === 'enrolled')?.length || 0;
  const completedCourses = enrollments?.filter(e => e.status === 'completed')?.length || 0;
  const averageProgress = enrollments?.length > 0
    ? enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length
    : 0;
  
  // Course progress for chart
  const progressData = enrollments
    .filter(e => e.course?.title)
    .slice(0, 5)
    .map(e => ({
      name: e.course?.title || '',
      progress: e.progress || 0
    }));
    
  // Category distribution for pie chart
  const categoryCount: Record<string, number> = {};
  enrollments.forEach(e => {
    if (e.course?.category) {
      if (!categoryCount[e.course.category]) {
        categoryCount[e.course.category] = 0;
      }
      categoryCount[e.course.category] += 1;
    }
  });
  
  const categoryData = Object.entries(categoryCount).map(([name, value]) => ({
    name,
    value
  }));
  
  const COLORS = ['#9b87f5', '#7E69AB', '#6E59A5', '#4c3a84', '#362670'];
  
  // Get the most recent enrollment
  const latestEnrollment = enrollments.length > 0
    ? enrollments.sort((a, b) => 
        new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      )[0]
    : null;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-800 dark:text-brand-100">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.name || 'Learner'}!
        </p>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(null).map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalCourses}</div>
                <p className="text-xs text-muted-foreground mt-1">Courses you've enrolled in</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{inProgressCourses}</div>
                <p className="text-xs text-muted-foreground mt-1">Courses currently in progress</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completedCourses}</div>
                <p className="text-xs text-muted-foreground mt-1">Courses you've completed</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Math.round(averageProgress)}%</div>
                <div className="mt-2">
                  <Progress value={averageProgress} className="h-1" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Activity / Continue Learning */}
          {latestEnrollment && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-1">
                    <div className="aspect-video rounded-lg overflow-hidden">
                      <img 
                        src={latestEnrollment.course?.thumbnail || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=500&q=80'} 
                        alt={latestEnrollment.course?.title || 'Course thumbnail'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <h3 className="text-xl font-semibold mb-2">
                      {latestEnrollment.course?.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {latestEnrollment.course?.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{latestEnrollment.progress || 0}%</span>
                      </div>
                      <Progress value={latestEnrollment.progress || 0} className="h-2" />
                    </div>
                    
                    <Button asChild>
                      <Link to={`/courses/${latestEnrollment.course_id}`}>
                        Continue Learning
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Learning Activity */}
          {user && (
            <div className="mb-8">
              <LearningActivity userId={user.id} days={30} />
            </div>
          )}
          
          {/* Recommendations - always show, user ID is optional */}
          <div className="mb-8">
            <RecommendedCourses userId={user?.id || ''} limit={3} />
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Course Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
                <CardDescription>Your progress across active courses</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {progressData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {(() => {
                      // Use a function to create chart to avoid TypeScript JSX issues
                      const chart = (
                        <BarChart
                          data={progressData}
                          margin={{ top: 10, right: 10, left: 10, bottom: 30 }}
                        >
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            interval={0}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                          />
                          <Tooltip 
                            formatter={(value) => `${value}%`}
                            labelStyle={{ fontWeight: 'bold' }}
                            contentStyle={{
                              borderRadius: '8px',
                              border: '1px solid #ddd',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Bar 
                            dataKey="progress" 
                            fill="#9b87f5"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      );
                      return chart;
                    })()} 
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No course data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Category Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Course Categories</CardTitle>
                <CardDescription>Distribution of your enrolled courses</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart width={400} height={300}>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }: { name: any; percent: any }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `${value} courses`}
                        contentStyle={{
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                    </PieChart>

                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No category data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Explore Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Discover new courses to expand your knowledge and skills.
                </p>
                <Button asChild>
                  <Link to="/courses">Browse Catalog</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Access all your enrolled courses and track your progress.
                </p>
                <Button asChild>
                  <Link to="/my-learning">View All Courses</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Manage your account settings and personal information.
                </p>
                <Button asChild>
                  <Link to="/profile">Edit Profile</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
