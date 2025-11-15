import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Json } from '../lib/database.types';
import { TrendingUp, CheckCircle2, XCircle, Lightbulb, FileText, Download } from 'lucide-react';

interface OptimizedCV {
  jobTitle: string;
  company: string;
  targetedSkills: string[];
  highlightedProjects: Array<{
    name: string;
    description: string;
    url: string;
    technologies: string[];
    stars: number;
  }>;
  highlightedExperience: Array<{
    company: string;
    position: string;
    description: string;
    duration: string;
  }>;
  summary: string;
}

interface JobMatch {
  id: string;
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  recommendations: string | null;
  optimized_cv: Json;
  created_at: string;
  job_postings: {
    title: string;
    company: string;
  };
}

export function JobMatches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<JobMatch | null>(null);

  useEffect(() => {
    loadMatches();
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;

    setLoading(true);
    const { data } = await supabase
      .from('job_matches')
      .select(`
        *,
        job_postings (
          title,
          company
        )
      `)
      .eq('user_id', user.id)
      .order('match_score', { ascending: false });

    setMatches(data || []);
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const downloadCV = (match: JobMatch) => {
    const cv = match.optimized_cv as unknown as OptimizedCV;
    let content = `CV OPTIMIZADO PARA: ${cv.jobTitle} en ${cv.company}\n\n`;
    content += `RESUMEN PROFESIONAL:\n${cv.summary}\n\n`;
    content += `HABILIDADES CLAVE:\n${cv.targetedSkills.join(', ')}\n\n`;

    if (cv.highlightedExperience.length > 0) {
      content += `EXPERIENCIA RELEVANTE:\n`;
      cv.highlightedExperience.forEach(exp => {
        content += `\n${exp.position} en ${exp.company}\n`;
        content += `${exp.duration}\n`;
        content += `${exp.description}\n`;
      });
      content += '\n';
    }

    if (cv.highlightedProjects.length > 0) {
      content += `PROYECTOS DESTACADOS:\n`;
      cv.highlightedProjects.forEach(proj => {
        content += `\n${proj.name} (⭐ ${proj.stars})\n`;
        content += `${proj.description}\n`;
        content += `Tecnologías: ${proj.technologies.join(', ')}\n`;
        content += `URL: ${proj.url}\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CV_${cv.company}_${cv.jobTitle.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Cargando análisis...</div>;
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No hay análisis disponibles
        </h3>
        <p className="text-gray-600">
          Analiza ofertas laborales para ver tu compatibilidad
        </p>
      </div>
    );
  }

  if (selectedMatch) {
    const cv = selectedMatch.optimized_cv as unknown as OptimizedCV;
    return (
      <div>
        <button
          onClick={() => setSelectedMatch(null)}
          className="mb-6 text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Volver a la lista
        </button>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {cv.jobTitle}
              </h3>
              <p className="text-lg text-gray-700">{cv.company}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold px-6 py-3 rounded-xl ${getScoreColor(selectedMatch.match_score)}`}>
                {selectedMatch.match_score}%
              </div>
              <button
                onClick={() => downloadCV(selectedMatch)}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Descargar CV
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Recomendaciones</h4>
                <p className="text-blue-800">{selectedMatch.recommendations}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-semibold text-gray-900">Habilidades que cumples</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedMatch.matching_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                <h4 className="font-semibold text-gray-900">Habilidades por desarrollar</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedMatch.missing_skills.length > 0 ? (
                  selectedMatch.missing_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm">¡Cumples con todos los requisitos!</p>
                )}
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-blue-600 mr-2" />
              <h4 className="font-semibold text-gray-900 text-lg">CV Optimizado</h4>
            </div>

            <div className="space-y-6">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Resumen Profesional</h5>
                <p className="text-gray-700">{cv.summary}</p>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-2">Habilidades Destacadas</h5>
                <div className="flex flex-wrap gap-2">
                  {cv.targetedSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {cv.highlightedExperience.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Experiencia Relevante</h5>
                  <div className="space-y-4">
                    {cv.highlightedExperience.map((exp, index) => (
                      <div key={index} className="border-l-2 border-blue-600 pl-4">
                        <h6 className="font-semibold text-gray-900">{exp.position}</h6>
                        <p className="text-sm text-gray-600 mb-1">{exp.company} • {exp.duration}</p>
                        <p className="text-gray-700 text-sm">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cv.highlightedProjects.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Proyectos Destacados</h5>
                  <div className="space-y-4">
                    {cv.highlightedProjects.map((proj, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h6 className="font-semibold text-gray-900">{proj.name}</h6>
                          <span className="text-yellow-600 text-sm">⭐ {proj.stars}</span>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">{proj.description}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {proj.technologies.map((tech, techIndex) => (
                            <span
                              key={techIndex}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        <a
                          href={proj.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Ver proyecto →
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <div
          key={match.id}
          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setSelectedMatch(match)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {match.job_postings.title}
              </h3>
              <p className="text-gray-700">{match.job_postings.company}</p>
            </div>
            <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${getScoreColor(match.match_score)}`}>
              {match.match_score}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Habilidades que cumples ({match.matching_skills.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {match.matching_skills.slice(0, 5).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs"
                  >
                    {skill}
                  </span>
                ))}
                {match.matching_skills.length > 5 && (
                  <span className="px-2 py-0.5 text-gray-500 text-xs">
                    +{match.matching_skills.length - 5}
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Habilidades por desarrollar ({match.missing_skills.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {match.missing_skills.slice(0, 5).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs"
                  >
                    {skill}
                  </span>
                ))}
                {match.missing_skills.length > 5 && (
                  <span className="px-2 py-0.5 text-gray-500 text-xs">
                    +{match.missing_skills.length - 5}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Ver análisis completo y CV optimizado →
          </button>
        </div>
      ))}
    </div>
  );
}
