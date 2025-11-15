/*
  # Job Application Optimizer Schema

  ## Overview
  This migration creates the complete database schema for a job application optimization system
  that uses ML to match user profiles with job opportunities.

  ## New Tables
  
  ### 1. `profiles`
  User profile information
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `phone` (text)
  - `location` (text)
  - `bio` (text)
  - `linkedin_url` (text)
  - `github_username` (text)
  - `linkedin_data` (jsonb) - Raw LinkedIn profile data
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `skills`
  User skills extracted from GitHub and LinkedIn
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `name` (text) - Skill name
  - `category` (text) - e.g., "programming", "framework", "tool"
  - `proficiency_level` (int) - 1-5 scale
  - `source` (text) - "github", "linkedin", or "manual"
  - `evidence` (jsonb) - Projects or experiences demonstrating this skill
  - `created_at` (timestamptz)

  ### 3. `projects`
  Projects from GitHub and other sources
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `name` (text)
  - `description` (text)
  - `github_url` (text)
  - `languages` (text[]) - Programming languages used
  - `stars` (int)
  - `forks` (int)
  - `topics` (text[]) - GitHub topics/tags
  - `contributions` (int)
  - `last_updated` (timestamptz)
  - `created_at` (timestamptz)

  ### 4. `work_experience`
  Work experience from LinkedIn
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `company` (text)
  - `position` (text)
  - `description` (text)
  - `start_date` (date)
  - `end_date` (date) - NULL if current
  - `is_current` (boolean)
  - `achievements` (text[])
  - `skills_used` (text[])
  - `created_at` (timestamptz)

  ### 5. `job_postings`
  Job opportunities to match against
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles) - User who added this job
  - `title` (text)
  - `company` (text)
  - `description` (text)
  - `requirements` (text)
  - `required_skills` (text[])
  - `preferred_skills` (text[])
  - `location` (text)
  - `salary_range` (text)
  - `job_url` (text)
  - `posting_date` (timestamptz)
  - `status` (text) - "active", "applied", "rejected", "interview", "offer"
  - `created_at` (timestamptz)

  ### 6. `job_matches`
  ML-generated matches between user profiles and jobs
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `job_id` (uuid, references job_postings)
  - `match_score` (decimal) - 0-100 score
  - `matching_skills` (text[])
  - `missing_skills` (text[])
  - `recommendations` (text) - AI-generated advice
  - `optimized_cv` (jsonb) - Tailored CV data
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Policies for SELECT, INSERT, UPDATE, DELETE operations

  ## Important Notes
  1. All tables use UUID primary keys with automatic generation
  2. Timestamps default to current time
  3. Foreign key constraints ensure data integrity
  4. JSONB fields allow flexible storage of complex data structures
  5. Arrays store multiple values efficiently
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  phone text,
  location text,
  bio text,
  linkedin_url text,
  github_username text,
  linkedin_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text DEFAULT 'general',
  proficiency_level int DEFAULT 3 CHECK (proficiency_level BETWEEN 1 AND 5),
  source text DEFAULT 'manual',
  evidence jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  github_url text,
  languages text[] DEFAULT ARRAY[]::text[],
  stars int DEFAULT 0,
  forks int DEFAULT 0,
  topics text[] DEFAULT ARRAY[]::text[],
  contributions int DEFAULT 0,
  last_updated timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create work_experience table
CREATE TABLE IF NOT EXISTS work_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company text NOT NULL,
  position text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date,
  is_current boolean DEFAULT false,
  achievements text[] DEFAULT ARRAY[]::text[],
  skills_used text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

-- Create job_postings table
CREATE TABLE IF NOT EXISTS job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  company text NOT NULL,
  description text,
  requirements text,
  required_skills text[] DEFAULT ARRAY[]::text[],
  preferred_skills text[] DEFAULT ARRAY[]::text[],
  location text,
  salary_range text,
  job_url text,
  posting_date timestamptz DEFAULT now(),
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Create job_matches table
CREATE TABLE IF NOT EXISTS job_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  match_score decimal(5,2) DEFAULT 0.00 CHECK (match_score BETWEEN 0 AND 100),
  matching_skills text[] DEFAULT ARRAY[]::text[],
  missing_skills text[] DEFAULT ARRAY[]::text[],
  recommendations text,
  optimized_cv jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_work_experience_user_id ON work_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_user_id ON job_postings(user_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_matches_user_id ON job_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_score ON job_matches(match_score DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for skills
CREATE POLICY "Users can view own skills"
  ON skills FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own skills"
  ON skills FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own skills"
  ON skills FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own skills"
  ON skills FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for projects
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for work_experience
CREATE POLICY "Users can view own work experience"
  ON work_experience FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own work experience"
  ON work_experience FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own work experience"
  ON work_experience FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own work experience"
  ON work_experience FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for job_postings
CREATE POLICY "Users can view own job postings"
  ON job_postings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own job postings"
  ON job_postings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own job postings"
  ON job_postings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own job postings"
  ON job_postings FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for job_matches
CREATE POLICY "Users can view own job matches"
  ON job_matches FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own job matches"
  ON job_matches FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own job matches"
  ON job_matches FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own job matches"
  ON job_matches FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());