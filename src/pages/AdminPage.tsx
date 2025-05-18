
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useSession } from '@/contexts/SessionContext';
import { useCourses, Course } from '@/hooks/useCourses';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
  const { isAdmin, user } = useSession();
  const navigate = useNavigate();
  const { courses, loading } = useCourses();
  const { toast } = useToast();
  
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [enrollmentStats, setEnrollmentStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0
  });
  
  useEffect(() => {
    if (!user || !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You do not have permission to access this page",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    // Fetch users
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setLoadingUsers(false);
      }
    };
    
    // Fetch enrollment stats
    const fetchEnrollmentStats = async () => {
      try {
        // Total enrollments
        const { count: total } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true });
        
        // Completed enrollments
        const { count: completed } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed');
        
        // In progress enrollments
        const { count: inProgress } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'in_progress');
        
        setEnrollmentStats({
          total: total || 0,
          completed: completed || 0,
          inProgress: inProgress || 0
        });
      } catch (err) {
        console.error('Error fetching enrollment stats:', err);
      }
    };
    
    fetchUsers();
    fetchEnrollmentStats();
  }, [user, isAdmin, navigate, toast]);
  
  if (!user || !isAdmin) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-brand-800 dark:text-brand-100 mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Manage courses, users, and view statistics
      </p>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{enrollmentStats.total}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300">
                In Progress: {enrollmentStats.inProgress}
              </Badge>
              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300">
                Completed: {enrollmentStats.completed}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        {/* Courses Tab */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Manage Courses</CardTitle>
                  <CardDescription>Add, edit, or delete courses</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Add New Course</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Add New Course</DialogTitle>
                      <DialogDescription>
                        Enter the details for the new course
                      </DialogDescription>
                    </DialogHeader>
                    <CourseForm />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-96 flex items-center justify-center">
                  <p className="text-muted-foreground">Loading courses...</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No courses found</h3>
                  <p className="text-muted-foreground">
                    Start by adding a new course
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.instructor}</TableCell>
                        <TableCell>{course.category}</TableCell>
                        <TableCell>
                          <Badge className={
                            course.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                            course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {course.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">Edit</Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                  <DialogTitle>Edit Course</DialogTitle>
                                  <DialogDescription>
                                    Update course details
                                  </DialogDescription>
                                </DialogHeader>
                                <CourseForm course={course} />
                              </DialogContent>
                            </Dialog>
                            <Button size="sm" variant="destructive">Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage user accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="h-96 flex items-center justify-center">
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No users found</h3>
                  <p className="text-muted-foreground">
                    There are no registered users in the system
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name || 'No name'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Course Form Component for Add/Edit
function CourseForm({ course }: { course?: Course }) {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    description: course?.description || '',
    instructor: course?.instructor || '',
    category: course?.category || '',
    difficulty: course?.difficulty || 'beginner',
    duration: course?.duration || 0,
    thumbnail: course?.thumbnail || '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (course) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update(formData)
          .eq('id', course.id);
          
        if (error) throw error;
        
        toast({
          title: "Course updated",
          description: "The course has been updated successfully",
        });
      } else {
        // Create new course
        const { error } = await supabase
          .from('courses')
          .insert({
            ...formData,
            created_at: new Date().toISOString(),
          });
          
        if (error) throw error;
        
        toast({
          title: "Course created",
          description: "The course has been created successfully",
        });
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          instructor: '',
          category: '',
          difficulty: 'beginner',
          duration: 0,
          thumbnail: '',
        });
      }
    } catch (err: any) {
      console.error('Error saving course:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to save course",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Course Title
        </label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter course title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter course description"
          className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-foreground"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="instructor" className="text-sm font-medium">
            Instructor
          </label>
          <Input
            id="instructor"
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            placeholder="Enter instructor name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <Input
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Enter course category"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="difficulty" className="text-sm font-medium">
            Difficulty
          </label>
          <select
            id="difficulty"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground"
            required
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="duration" className="text-sm font-medium">
            Duration (hours)
          </label>
          <Input
            id="duration"
            name="duration"
            type="number"
            value={formData.duration}
            onChange={handleChange}
            placeholder="Enter course duration"
            min="0"
            step="0.1"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="thumbnail" className="text-sm font-medium">
          Thumbnail URL
        </label>
        <Input
          id="thumbnail"
          name="thumbnail"
          value={formData.thumbnail || ''}
          onChange={handleChange}
          placeholder="Enter thumbnail image URL (optional)"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
        </Button>
      </div>
    </form>
  );
}
