import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
        
        if (response.data.githubData && response.data.githubData.repositories) {
          setRepositories(response.data.githubData.repositories);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        window.location.href = '/'; 
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await api.get('/github/sync');
      setRepositories(response.data.repositories);
    } catch (error) {
      console.error('Failed to sync repos:', error);
      alert('Failed to sync repositories. Check console for details.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-600 animate-pulse">Loading your workspace...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6">
            <img 
              src={user.avatarUrl} 
              alt="GitHub Avatar" 
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.username}!</h1>
              <div className="mt-2 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-gray-500">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  ID: {user.githubId}
                </span>
                <span className="text-sm">Protected Workspace</span>
              </div>
            </div>
          </div>
        </div>

        {/* Repositories Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Repositories</h2>
              <p className="text-gray-500 text-sm mt-1">Select repositories to include in your AI resume analysis.</p>
            </div>
            
            <button 
              onClick={handleSync} 
              disabled={isSyncing}
              className={`px-6 py-2.5 rounded-lg font-semibold text-white transition-all shadow-sm
                ${isSyncing 
                  ? 'bg-zinc-400 cursor-not-allowed' 
                  : 'bg-zinc-900 hover:bg-zinc-800 hover:shadow-md active:scale-95'
                }`}
            >
              {isSyncing ? 'Syncing from GitHub...' : 'Sync Data'}
            </button>
          </div>

          {/* Repository Grid */}
          {repositories.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <p className="text-gray-500 italic">No repositories synced yet. Click the button above to pull your data.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {repositories.map((repo) => (
                <div 
                  key={repo.name} 
                  className="group flex flex-col justify-between border border-gray-200 p-6 rounded-xl bg-white hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        <a href={repo.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {repo.name}
                        </a>
                      </h3>
                      <span className="flex items-center gap-1 bg-yellow-50 text-yellow-700 text-xs font-bold px-2.5 py-1 rounded-full border border-yellow-200">
                        ⭐ {repo.stars}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {repo.description}
                    </p>
                  </div>
                  
                  <div className="mt-6">
                    {repo.primaryLanguage ? (
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-100">
                        {repo.primaryLanguage}
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md text-xs font-semibold">
                        Mixed/None
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;