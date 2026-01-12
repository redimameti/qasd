import React from 'react';
import { Compass, Anchor, Rocket, Milestone } from 'lucide-react';

interface VisionProps {
  vision: { longTerm: string; shortTerm: string };
  onUpdateVision: (updates: Partial<{ longTerm: string; shortTerm: string }>) => void;
}

export const Vision: React.FC<VisionProps> = ({ vision, onUpdateVision }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Legacy</h2>
        <p className="text-[#A3A3A3]">Without a clear vision, the 12-week year is just a treadmill. Connect your daily hustle to your ultimate destiny.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Long Term Aspirational Vision */}
        <div className="bg-[#161616] border border-[#262626] rounded-3xl p-8 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Compass size={120} />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-2xl flex items-center justify-center text-[#F59E0B]">
              <Anchor size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Long Term Aspirational Vision</h3>
              <p className="text-xs text-[#A3A3A3] uppercase font-bold tracking-widest">10-15 Year Horizon</p>
            </div>
          </div>
          <textarea
            className="w-full h-64 bg-[#0B0B0B] border border-[#262626] rounded-2xl p-6 focus:border-[#F59E0B] outline-none transition-all placeholder:text-[#262626] font-medium leading-relaxed resize-none"
            placeholder="Define the legacy you wish to leave. What is your 'End Game' in terms of Deen, lineage, wealth, and impact on the Ummah?"
            value={vision.longTerm}
            onChange={(e) => onUpdateVision({ longTerm: e.target.value })}
          />
        </div>

        {/* 3-Year Strategic Vision */}
        <div className="bg-[#161616] border border-[#262626] rounded-3xl p-8 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Milestone size={120} />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0EA5E9]/10 rounded-2xl flex items-center justify-center text-[#0EA5E9]">
              <Rocket size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">3-Year Strategic Vision</h3>
              <p className="text-xs text-[#A3A3A3] uppercase font-bold tracking-widest">36-Month Milestone</p>
            </div>
          </div>
          <textarea
            className="w-full h-64 bg-[#0B0B0B] border border-[#262626] rounded-2xl p-6 focus:border-[#0EA5E9] outline-none transition-all placeholder:text-[#262626] font-medium leading-relaxed resize-none"
            placeholder="Where will your business and personal growth be in 3 years? This is the major bridge between your 10-year legacy and your 12-week sprints. Define your revenue ceiling, team structure, and spiritual habits."
            value={vision.shortTerm}
            onChange={(e) => onUpdateVision({ shortTerm: e.target.value })}
          />
        </div>
      </div>

      <div className="bg-[#10B981]/5 border border-[#10B981]/10 rounded-2xl p-6 text-center italic text-[#10B981] text-sm">
        "Verily, actions are but by intentions (Niyyah), and every man shall have but that which he intended."
      </div>
    </div>
  );
};
