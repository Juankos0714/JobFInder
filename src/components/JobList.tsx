import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, MapPin, DollarSign, ExternalLink, TrendingUp, Trash2 } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  description: string | null;
  location: string | null;
  salary_range: string | null;
  job_url: string | null;
  required_skills: string[];
  status: string;
  created_at: string;
}

export function JobList() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, [user]);

  const loadJobs = async () => {
    if (!user) return;

    setLoading(true);
    const { data } = await supabase
      .from('job_postings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setJobs(data || []);
    setLoading(false);
  };

  const analyzeJob = async (jobId: string) => {
    if (!user) return;

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${supabaseUrl}/functions/v1/analyze-job-match`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      });

      if (response.ok) {
        alert('Análisis completado. Ve a la pestaña "Análisis de Compatibilidad" para ver los resultados.');
      } else {
        alert('Error al analizar la oferta. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error analyzing job:', error);
      alert('Error al analizar la oferta.');
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta oferta?')) return;

    await supabase.from('job_postings').delete().eq('id', jobId);
    loadJobs();
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">Cargando ofertas...</div>;
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No hay ofertas registradas
        </h3>
        <p className="text-gray-600">
          Agrega tu primera oferta laboral para comenzar el análisis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{job.title}</h3>
              <p className="text-lg text-gray-700">{job.company}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                job.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : job.status === 'applied'
                  ? 'bg-blue-100 text-blue-700'
                  : job.status === 'interview'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {job.status === 'active' && 'Activa'}
              {job.status === 'applied' && 'Aplicada'}
              {job.status === 'interview' && 'Entrevista'}
              {job.status === 'rejected' && 'Rechazada'}
              {job.status === 'offer' && 'Oferta'}
            </span>
          </div>

          {job.description && (
            <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
            {job.location && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {job.location}
              </div>
            )}
            {job.salary_range && (
              <div className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                {job.salary_range}
              </div>
            )}
          </div>

          {job.required_skills.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Habilidades requeridas:</p>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.slice(0, 10).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm"
                  >
                    {skill}
                  </span>
                ))}
                {job.required_skills.length > 10 && (
                  <span className="px-2 py-1 text-gray-500 text-sm">
                    +{job.required_skills.length - 10} más
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => analyzeJob(job.id)}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Analizar Compatibilidad
            </button>

            {job.job_url && (
              <a
                href={job.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Oferta
              </a>
            )}

            <button
              onClick={() => deleteJob(job.id)}
              className="flex items-center border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium ml-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
