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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          location: string | null
          bio: string | null
          linkedin_url: string | null
          github_username: string | null
          linkedin_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          location?: string | null
          bio?: string | null
          linkedin_url?: string | null
          github_username?: string | null
          linkedin_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          location?: string | null
          bio?: string | null
          linkedin_url?: string | null
          github_username?: string | null
          linkedin_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          proficiency_level: number
          source: string
          evidence: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category?: string
          proficiency_level?: number
          source?: string
          evidence?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          proficiency_level?: number
          source?: string
          evidence?: Json
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          github_url: string | null
          languages: string[]
          stars: number
          forks: number
          topics: string[]
          contributions: number
          last_updated: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          github_url?: string | null
          languages?: string[]
          stars?: number
          forks?: number
          topics?: string[]
          contributions?: number
          last_updated?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          github_url?: string | null
          languages?: string[]
          stars?: number
          forks?: number
          topics?: string[]
          contributions?: number
          last_updated?: string | null
          created_at?: string
        }
      }
      work_experience: {
        Row: {
          id: string
          user_id: string
          company: string
          position: string
          description: string | null
          start_date: string
          end_date: string | null
          is_current: boolean
          achievements: string[]
          skills_used: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company: string
          position: string
          description?: string | null
          start_date: string
          end_date?: string | null
          is_current?: boolean
          achievements?: string[]
          skills_used?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company?: string
          position?: string
          description?: string | null
          start_date?: string
          end_date?: string | null
          is_current?: boolean
          achievements?: string[]
          skills_used?: string[]
          created_at?: string
        }
      }
      job_postings: {
        Row: {
          id: string
          user_id: string
          title: string
          company: string
          description: string | null
          requirements: string | null
          required_skills: string[]
          preferred_skills: string[]
          location: string | null
          salary_range: string | null
          job_url: string | null
          posting_date: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          company: string
          description?: string | null
          requirements?: string | null
          required_skills?: string[]
          preferred_skills?: string[]
          location?: string | null
          salary_range?: string | null
          job_url?: string | null
          posting_date?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          company?: string
          description?: string | null
          requirements?: string | null
          required_skills?: string[]
          preferred_skills?: string[]
          location?: string | null
          salary_range?: string | null
          job_url?: string | null
          posting_date?: string
          status?: string
          created_at?: string
        }
      }
      job_matches: {
        Row: {
          id: string
          user_id: string
          job_id: string
          match_score: number
          matching_skills: string[]
          missing_skills: string[]
          recommendations: string | null
          optimized_cv: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          job_id: string
          match_score?: number
          matching_skills?: string[]
          missing_skills?: string[]
          recommendations?: string | null
          optimized_cv?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          job_id?: string
          match_score?: number
          matching_skills?: string[]
          missing_skills?: string[]
          recommendations?: string | null
          optimized_cv?: Json
          created_at?: string
        }
      }
    }
  }
}
