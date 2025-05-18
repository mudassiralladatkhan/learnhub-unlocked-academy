
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CourseCard } from '@/components/courses/CourseCard';
import { CourseFilter } from '@/components/courses/CourseFilter';
import { useCourses } from '@/hooks/useCourses';

export default function CoursesPage() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const instructor = searchParams.get('instructor') || '';
  const difficulty = searchParams.get('difficulty') || '';
  
  const { courses, loading } = useCourses({
    search,
    category: category === 'all' ? '' : category,
    instructor: instructor === 'all' ? '' : instructor,
    difficulty: difficulty === 'all' ? '' : difficulty.toLowerCase(), // Ensure lowercase for difficulty
  });
  
  // Extract unique categories and instructors for filters
  const [categories, setCategories] = useState<string[]>([]);
  const [instructors, setInstructors] = useState<string[]>([]);
  
  useEffect(() => {
    if (courses.length > 0) {
      setCategories(Array.from(new Set(courses.map(course => course.category))));
      
      // Only extract instructors if they exist in the data
      const courseInstructors = courses
        .map(course => course.instructor)
        .filter(Boolean) as string[];
      
      if (courseInstructors.length > 0) {
        setInstructors(Array.from(new Set(courseInstructors)));
      }
    }
  }, [courses]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-800 dark:text-brand-100 mb-2">LearnHub - Explore Courses</h1>
        <p className="text-muted-foreground">
          Discover courses designed to help you achieve your goals
        </p>
      </div>
      
      {/* Course Filters */}
      <div className="mb-8">
        <CourseFilter categories={categories} instructors={instructors} />
      </div>
      
      {/* Course Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array(8).fill(null).map((_, i) => (
            <div key={i} className="h-[350px] bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium mb-2">No courses found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-muted-foreground">{courses.length} course{courses.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map(course => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
