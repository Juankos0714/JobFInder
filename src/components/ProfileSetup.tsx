import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { syncGitHubData } from '../services/github';
import { importLinkedInManually } from '../services/linkedin';
import { supabase } from '../lib/supabase';
import { Github, Linkedin, Loader2, CheckCircle2 } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: () => void;
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'github' | 'linkedin' | 'complete'>('github');
  const [loading, setLoading] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [linkedinData, setLinkedinData] = useState({
    fullName: '',
    location: '',
    bio: '',
    linkedinUrl: '',
    experiences: [] as Array<{
      company: string;
      position: string;
      description: string;
      startDate: string;
      endDate: string;
      isCurrent: boolean;
    }>,
    skills: '',
  });

  const handleGitHubSync = async () => {
    if (!user || !githubUsername) return;

    setLoading(true);
    try {
      await supabase
        .from('profiles')
        .update({ github_username: githubUsername })
        .eq('id', user.id);

      await syncGitHubData(user.id, githubUsername);
      setStep('linkedin');
    } catch (error) {
      console.error('Error syncing GitHub:', error);
      alert('Error al sincronizar GitHub. Verifica el nombre de usuario.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInImport = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await importLinkedInManually(user.id, {
        fullName: linkedinData.fullName,
        location: linkedinData.location,
        bio: linkedinData.bio,
        linkedinUrl: linkedinData.linkedinUrl,
        experiences: linkedinData.experiences,
        skills: linkedinData.skills.split(',').map(s => s.trim()).filter(s => s),
      });
      setStep('complete');
      setTimeout(() => onComplete(), 2000);
    } catch (error) {
      console.error('Error importing LinkedIn data:', error);
      alert('Error al importar datos. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const addExperience = () => {
    setLinkedinData({
      ...linkedinData,
      experiences: [
        ...linkedinData.experiences,
        {
          company: '',
          position: '',
          description: '',
          startDate: '',
          endDate: '',
          isCurrent: false,
        },
      ],
    });
  };

  const updateExperience = (index: number, field: string, value: string | boolean) => {
    const newExperiences = [...linkedinData.experiences];
    newExperiences[index] = { ...newExperiences[index], [field]: value };
    setLinkedinData({ ...linkedinData, experiences: newExperiences });
  };

  const removeExperience = (index: number) => {
    setLinkedinData({
      ...linkedinData,
      experiences: linkedinData.experiences.filter((_, i) => i !== index),
    });
  };

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-4 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Perfil Configurado!
          </h2>
          <p className="text-gray-600">
            Tu perfil ha sido configurado exitosamente. Redirigiendo al dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Configura tu Perfil
          </h1>
          <p className="text-gray-600">
            Importa tu información de GitHub y LinkedIn para optimizar tus postulaciones
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center ${step === 'github' ? 'text-blue-600' : 'text-green-600'}`}>
              <Github className="w-6 h-6" />
              <span className="ml-2 font-medium">GitHub</span>
            </div>
            <div className="w-24 h-1 bg-gray-300 mx-4">
              <div
                className={`h-full bg-blue-600 transition-all duration-500 ${
                  step !== 'github' ? 'w-full' : 'w-0'
                }`}
              />
            </div>
            <div className={`flex items-center ${step === 'linkedin' ? 'text-blue-600' : step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <Linkedin className="w-6 h-6" />
              <span className="ml-2 font-medium">LinkedIn</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'github' && (
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-gray-900 p-3 rounded-lg">
                  <Github className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Conectar GitHub
                  </h2>
                  <p className="text-gray-600">
                    Sincroniza tus repositorios y proyectos
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de usuario de GitHub
                  </label>
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="tu-usuario"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Ej: si tu perfil es github.com/johndoe, ingresa "johndoe"
                  </p>
                </div>

                <button
                  onClick={handleGitHubSync}
                  disabled={!githubUsername || loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Sincronizando...
                    </>
                  ) : (
                    'Sincronizar GitHub'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'linkedin' && (
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-blue-700 p-3 rounded-lg">
                  <Linkedin className="w-8 h-8 text-white" />
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Información de LinkedIn
                  </h2>
                  <p className="text-gray-600">
                    Ingresa tu experiencia laboral y habilidades
                  </p>
                </div>
              </div>

              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={linkedinData.fullName}
                      onChange={(e) =>
                        setLinkedinData({ ...linkedinData, fullName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      value={linkedinData.location}
                      onChange={(e) =>
                        setLinkedinData({ ...linkedinData, location: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de LinkedIn
                  </label>
                  <input
                    type="url"
                    value={linkedinData.linkedinUrl}
                    onChange={(e) =>
                      setLinkedinData({ ...linkedinData, linkedinUrl: e.target.value })
                    }
                    placeholder="https://linkedin.com/in/tu-perfil"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resumen profesional
                  </label>
                  <textarea
                    value={linkedinData.bio}
                    onChange={(e) => setLinkedinData({ ...linkedinData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Experiencia laboral
                    </label>
                    <button
                      onClick={addExperience}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Agregar experiencia
                    </button>
                  </div>

                  {linkedinData.experiences.map((exp, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 mb-3">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900">Experiencia {index + 1}</h4>
                        <button
                          onClick={() => removeExperience(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Empresa"
                          value={exp.company}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Cargo"
                          value={exp.position}
                          onChange={(e) => updateExperience(index, 'position', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>

                      <textarea
                        placeholder="Descripción"
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="date"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <input
                          type="date"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                          disabled={exp.isCurrent}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                        />
                      </div>

                      <label className="flex items-center mt-3">
                        <input
                          type="checkbox"
                          checked={exp.isCurrent}
                          onChange={(e) => updateExperience(index, 'isCurrent', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Trabajo actual</span>
                      </label>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Habilidades (separadas por comas)
                  </label>
                  <textarea
                    value={linkedinData.skills}
                    onChange={(e) =>
                      setLinkedinData({ ...linkedinData, skills: e.target.value })
                    }
                    placeholder="JavaScript, React, Node.js, Python, SQL"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('github')}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Atrás
                  </button>
                  <button
                    onClick={handleLinkedInImport}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Guardando...
                      </>
                    ) : (
                      'Completar Configuración'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
