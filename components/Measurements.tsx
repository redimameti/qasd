
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Goal, MeasurementValue, MeasurementConfig } from '../types';
import { BarChart3, TrendingUp, Target as TargetIcon, Crosshair } from 'lucide-react';

interface MeasurementsProps {
  goals: Goal[];
  measurements: MeasurementValue[];
  onUpdateMeasurement: (goalId: string, configId: string, weekNum: number, value: number) => void;
}

export const Measurements: React.FC<MeasurementsProps> = ({ goals, measurements, onUpdateMeasurement }) => {
  const allConfigs = useMemo(() => {
    return goals.flatMap(g => g.measurementConfigs.map(c => ({ ...c, goalId: g.id, goalName: g.name })));
  }, [goals]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Performance Measurements</h2>
          <p className="text-sm text-[#A3A3A3]">Aggregated KPIs and goal progression across the 12-week cycle.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#161616] px-4 py-2 rounded-xl border border-[#262626]">
          <BarChart3 size={16} className="text-[#10B981]" />
          <span className="text-xs font-bold text-[#FAFAFA] uppercase tracking-widest">Active Cycle Metrics</span>
        </div>
      </div>

      {allConfigs.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-[#161616] rounded-full flex items-center justify-center text-[#262626]">
            <Crosshair size={32} />
          </div>
          <div className="max-w-xs space-y-2">
            <h3 className="font-bold">No measurements defined</h3>
            <p className="text-sm text-[#A3A3A3]">Go to the "Plan" section to define KPIs for each of your goals.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {allConfigs.map(config => {
            const chartData = Array.from({ length: 12 }, (_, i) => {
              const w = i + 1;
              const val = measurements.find(m => m.configId === config.id && m.weekNum === w)?.value || null;
              return { week: w, val };
            });

            const sortedValues = [...measurements].filter(m => m.configId === config.id).sort((a,b) => b.weekNum - a.weekNum);
            const currentVal = sortedValues[0]?.value || 0;
            const hasTarget = config.target > 0;
            const progress = hasTarget ? (currentVal / config.target) * 100 : 0;

            return (
              <div key={config.id} className="bg-[#161616] border border-[#262626] rounded-2xl p-6 space-y-6 group hover:border-[#10B981]/30 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#10B981] tracking-widest mb-1 block">{config.goalName}</span>
                    <h3 className="text-xl font-bold">{config.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-[#FAFAFA]">{currentVal}</div>
                    <div className="text-[10px] text-[#A3A3A3] uppercase font-bold tracking-tighter">Current Value ({config.unit})</div>
                  </div>
                </div>

                <div className="h-48 w-full bg-[#0B0B0B] rounded-xl p-4 border border-[#262626]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#161616" vertical={false} />
                      <XAxis 
                        dataKey="week" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#404040', fontSize: 9, dy: 10}} 
                        interval={0}
                        height={30}
                        padding={{ left: 10, right: 10 }}
                      />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip 
                        contentStyle={{backgroundColor: '#0B0B0B', border: '1px solid #262626', borderRadius: '8px'}}
                        labelStyle={{color: '#A3A3A3', fontSize: '10px'}}
                        itemStyle={{color: '#FAFAFA', fontWeight: 'bold'}}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="val" 
                        stroke="#10B981" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#FAFAFA' }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {hasTarget ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[#A3A3A3]">
                      <span>Target Progression</span>
                      <span>{Math.round(progress)}% of {config.target} {config.unit}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#0B0B0B] rounded-full overflow-hidden border border-[#262626]">
                      <div 
                        className="h-full bg-gradient-to-r from-[#10B981] to-[#0EA5E9] transition-all duration-1000" 
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 flex items-center gap-2 text-[#A3A3A3]">
                    <TrendingUp size={12} className="text-[#0EA5E9]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Trend Monitoring Only</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
