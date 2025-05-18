
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useSession } from '@/contexts/SessionContext';
import { useCourse } from '@/hooks/useCourses';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const reviewSchema = z.object({
  rating: z.number().min(1, {
    message: "Please select a rating",
  }).max(5),
  comment: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

export default function ReviewPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useSession();
  const navigate = useNavigate();
  const { course, loading } = useCourse(courseId || '');
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<{
    id: string;
    rating: number;
    comment: string | null;
  } | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });
  
  // Check if user is enrolled in this course
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!user || !courseId) {
        navigate(`/courses/${courseId}`);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single();
        
        if (error || !data) {
          toast({
            title: "Not enrolled",
            description: "You must be enrolled in this course to leave a review",
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
  
  // Check if user already has a review
  useEffect(() => {
    const fetchExistingReview = async () => {
      if (!user || !courseId) return;
      
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching review:', error);
          return;
        }
        
        if (data) {
          setExistingReview(data);
          form.reset({
            rating: data.rating,
            comment: data.comment || '',
          });
        }
      } catch (err) {
        console.error('Error fetching review:', err);
      }
    };
    
    fetchExistingReview();
  }, [user, courseId, form]);
  
  const onSubmit = async (data: ReviewFormValues) => {
    if (!user || !courseId) return;
    
    setIsSubmitting(true);
    try {
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating: data.rating,
            comment: data.comment || null,
          })
          .eq('id', existingReview.id);
          
        if (error) throw error;
        
        toast({
          title: "Review updated",
          description: "Your review has been updated successfully",
        });
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert({
            course_id: courseId,
            user_id: user.id,
            rating: data.rating,
            comment: data.comment || null,
            created_at: new Date().toISOString(),
          });
          
        if (error) throw error;
        
        toast({
          title: "Review submitted",
          description: "Thank you for your feedback!",
        });
      }
      
      // Navigate back to course page
      navigate(`/courses/${courseId}`);
    } catch (err: any) {
      console.error('Error saving review:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading || !course) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded-md w-1/2 mb-4"></div>
          <div className="h-6 bg-muted rounded-md w-1/4 mb-8"></div>
          <div className="h-64 bg-muted rounded-md mb-8"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Button variant="outline" className="mb-6" onClick={() => navigate(`/courses/${courseId}`)}>
        ← Back to Course
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {existingReview ? 'Update Your Review' : 'Write a Review'}
          </CardTitle>
          <CardDescription>
            Share your experience with {course.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            className={`text-2xl focus:outline-none transition-colors`}
                            onMouseEnter={() => setHoverRating(rating)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => field.onChange(rating)}
                          >
                            <Star
                              className={`w-8 h-8 ${
                                rating <= (hoverRating || field.value)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              } transition-colors`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-lg font-medium">
                          {hoverRating || field.value || 0}/5
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your thoughts about this course..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(`/courses/${courseId}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
