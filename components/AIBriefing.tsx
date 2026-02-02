
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Loader2, Play, ChevronDown, ChevronUp } from 'lucide-react';
import { Tactic, Goal } from '../types';

interface AIBriefingProps {
  weeklyScore: number;
  overallProgress: number;
  tactics: Tactic[];
  goals: Goal[];
  week: number;
}

export const AIBriefing: React.FC<AIBriefingProps> = ({ weeklyScore, overallProgress, tactics, goals, week }) => {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const generateBriefing = async () => {
    setLoading(true);
    setIsExpanded(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        You are 'Juhd AI', a high-performance executive coach for Muslim Entrepreneurs. 
        Analyze this user's current 12-Week Year performance:
        - Current Week: ${week}
        - Current Week Score: ${weeklyScore}%
        - Overall 12-Week Progress: ${overallProgress}%
        - Goals: ${goals.map(g => g.name).join(', ')}
        
        Provide a "Tactical Briefing" that is:
        1. High-energy and ADHD-friendly (concise, punchy).
        2. Incorporates one Islamic concept of excellence (Ihsan) or consistency (Istiqamah).
        3. Gives one specific piece of advice for the user to improve their score.
        Keep it under 150 words. Use Markdown for bolding.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setBriefing(response.text || "Could not generate briefing. Keep pushing!");
    } catch (err) {
      console.error(err);
      setBriefing("Error reaching the AI service. Your effort is still seen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden transition-all duration-300">
      <div 
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center text-[var(--primary)]">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest">Tactical AI Briefing</h3>
            {briefing && !isExpanded && <p className="text-[10px] text-[var(--text-muted)] truncate max-w-md">Insight generated for Week {week}...</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {!briefing && !loading && (
            <button 
              onClick={(e) => { e.stopPropagation(); generateBriefing(); }}
              className="text-[10px] font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1 rounded-full border border-[var(--primary)]/20 hover:bg-[var(--primary)]/20 transition-all flex items-center gap-1.5"
            >
              <Play size={10} fill="currentColor" /> Analyze Performance
            </button>
          )}
          {isExpanded ? <ChevronUp size={16} className="text-[var(--text-muted)]/60" /> : <ChevronDown size={16} className="text-[var(--text-muted)]/60" />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 border-t border-[var(--border)] mt-2">
              <Loader2 className="animate-spin text-[var(--primary)]" size={24} />
              <p className="text-[10px] text-[var(--text-muted)] animate-pulse font-mono uppercase tracking-widest">Crunching execution data...</p>
            </div>
          ) : briefing ? (
            <div className="space-y-4 border-t border-[var(--border)] pt-4 mt-2">
              <div className="text-sm leading-relaxed text-[var(--text-main)] font-medium whitespace-pre-wrap">
                {briefing}
              </div>
              <div className="flex gap-4">
                 <button 
                  onClick={() => { setBriefing(null); setIsExpanded(false); }}
                  className="text-[10px] uppercase font-bold text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                  Clear Insight
                </button>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center border-t border-[var(--border)] mt-2">
              <p className="text-xs text-[var(--text-muted)]">Ready to optimize your sprint? Click "Analyze Performance" to get high-level executive insights tailored to your execution score.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
