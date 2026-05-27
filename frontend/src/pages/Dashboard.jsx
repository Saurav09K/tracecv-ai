import React, { useEffect, useState, useRef } from 'react';
import api from '../api/axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [jobDescription, setJobDescription] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const outputEndRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
        if (response.data.githubData && response.data.githubData.repositories) {
          setRepositories(response.data.githubData.repositories);
        }
      } catch (error) {
        window.location.href = '/'; 
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiOutput]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await api.get('/github/sync');
      setRepositories(response.data.repositories);
    } catch (error) {
      alert('Failed to sync repositories.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return alert("Please paste a job description first.");
    
    setIsGenerating(true);
    setAiOutput(''); 

    try {
      const response = await fetch('http://localhost:5000/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
        body: JSON.stringify({ jobDescription }),
      });

      if (!response.ok) throw new Error('Failed to connect to AI engine');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break; 

        const chunkText = decoder.decode(value, { stream: true });
        const lines = chunkText.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') {
              setIsGenerating(false);
              return;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                setAiOutput((prev) => prev + parsed.text);
              }
            } catch (err) { continue; }
          }
        }
      }
    } catch (error) {
      setAiOutput((prev) => prev + '\n\n[System Error: Connection dropped mid-stream]');
    } finally {
      setIsGenerating(false);
    }
  };

  // --- THE EXPLAINABLE AI PARSER ---
  // This function takes the raw streaming text and converts it into interactive UI
  const renderExplainableAI = (text) => {
    // Split the text into blocks based on the "---" divider we forced the AI to use
    const blocks = text.split('---');

    return blocks.map((block, index) => {
      if (!block.trim()) return null;

      // Use regex to extract the text between the tags
      const bulletMatch = block.match(/\[BULLET\]([\s\S]*?)\[TRACE\]/);
      const traceMatch = block.match(/\[TRACE\]([\s\S]*)/);

      // If both tags are fully streamed and present, render the interactive card
      if (bulletMatch && traceMatch) {
        const bulletText = bulletMatch[1].trim();
        const traceText = traceMatch[1].trim();

        return (
          <div key={index} className="group relative mb-6 p-5 bg-zinc-900 rounded-xl border border-zinc-700 hover:border-blue-500 transition-all cursor-crosshair shadow-lg">
            
            {/* The Resume Bullet Point */}
            <div className="flex items-start gap-4">
              <span className="text-blue-500 mt-1 flex-shrink-0">✦</span>
              <p className="text-zinc-100 text-base leading-relaxed">{bulletText}</p>
            </div>

            {/* The Hidden Explainable Trace Tooltip (Reveals on Hover) */}
            <div className="absolute left-0 -bottom-3 translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 w-full pointer-events-none">
              <div className="bg-blue-950/95 border border-blue-800 text-blue-100 text-sm p-4 rounded-lg shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.577 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.577 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.577-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a3.75 3.75 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a3.75 3.75 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a3.75 3.75 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-blue-300 tracking-wide uppercase text-xs">AI Verification Trace</span>
                </div>
                <p className="leading-relaxed">{traceText}</p>
              </div>
            </div>
          </div>
        );
      } else {
        // If the block is incomplete (still streaming), render it as raw typing text
        return <span key={index} className="text-zinc-400 whitespace-pre-wrap">{block}</span>;
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-600 animate-pulse">Loading your workspace...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* --- Profile Header --- */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6">
            <img 
              src={user.avatarUrl} 
              alt="GitHub Avatar" 
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
            />
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back, {user.username}!</h1>
              <div className="mt-2 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-gray-500">
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold border border-gray-200">
                  ID: {user.githubId}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Data Sync & Strategy Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Repository Data (Takes up 5 columns) */}
          <div className="lg:col-span-5 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col h-[550px]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">1. Data Source</h2>
                <p className="text-xs text-gray-500 mt-1">Verified GitHub Contributions</p>
              </div>
              <button 
                onClick={handleSync} 
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

          {/* Right Column: AI Orchestration Input (Takes up 7 columns) */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col h-[550px]">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900">2. Target Job Description</h2>
              <p className="text-sm text-gray-500 mt-1">Paste the requirements. The AI will synthesize this with your synced code.</p>
            </div>
            
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="e.g., Seeking a developer with deep understanding of Node.js, asynchronous programming, and REST APIs..."
              className="flex-1 w-full p-5 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all resize-none outline-none text-sm text-gray-700 leading-relaxed font-medium"
            />

            <button 
              onClick={handleGenerate} 
              disabled={isGenerating || repositories.length === 0}
              className={`w-full mt-6 py-4 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2 text-base
                ${isGenerating || repositories.length === 0
                  ? 'bg-zinc-200 cursor-not-allowed text-zinc-400' 
                  : 'bg-zinc-900 hover:bg-zinc-800 active:scale-95 shadow-xl shadow-zinc-200'}`}
            >
              {isGenerating ? (
                <span className="animate-pulse flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Synthesizing Stream...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Generate Explainable Proof
                </>
              )}
            </button>
          </div>
        </div>

        {/* --- Output Terminal --- */}
        {(aiOutput || isGenerating) && (
          <div className="bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-800 overflow-visible mt-8">
            <div className="bg-zinc-900 border-b border-zinc-800 px-8 py-4 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 border border-red-600"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-600"></div>
                <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600"></div>
              </div>
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Gemini Orchestrator Active
              </span>
            </div>
            
            <div className="p-8 sm:p-10 max-h-[800px] overflow-y-auto">
              {/* This is where the magic happens. We pass the raw stream to our custom parser. */}
              {renderExplainableAI(aiOutput)}
              
              {isGenerating && (
                <span className="inline-block w-2.5 h-5 ml-1 bg-blue-500 animate-pulse rounded-sm align-middle"></span>
              )}
              <div ref={outputEndRef} className="h-4" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;