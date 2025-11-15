import { supabase } from '../lib/supabase';
import type { Json } from '../lib/database.types';

export interface LinkedInProfile {
  fullName?: string;
  headline?: string;
  location?: string;
  summary?: string;
  profileUrl?: string;
  experience?: LinkedInExperience[];
  skills?: string[];
}

export interface LinkedInExperience {
  company: string;
  position: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  location?: string;
}

export async function parseLinkedInData(rawData: string): Promise<LinkedInProfile | null> {
  try {
    const profile: LinkedInProfile = {
      experience: [],
      skills: []
    };

    const lines = rawData.split('\n').map(line => line.trim()).filter(line => line);

    let currentSection = '';
    let currentExperience: Partial<LinkedInExperience> | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.toLowerCase().includes('experience')) {
        currentSection = 'experience';
        continue;
      }

      if (line.toLowerCase().includes('skills')) {
        currentSection = 'skills';
        continue;
      }

      if (currentSection === 'experience') {
        if (line.includes('·') || line.includes('-')) {
          if (currentExperience && currentExperience.company && currentExperience.position) {
            profile.experience!.push(currentExperience as LinkedInExperience);
          }

          currentExperience = {
            company: '',
            position: line,
            isCurrent: line.toLowerCase().includes('present') || line.toLowerCase().includes('actual'),
          };
        } else if (currentExperience) {
          if (!currentExperience.company) {
            currentExperience.company = line;
          } else if (line.includes('20') && line.length < 30) {
            const dates = line.split('-').map(d => d.trim());
            currentExperience.startDate = dates[0];
            currentExperience.endDate = dates[1] || undefined;
          } else if (currentExperience.position && !currentExperience.description) {
            currentExperience.description = line;
          }
        }
      }

      if (currentSection === 'skills') {
        const skills = line.split(/[,·•]/).map(s => s.trim()).filter(s => s && s.length > 2);
        profile.skills!.push(...skills);
      }
    }

    if (currentExperience && currentExperience.company && currentExperience.position) {
      profile.experience!.push(currentExperience as LinkedInExperience);
    }

    return profile;
  } catch (error) {
    console.error('Error parsing LinkedIn data:', error);
    return null;
  }
}

export async function syncLinkedInData(userId: string, linkedInData: LinkedInProfile) {
  try {
    await supabase.from('profiles').update({
      full_name: linkedInData.fullName,
      location: linkedInData.location,
      bio: linkedInData.summary,
      linkedin_url: linkedInData.profileUrl,
      linkedin_data: linkedInData as unknown as Json,
      updated_at: new Date().toISOString(),
    }).eq('id', userId);

    if (linkedInData.experience) {
      for (const exp of linkedInData.experience) {
        if (exp.company && exp.position && exp.startDate) {
          await supabase.from('work_experience').insert({
            user_id: userId,
            company: exp.company,
            position: exp.position,
            description: exp.description || '',
            start_date: exp.startDate,
            end_date: exp.endDate || null,
            is_current: exp.isCurrent,
            skills_used: [],
          });
        }
      }
    }

    if (linkedInData.skills) {
      for (const skillName of linkedInData.skills) {
        await supabase.from('skills').upsert({
          user_id: userId,
          name: skillName,
          category: 'general',
          proficiency_level: 3,
          source: 'linkedin',
          evidence: [],
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error syncing LinkedIn data:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function importLinkedInManually(userId: string, data: {
  fullName?: string;
  location?: string;
  bio?: string;
  linkedinUrl?: string;
  experiences: Array<{
    company: string;
    position: string;
    description?: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
  }>;
  skills: string[];
}) {
  try {
    await supabase.from('profiles').update({
      full_name: data.fullName,
      location: data.location,
      bio: data.bio,
      linkedin_url: data.linkedinUrl,
      updated_at: new Date().toISOString(),
    }).eq('id', userId);

    for (const exp of data.experiences) {
      await supabase.from('work_experience').insert({
        user_id: userId,
        company: exp.company,
        position: exp.position,
        description: exp.description || '',
        start_date: exp.startDate,
        end_date: exp.endDate || null,
        is_current: exp.isCurrent,
        skills_used: [],
      });
    }

    for (const skillName of data.skills) {
      await supabase.from('skills').upsert({
        user_id: userId,
        name: skillName,
        category: 'general',
        proficiency_level: 3,
        source: 'manual',
        evidence: [],
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error importing LinkedIn data:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
