
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourseCard } from '@/components/courses/CourseCard';
import { useCourses } from '@/hooks/useCourses';

export default function HomePage() {
  const { courses, loading } = useCourses();
  
  // Featured courses (first 3 from the list)
  const featuredCourses = courses.slice(0, 3);
  
  // Categories with courses
  const categories = Array.from(new Set(courses.map(course => course.category)));
  
  // Get 4 courses for each category section
  const getCoursesByCategory = (category: string) => {
    return courses
      .filter(course => course.category.toLowerCase() === category.toLowerCase())
      .slice(0, 4);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-brand-800 to-brand-600 dark:from-brand-900 dark:to-brand-700 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute left-0 right-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pattern" width="200" height="200" patternUnits="userSpaceOnUse">
                <path d="M100 0 L200 100 L100 200 L0 100 Z" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#pattern)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-3xl">
            <div className="mb-6">
              <Badge className="bg-brand-400/20 text-white hover:bg-brand-400/30 border-none">
                The Future of Learning
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Expand Your Skills, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-100 to-white">
                Advance Your Career
              </span>
            </h1>
            <p className="text-lg md:text-xl text-brand-100 mb-8">
              Access high-quality courses taught by industry experts on LearnHub. 
              Start your learning journey today with our diverse range of topics.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="bg-white text-brand-700 hover:bg-brand-100">
                <Link to="/courses">Explore Courses</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10">
                <Link to="/register">Join For Free</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent dark:from-background dark:to-transparent"></div>
      </section>
      
      {/* Featured Courses */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-brand-800 dark:text-brand-100">Featured Courses</h2>
              <p className="text-muted-foreground mt-2">Handpicked courses to get you started on your learning journey</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/courses">View All Courses</Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-[350px] bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCourses.map(course => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Course Categories */}
      {categories.slice(0, 3).map(category => (
        <section key={category} className="py-16 bg-muted/30 dark:bg-muted/5">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold text-brand-800 dark:text-brand-100 capitalize">{category}</h2>
                <p className="text-muted-foreground mt-2">Explore our most popular {category.toLowerCase()} courses</p>
              </div>
              <Button variant="outline" asChild>
                <Link to={`/courses?category=${category.toLowerCase()}`}>View All {category} Courses</Link>
              </Button>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-[300px] bg-muted rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {getCoursesByCategory(category).map(course => (
                  <CourseCard key={course.id} {...course} />
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
      
      {/* Why Choose Us */}
      <section className="py-16 bg-white dark:bg-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-800 dark:text-brand-100">Why Choose LearnHub</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              We're dedicated to providing the best learning experience possible
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-brand-900/40 shadow-sm rounded-lg border border-border flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-brand-100 dark:bg-brand-800 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600 dark:text-brand-300">
                  <path d="M7 22h10"></path>
                  <path d="M12 6v12"></path>
                  <path d="M3 10s2-3 9-3 9 3 9 3"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-brand-800 dark:text-brand-100">Expert Instructors</h3>
              <p className="text-muted-foreground">
                Learn from industry professionals with years of practical experience in their respective fields.
              </p>
            </div>
            
            <div className="p-6 bg-white dark:bg-brand-900/40 shadow-sm rounded-lg border border-border flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-brand-100 dark:bg-brand-800 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600 dark:text-brand-300">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-brand-800 dark:text-brand-100">Learn at Your Pace</h3>
              <p className="text-muted-foreground">
                Access course materials 24/7 and learn at your own convenience, with no deadlines or pressure.
              </p>
            </div>
            
            <div className="p-6 bg-white dark:bg-brand-900/40 shadow-sm rounded-lg border border-border flex flex-col items-center text-center">
              <div className="h-14 w-14 rounded-full bg-brand-100 dark:bg-brand-800 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600 dark:text-brand-300">
                  <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                  <path d="M12 8v8"></path>
                  <path d="m8 12 8 0"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-brand-800 dark:text-brand-100">Diverse Course Selection</h3>
              <p className="text-muted-foreground">
                Choose from a wide range of subjects and skill levels to find the perfect course for your needs.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Join CTA */}
      <section className="py-16 bg-brand-50 dark:bg-brand-900/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-brand-800 dark:text-brand-100 mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students already learning on LearnHub. Create your account today and get access to all our courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/register">Sign Up For Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
