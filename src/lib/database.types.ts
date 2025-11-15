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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "work_experience_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "job_postings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "job_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_matches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
