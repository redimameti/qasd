
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Goal, MeasurementValue, MeasurementConfig } from '../types';
import { BarChart3, TrendingUp, Target as TargetIcon, Crosshair } from 'lucide-react';
import { rawColors } from '../lib/styles';

interface MeasurementsProps {
  goals: Goal[];
  measurements: MeasurementValue[];
  onUpdateMeasurement: (goalId: string, configId: string, weekNum: number, value: number) => void;
}

export const Measurements: React.FC<MeasurementsProps> = ({ goals, measurements, onUpdateMeasurement }) => {
  const allConfigs = useMemo(() => {
    return goals.flatMap(g => g.measurementConfigs.map(c => ({ ...c, goalId: g.id, goalName: g.name })));
  }, [goals]);

  const formatWithUnit = (val: number | string, unit: string) => {
    if (val === null || val === undefined || val === '') {
      return '—';
    }
    const num = typeof val === 'number' ? val : Number(val);
    if (['$', '€', '£', '¥'].includes(unit)) {
      return `${unit}${num}`;
    }
    return unit ? `${num} ${unit}` : `${num}`;
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Performance Measurements</h2>
          <p className="text-sm text-[var(--text-muted)]">Aggregated KPIs and goal progression across the 12-week cycle.</p>
        </div>
        <div className="flex items-center gap-2 bg-[var(--card)] px-4 py-2 rounded-xl border border-[var(--border)]">
          <BarChart3 size={16} className="text-[var(--primary)]" />
          <span className="text-xs font-bold text-[var(--text-main)] uppercase tracking-widest">Active Cycle Metrics</span>
        </div>
      </div>

      {allConfigs.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-[var(--card)] rounded-full flex items-center justify-center text-[var(--border)]">
            <Crosshair size={32} />
          </div>
          <div className="max-w-xs space-y-2">
            <h3 className="font-bold">No measurements defined</h3>
            <p className="text-sm text-[var(--text-muted)]">Go to the "Plan" section to define KPIs for each of your goals.</p>
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
              <div key={config.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-6 group hover:border-[var(--primary)]/30 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--primary)] tracking-widest mb-1 block">{config.goalName}</span>
                    <h3 className="text-xl font-bold">{config.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-mono font-bold text-[var(--text-main)]">{currentVal}</div>
                    <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-tighter">{config.unit}</div>
                  </div>
                </div>

                <div className="h-48 w-full bg-[var(--background)] rounded-xl p-4 border border-[var(--border)]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--card)" vertical={false} />
                      <XAxis 
                        dataKey="week" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: rawColors.textFaint, fontSize: 9, dy: 10}} 
                        interval={0}
                        height={30}
                        padding={{ left: 10, right: 10 }}
                      />
                      <YAxis hide domain={['auto', 'auto']} />
                      <Tooltip
                        content={({ active, label, payload }) => {
                          if (!active || !payload || payload.length === 0) return null;
                          const value = payload[0].value as number | string;
                          return (
                            <div className="bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2">
                              <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">
                                Week {label}
                              </div>
                              <div className="text-sm font-bold text-[var(--text-main)]">
                                {formatWithUnit(value, config.unit)}
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="val" 
                        stroke="var(--primary)" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: 'var(--text-main)' }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {hasTarget ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                      <span>Target Progression</span>
                      <span>{Math.round(progress)}% of {config.target} {config.unit}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--background)] rounded-full overflow-hidden border border-[var(--border)]">
                      <div 
                        className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] transition-all duration-1000" 
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 flex items-center gap-2 text-[var(--text-muted)]">
                    <TrendingUp size={12} className="text-[var(--secondary)]" />
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
