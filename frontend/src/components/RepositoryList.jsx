import React from 'react';

const RepositoryList = ({ repositories, isSyncing, onSync }) => {
  return (
    <div className="lg:col-span-5 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col h-[550px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">1. Data Source</h2>
          <p className="text-xs text-gray-500 mt-1">Verified GitHub Contributions</p>
        </div>
        <button 
          onClick={onSync} 
          disabled={isSyncing}
          className={`px-4 py-2 text-sm rounded-xl font-bold text-white transition-all shadow-sm
            ${isSyncing ? 'bg-zinc-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
        >
          {isSyncing ? 'Syncing...' : 'Sync Data'}
        </button>
      </div>

      <div className="overflow-y-auto flex-1 pr-2 space-y-4 custom-scrollbar">
        {repositories.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <p className="text-gray-500 text-sm font-medium">No data synced yet.</p>
          </div>
        ) : (
          repositories.map((repo) => (
            <div key={repo.name} className="border border-gray-100 p-4 rounded-2xl bg-gray-50 hover:border-blue-200 transition-colors">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-900 text-sm truncate">{repo.name}</h3>
                <span className="text-xs font-bold text-yellow-700 bg-yellow-100 border border-yellow-200 px-2 py-0.5 rounded-full">⭐ {repo.stars}</span>
              </div>
              <p className="text-xs text-gray-500 truncate font-medium">Tech: <span className="text-gray-700">{repo.primaryLanguage || 'Mixed'}</span></p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RepositoryList;