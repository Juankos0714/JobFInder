import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ProfileSetup } from './ProfileSetup';
import { JobList } from './JobList';
import { JobMatches } from './JobMatches';
import { AddJobModal } from './AddJobModal';
import { LogOut, Briefcase, TrendingUp, Plus } from 'lucide-react';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'matches'>('jobs');
  const [showAddJob, setShowAddJob] = useState(false);

  useEffect(() => {
    checkProfile();
  }, [user]);

  const checkProfile = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('github_username')
      .eq('id', user.id)
      .maybeSingle();

    setHasProfile(!!profile?.github_username);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!hasProfile) {
    return <ProfileSetup onComplete={() => setHasProfile(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Job Optimizer</span>
            </div>

            <button
              onClick={signOut}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Salir
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus postulaciones y encuentra las mejores oportunidades
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`flex items-center px-6 py-4 font-medium transition-colors ${
                  activeTab === 'jobs'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Briefcase className="w-5 h-5 mr-2" />
                Ofertas Laborales
              </button>
              <button
                onClick={() => setActiveTab('matches')}
                className={`flex items-center px-6 py-4 font-medium transition-colors ${
                  activeTab === 'matches'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Análisis de Compatibilidad
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'jobs' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Mis Ofertas Laborales
                  </h2>
                  <button
                    onClick={() => setShowAddJob(true)}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Agregar Oferta
                  </button>
                </div>
                <JobList />
              </div>
            )}

            {activeTab === 'matches' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Análisis de Compatibilidad
                </h2>
                <JobMatches />
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddJob && <AddJobModal onClose={() => setShowAddJob(false)} />}
    </div>
  );
}
