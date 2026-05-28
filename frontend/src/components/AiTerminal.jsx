import React, { useEffect, useRef } from 'react';

const AiTerminal = ({ aiOutput, isGenerating }) => {
  const outputEndRef = useRef(null);

  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiOutput]);

  if (!aiOutput && !isGenerating) return null;

  const renderExplainableAI = (text) => {
    const blocks = text.split('---');
    return blocks.map((block, index) => {
      if (!block.trim()) return null;

      const bulletMatch = block.match(/\[BULLET\]([\s\S]*?)\[TRACE\]/);
      const traceMatch = block.match(/\[TRACE\]([\s\S]*)/);

      if (bulletMatch && traceMatch) {
        return (
          <div key={index} className="group relative mb-6 p-5 bg-zinc-900 rounded-xl border border-zinc-700 hover:border-blue-500 transition-all cursor-crosshair shadow-lg">
            <div className="flex items-start gap-4">
              <span className="text-blue-500 mt-1 flex-shrink-0">✦</span>
              <p className="text-zinc-100 text-base leading-relaxed">{bulletMatch[1].trim()}</p>
            </div>
            <div className="absolute left-0 -bottom-3 translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 w-full pointer-events-none">
              <div className="bg-blue-950/95 border border-blue-800 text-blue-100 text-sm p-4 rounded-lg shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-blue-300 tracking-wide uppercase text-xs">AI Verification Trace</span>
                </div>
                <p className="leading-relaxed">{traceMatch[1].trim()}</p>
              </div>
            </div>
          </div>
        );
      }
      return <span key={index} className="text-zinc-400 whitespace-pre-wrap">{block}</span>;
    });
  };

  return (
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
        {renderExplainableAI(aiOutput)}
        {isGenerating && (
          <span className="inline-block w-2.5 h-5 ml-1 bg-blue-500 animate-pulse rounded-sm align-middle"></span>
        )}
        <div ref={outputEndRef} className="h-4" />
      </div>
    </div>
  );
};

export default AiTerminal;