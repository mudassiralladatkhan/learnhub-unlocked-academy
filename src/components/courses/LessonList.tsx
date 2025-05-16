
import { Lesson } from '@/hooks/useCourses';
import { YouTubeEmbed } from './YouTubeEmbed';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type LessonListProps = {
  lessons: Lesson[];
};

export function LessonList({ lessons }: LessonListProps) {
  if (!lessons || lessons.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No lessons available for this course yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Course Lessons</h2>
      {lessons.map((lesson, index) => (
        <Card key={lesson.id} className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">
              {index + 1}. {lesson.lesson_title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <YouTubeEmbed url={lesson.video_url} title={lesson.lesson_title} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
