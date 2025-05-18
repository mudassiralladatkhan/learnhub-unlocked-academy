import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  type: 'course' | 'lesson';
  url: string;
}

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchContent = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Search courses
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, description, thumbnail, category')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5);

      if (coursesError) throw coursesError;

      // Search lessons
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, title, content, course_id, courses(id, title)')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(5);

      if (lessonsError) throw lessonsError;

      // Format results
      const formattedResults: SearchResult[] = [
        ...(courses?.map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          category: course.category,
          type: 'course' as const,
          url: `/courses/${course.id}`
        })) || []),
        ...(lessons?.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.content?.substring(0, 120) + '...',
          category: 'Lesson',
          type: 'lesson' as const,
          url: `/courses/${lesson.course_id}/lessons/${lesson.id}`
        })) || [])
      ];

      setResults(formattedResults);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search');
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    error,
    searchContent
  };
}
