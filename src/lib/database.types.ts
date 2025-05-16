
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar?: string | null
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string
          instructor: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          category: string
          duration: number
          thumbnail: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          instructor: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          category: string
          duration: number
          thumbnail?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          instructor?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          category?: string
          duration?: number
          thumbnail?: string | null
          created_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          course_id: string
          title: string
          content: string
          video_url: string | null
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          content: string
          video_url?: string | null
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          content?: string
          video_url?: string | null
          order?: number
          created_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          status: 'enrolled' | 'in_progress' | 'completed'
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          status?: 'enrolled' | 'in_progress' | 'completed'
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          status?: 'enrolled' | 'in_progress' | 'completed'
          started_at?: string
          completed_at?: string | null
        }
      }
      completed_lessons: {
        Row: {
          user_id: string
          lesson_id: string
          completed_at: string
        }
        Insert: {
          user_id: string
          lesson_id: string
          completed_at?: string
        }
        Update: {
          user_id?: string
          lesson_id?: string
          completed_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          course_id: string
          title: string
          questions: Json
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          questions: Json
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          questions?: Json
          created_at?: string
        }
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          quiz_id: string
          score: number
          answers: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quiz_id: string
          score: number
          answers: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quiz_id?: string
          score?: number
          answers?: Json
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          course_id: string
          user_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          user_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          user_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
    }
  }
}
