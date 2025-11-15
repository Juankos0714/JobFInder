import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface JobMatchRequest {
  jobId: string;
}

interface Skill {
  name: string;
  proficiency_level: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { jobId }: JobMatchRequest = await req.json();

    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: skills } = await supabase
      .from('skills')
      .select('name, proficiency_level')
      .eq('user_id', user.id);

    const { data: projects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('stars', { ascending: false })
      .limit(10);

    const { data: experience } = await supabase
      .from('work_experience')
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });

    const userSkills = (skills || []) as Skill[];
    const requiredSkills = job.required_skills || [];
    const preferredSkills = job.preferred_skills || [];

    const userSkillsMap = new Map(
      userSkills.map(s => [s.name.toLowerCase(), s.proficiency_level])
    );

    const matchingRequired = requiredSkills.filter((skill: string) =>
      userSkillsMap.has(skill.toLowerCase())
    );

    const matchingPreferred = preferredSkills.filter((skill: string) =>
      userSkillsMap.has(skill.toLowerCase())
    );

    const missingRequired = requiredSkills.filter(
      (skill: string) => !userSkillsMap.has(skill.toLowerCase())
    );

    const requiredScore = requiredSkills.length > 0
      ? (matchingRequired.length / requiredSkills.length) * 70
      : 70;

    const preferredScore = preferredSkills.length > 0
      ? (matchingPreferred.length / preferredSkills.length) * 20
      : 20;

    const experienceScore = experience && experience.length > 0 ? 10 : 5;

    const matchScore = Math.round(requiredScore + preferredScore + experienceScore);

    const matchingSkills = [...matchingRequired, ...matchingPreferred];

    const recommendations = generateRecommendations(
      matchScore,
      missingRequired,
      matchingSkills,
      projects || [],
      experience || []
    );

    const optimizedCV = generateOptimizedCV(
      job,
      matchingSkills,
      projects || [],
      experience || []
    );

    const { data: match, error: matchError } = await supabase
      .from('job_matches')
      .upsert({
        user_id: user.id,
        job_id: jobId,
        match_score: matchScore,
        matching_skills: matchingSkills,
        missing_skills: missingRequired,
        recommendations,
        optimized_cv: optimizedCV,
      })
      .select()
      .single();

    if (matchError) {
      throw matchError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        match,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateRecommendations(
  matchScore: number,
  missingSkills: string[],
  matchingSkills: string[],
  projects: any[],
  experience: any[]
): string {
  const recommendations = [];

  if (matchScore >= 80) {
    recommendations.push('¡Excelente match! Tienes una alta compatibilidad con esta oferta.');
  } else if (matchScore >= 60) {
    recommendations.push('Buen match. Cumples con la mayoría de los requisitos.');
  } else if (matchScore >= 40) {
    recommendations.push('Match moderado. Considera fortalecer algunas habilidades.');
  } else {
    recommendations.push('Match bajo. Esta posición puede estar fuera de tu perfil actual.');
  }

  if (missingSkills.length > 0) {
    recommendations.push(
      `Considera desarrollar estas habilidades: ${missingSkills.slice(0, 5).join(', ')}.`
    );
  }

  if (projects.length > 0) {
    const topProjects = projects.slice(0, 3).map(p => p.name).join(', ');
    recommendations.push(
      `Destaca estos proyectos en tu CV: ${topProjects}.`
    );
  }

  if (experience.length > 0) {
    recommendations.push(
      `Enfatiza tu experiencia en ${experience[0].company} para esta posición.`
    );
  }

  if (matchingSkills.length > 0) {
    recommendations.push(
      `Asegúrate de resaltar estas habilidades clave: ${matchingSkills.slice(0, 5).join(', ')}.`
    );
  }

  return recommendations.join(' ');
}

function generateOptimizedCV(
  job: any,
  matchingSkills: string[],
  projects: any[],
  experience: any[]
): any {
  const relevantProjects = projects
    .filter(p =>
      matchingSkills.some(skill =>
        p.languages.some((lang: string) => lang.toLowerCase().includes(skill.toLowerCase())) ||
        p.topics.some((topic: string) => topic.toLowerCase().includes(skill.toLowerCase()))
      )
    )
    .slice(0, 5);

  const relevantExperience = experience
    .filter(exp =>
      matchingSkills.some(skill =>
        exp.position.toLowerCase().includes(skill.toLowerCase()) ||
        exp.description?.toLowerCase().includes(skill.toLowerCase())
      )
    )
    .slice(0, 3);

  return {
    jobTitle: job.title,
    company: job.company,
    targetedSkills: matchingSkills,
    highlightedProjects: relevantProjects.map((p: any) => ({
      name: p.name,
      description: p.description,
      url: p.github_url,
      technologies: p.languages,
      stars: p.stars,
    })),
    highlightedExperience: relevantExperience.map((exp: any) => ({
      company: exp.company,
      position: exp.position,
      description: exp.description,
      duration: `${exp.start_date} - ${exp.end_date || 'Present'}`,
    })),
    summary: `Profesional con experiencia en ${matchingSkills.slice(0, 3).join(', ')} buscando contribuir en ${job.company}.`,
  };
}
