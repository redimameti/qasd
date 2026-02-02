
import React, { useMemo, useState, useEffect } from 'react';
import { Check, TrendingUp, Calendar, Zap, CornerUpLeft, Settings2, GripVertical, BarChart3, Grip, ExternalLink, Target, Anchor } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Goal, Tactic, Cycle, MeasurementValue, MeasurementConfig } from '../types';
import { calculateTacticScore, calculateWeeklyScore, calculateOverallProgress } from '../lib/scoring';
import { DAYS_SHORT } from '../constants';
import { AIBriefing } from './AIBriefing';
import { rawColors } from '../lib/styles';

interface DashboardProps {
  goals: Goal[];
  tactics: Tactic[];
  measurements: MeasurementValue[];
  cycle: Cycle;
  viewWeek: number;
  vision: { longTerm: string; shortTerm: string };
  onUpdateTactic: (tacticId: string, weekNum: number, update: any) => void;
  onUpdateMeasurement: (goalId: string, configId: string, weekNum: number, value: number) => void;
  onSetWeek: (week: number) => void;
  onEditPlan: () => void;
  onEditVision: () => void;
  onReorderGoals: (newGoals: Goal[]) => void;
  onReorderTactics: (newTactics: Tactic[]) => void;
  showResetSuccess?: boolean;
}

const MeasurementGraph: React.FC<{
  config: MeasurementConfig;
  goalId: string;
  weekNum: number;
  data: MeasurementValue[];
  onUpdate: (val: number) => void;
}> = ({ config, goalId, weekNum, data, onUpdate }) => {
  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const w = i + 1;
      const m = (data || []).find(v => v && v.configId === config?.id && v.weekNum === w);
      return {
        week: w,
        value: m ? m.value : null
      };
    });
  }, [config?.id, data]);

  const existingValue = useMemo(() => {
    return (data || []).find(v => v && v.configId === config?.id && v.weekNum === weekNum);
  }, [data, config?.id, weekNum]);

  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (existingValue) {
      setInputValue(existingValue.value.toString());
    } else {
      setInputValue('');
    }
  }, [existingValue, weekNum]);

  const handleBlur = () => {
    const parsed = parseFloat(inputValue);
    if (inputValue === '') {
      onUpdate(0);
    } else {
      onUpdate(isNaN(parsed) ? 0 : parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const formatWithUnit = (val: number | string) => {
    const unit = config.unit || '';
    if (val === null || val === undefined || val === '') {
      return '—';
    }
    const num = typeof val === 'number' ? val : Number(val);
    if (['$', '€', '£', '¥'].includes(unit)) {
      return `${unit}${num}`;
    }
    return unit ? `${num} ${unit}` : `${num}`;
  };

  if (!config) return null;

  return (
    <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
         <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1.5">
           <BarChart3 size={12} className="text-[var(--secondary)]" /> {config.name}
         </span>
         <span className="text-xl font-bold mono">
           {existingValue ? existingValue.value : 0} 
           <span className="text-[10px] text-[var(--text-muted)] font-normal ml-1">{config.unit}</span>
         </span>
      </div>

      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="week" 
              hide={false} 
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
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2">
                    <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-widest">
                      Week {label}
                    </div>
                    <div className="text-sm font-bold text-[var(--text-main)]">
                      {formatWithUnit(value)}
                    </div>
                  </div>
                );
              }}
              cursor={{ stroke: 'var(--border)', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="var(--secondary)" 
              strokeWidth={2} 
              dot={{ r: 3, fill: 'var(--secondary)', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: 'var(--text-main)' }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="border-t border-[var(--border)] pt-3">
        <div className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-bold uppercase">
          Enter {config.name.toLowerCase()} for Week {weekNum}
        </div>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onWheel={(e) => e.currentTarget.blur()}
          className="w-full bg-transparent border-none focus:outline-none text-lg font-mono placeholder:text-[var(--border)] mt-1"
          placeholder="0"
        />
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({
  goals, tactics, measurements, cycle, viewWeek, vision, onUpdateTactic, onUpdateMeasurement, onSetWeek, onEditPlan, onEditVision, onReorderGoals, onReorderTactics, showResetSuccess
}) => {
  const weeklyScore = calculateWeeklyScore(tactics, viewWeek);
  const overallProgress = calculateOverallProgress(tactics, viewWeek);
  const [draggedGoalIdx, setDraggedGoalIdx] = useState<number | null>(null);
  const [draggedTacticId, setDraggedTacticId] = useState<string | null>(null);

  const actualWeek = useMemo(() => {
    const start = new Date(cycle.startDate);
    const diff = Date.now() - start.getTime();
    const weeks = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
    return Math.min(Math.max(weeks, 1), 12);
  }, [cycle.startDate]);

  const lastWeeklyScore = viewWeek > 1 ? calculateWeeklyScore(tactics, viewWeek - 1) : null;
  const isViewingCurrentWeek = viewWeek === actualWeek;

  const handleGoalDragStart = (e: React.DragEvent, index: number) => {
    setDraggedGoalIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    const card = (e.currentTarget as HTMLElement).closest('[data-drag-card]') as HTMLElement | null;
    const dragImage = card ?? (e.currentTarget as HTMLElement);
    const rect = dragImage.getBoundingClientRect();
    e.dataTransfer.setDragImage(dragImage, rect.width / 2, 20);
  };

  const handleGoalDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const scrollContainer = document.querySelector('main');
    if (scrollContainer) {
      const rect = scrollContainer.getBoundingClientRect();
      const threshold = 80;
      if (e.clientY - rect.top < threshold) {
        scrollContainer.scrollBy({ top: -12, behavior: 'auto' });
      } else if (rect.bottom - e.clientY < threshold) {
        scrollContainer.scrollBy({ top: 12, behavior: 'auto' });
      }
    }
    if (draggedGoalIdx === null || draggedGoalIdx === index) return;
    const newGoals = [...goals];
    const item = newGoals[draggedGoalIdx];
    newGoals.splice(draggedGoalIdx, 1);
    newGoals.splice(index, 0, item);
    onReorderGoals(newGoals);
    setDraggedGoalIdx(index);
  };

  const handleTacticDragStart = (e: React.DragEvent, tacticId: string) => {
    setDraggedTacticId(tacticId);
    e.dataTransfer.effectAllowed = 'move';
    const card = (e.currentTarget as HTMLElement).closest('[data-drag-card]') as HTMLElement | null;
    const dragImage = card ?? (e.currentTarget as HTMLElement);
    const rect = dragImage.getBoundingClientRect();
    e.dataTransfer.setDragImage(dragImage, rect.width / 2, 20);
  };

  const handleTacticDragOver = (e: React.DragEvent, targetId: string, goalId: string) => {
    e.preventDefault();
    const scrollContainer = document.querySelector('main');
    if (scrollContainer) {
      const rect = scrollContainer.getBoundingClientRect();
      const threshold = 80;
      if (e.clientY - rect.top < threshold) {
        scrollContainer.scrollBy({ top: -12, behavior: 'auto' });
      } else if (rect.bottom - e.clientY < threshold) {
        scrollContainer.scrollBy({ top: 12, behavior: 'auto' });
      }
    }
    if (!draggedTacticId || draggedTacticId === targetId) return;
    const draggedTactic = tactics.find(t => t.id === draggedTacticId);
    if (!draggedTactic || draggedTactic.goalId !== goalId) return;
    const newTactics = [...tactics];
    const fromIdx = newTactics.findIndex(t => t.id === draggedTacticId);
    const toIdx = newTactics.findIndex(t => t.id === targetId);
    if (fromIdx !== -1 && toIdx !== -1) {
      const item = newTactics[fromIdx];
      newTactics.splice(fromIdx, 1);
      newTactics.splice(toIdx, 0, item);
      onReorderTactics(newTactics);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Primary Summary Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-widest">Weekly Execution</span>
            <Zap size={14} className="text-[var(--primary)]" />
          </div>
          <div className="grid grid-cols-2 items-center">
            <div className="flex flex-col pr-4 border-r border-[var(--border)]">
              <span className="text-3xl font-bold mono text-[var(--text-main)]">
                {lastWeeklyScore !== null ? `${Math.round(lastWeeklyScore)}%` : '--'}
              </span>
              <div className="h-[2px] w-full bg-[var(--border)] mt-1 mb-2 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--text-muted)]/20" style={{ width: lastWeeklyScore !== null ? `${lastWeeklyScore}%` : '0%' }}></div>
              </div>
              <span className="text-[9px] uppercase text-[var(--text-muted)] font-bold tracking-tight">Last Week</span>
            </div>
            <div className="flex flex-col pl-4">
              <span className="text-3xl font-bold mono text-[var(--primary)]">
                {Math.round(weeklyScore)}%
              </span>
              <div className="h-[2px] w-full bg-[var(--border)] mt-1 mb-2 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--primary)] transition-all duration-700" style={{ width: `${weeklyScore}%` }}></div>
              </div>
              <span className="text-[9px] uppercase text-[var(--text-muted)] font-bold tracking-tight">Current</span>
            </div>
          </div>
        </div>
        
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-widest">12-Week Progress</span>
            <TrendingUp size={16} className="text-[var(--secondary)]" />
          </div>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold mono">{Math.round(overallProgress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--primary)] transition-all duration-1000" style={{ width: `${overallProgress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-widest">Cycle Status</span>
            <Calendar size={16} className="text-[var(--accent)]" />
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col">
              <span className="text-3xl font-bold mono">Week {viewWeek}</span>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
                {isViewingCurrentWeek ? "Current Week" : "Reviewing Progress"}
              </span>
            </div>
            {!isViewingCurrentWeek && (
              <button 
                onClick={() => onSetWeek(actualWeek)} 
                className="flex items-center gap-2 px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[10px] font-bold text-[var(--primary)] hover:bg-[var(--primary)] hover:text-black transition-all shadow-sm shadow-[var(--primary)]/10"
              >
                <CornerUpLeft size={12} strokeWidth={3} /> Current Week
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Vision Inline Card (Mobile/Tablet Only) - Persistent for accessibility */}
      <div className="lg:hidden bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-widest">Vision Snapshot</span>
          <button onClick={onEditVision} className="text-[var(--primary)] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
            Edit <ExternalLink size={10} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-1">
             <span className="text-[9px] font-bold text-[var(--accent)] uppercase">36-Month</span>
             <p className="text-[11px] text-[var(--text-main)] line-clamp-2 italic opacity-60 leading-tight">
               {vision.shortTerm || "No strategic vision set..."}
             </p>
           </div>
           <div className="space-y-1">
             <span className="text-[9px] font-bold text-[var(--secondary)] uppercase">Legacy</span>
             <p className="text-[11px] text-[var(--text-main)] line-clamp-2 italic opacity-60 leading-tight">
               {vision.longTerm || "No legacy defined..."}
             </p>
           </div>
        </div>
      </div>

      <AIBriefing 
        week={viewWeek} 
        weeklyScore={weeklyScore} 
        overallProgress={overallProgress} 
        tactics={tactics} 
        goals={goals} 
      />

      {/* Execution Board */}
      <section className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[var(--border-muted)]">
          <div className="flex items-center gap-4 min-w-0">
            <h2 className="text-2xl font-bold uppercase tracking-tight whitespace-nowrap">Execution</h2>
            <button 
              onClick={onEditPlan} 
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all text-[11px] font-bold uppercase tracking-widest shrink-0 whitespace-nowrap flex-nowrap"
            >
              <Settings2 size={14} className="shrink-0" /> 
              <span>Edit Plan</span>
            </button>
          </div>
          
          <div className="flex items-center gap-1.5 bg-[var(--card)] border border-[var(--border)] rounded-xl p-1.5 overflow-x-auto no-scrollbar">
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => (
              <button
                key={w}
                onClick={() => onSetWeek(w)}
                className={`w-10 h-10 shrink-0 rounded-lg text-xs font-mono font-bold transition-all relative flex items-center justify-center ${
                  viewWeek === w
                    ? 'bg-[var(--primary)] text-black shadow-lg shadow-[var(--primary-glow)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5'
                }`}
              >
                {w}
                {w === actualWeek && viewWeek !== actualWeek && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[var(--primary)] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-6">
        {goals?.map((goal, gIdx) => {
          const goalTactics = tactics?.filter(t => t.goalId === goal.id && t.assignedWeeks?.includes(viewWeek)) || [];
          
          return (
            <div 
              key={goal.id} 
              className={`bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${draggedGoalIdx === gIdx ? 'opacity-40 border-dashed border-[var(--primary)] scale-[0.98]' : 'opacity-100'}`}
              data-drag-card="goal"
              onDragOver={(e) => handleGoalDragOver(e, gIdx)}
              onDragEnd={() => setDraggedGoalIdx(null)}
            >
              <div className="p-4 md:p-6 border-b border-[var(--border)] bg-[var(--card)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div 
                    className="cursor-grab active:cursor-grabbing p-1.5 text-[var(--border)] hover:text-[var(--primary)] transition-colors shrink-0"
                    draggable
                    onDragStart={(e) => handleGoalDragStart(e, gIdx)}
                  >
                    <Grip size={18} strokeWidth={2.5} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold truncate tracking-tight">{goal.name}</h3>
                    <p className="text-sm text-[var(--text-muted)] line-clamp-1 opacity-60 font-medium">{goal.description}</p>
                  </div>
                </div>
              </div>

              <div className="p-0">
                {goalTactics.map(tactic => (
                  <div 
                    key={tactic.id} 
                    className={`min-h-[80px] p-4 md:px-6 md:py-4 border-b border-[var(--border)] last:border-0 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.01] transition-all group ${draggedTacticId === tactic.id ? 'opacity-40 border-dashed border-[var(--primary)]' : 'opacity-100'}`}
                    data-drag-card="tactic"
                    onDragOver={(e) => handleTacticDragOver(e, tactic.id, goal.id)}
                    onDragEnd={() => setDraggedTacticId(null)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div 
                        className="cursor-grab active:cursor-grabbing p-1 text-[var(--border)] group-hover:text-[var(--text-muted)] transition-colors shrink-0"
                        draggable
                        onDragStart={(e) => handleTacticDragStart(e, tactic.id)}
                      >
                        <GripVertical size={16} />
                      </div>
                      <span className={`text-sm font-semibold tracking-tight ${calculateTacticScore(tactic, viewWeek) === 100 ? 'text-[var(--primary)] line-through opacity-40' : 'text-[var(--text-main)]'}`}>
                        {tactic.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 md:py-0 shrink-0">
                      {tactic.type === 'daily' ? (
                        <div className="flex items-center gap-1.5">
                          {DAYS_SHORT.map((day, idx) => {
                            const completions = (tactic.completions?.[viewWeek] as boolean[]) || [false, false, false, false, false, false, false];
                            const isCompleted = completions[idx];
                            return (
                              <button 
                                key={idx} 
                                onClick={() => {
                                  const next = [...completions];
                                  next[idx] = !next[idx];
                                  onUpdateTactic(tactic.id, viewWeek, next);
                                }} 
                                className={`flex flex-col items-center justify-between w-[42px] h-[52px] rounded-xl border transition-all shrink-0 py-2.5 ${isCompleted ? 'bg-[var(--primary)] border-[var(--primary)] text-black shadow-lg shadow-[var(--primary)]/15' : 'bg-[var(--background)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]/50'}`}
                              >
                                <div className="h-3 flex items-center justify-center">
                                  <span className="text-[10px] uppercase font-bold leading-none tracking-tighter">{day}</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center pt-0.5">
                                  {isCompleted ? <Check size={14} strokeWidth={3.5} /> : <div className="w-3.5 h-3.5 rounded-full border border-dashed border-[var(--border)]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <button 
                          onClick={() => onUpdateTactic(tactic.id, viewWeek, !tactic.completions?.[viewWeek])} 
                          className={`flex items-center justify-center w-full md:w-auto px-8 h-[52px] rounded-xl border transition-all ${tactic.completions?.[viewWeek] ? 'bg-[var(--primary)] border-[var(--primary)] text-black font-bold' : 'bg-[var(--background)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]/50'}`}
                        >
                          {tactic.completions?.[viewWeek] ? <div className="flex items-center gap-2"><Check size={18} strokeWidth={3.5} /> Completed</div> : 'Mark Complete'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {goal.measurementConfigs?.length > 0 && (
                <div className="bg-[var(--card)] border-t border-[var(--border)] p-4 md:p-6">
                   <div className="flex items-center gap-2 mb-6">
                      <BarChart3 size={14} className="text-[var(--secondary)]" />
                      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Measurements</span>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {goal.measurementConfigs.map(config => (
                        <MeasurementGraph 
                          key={config.id}
                          config={config}
                          goalId={goal.id}
                          weekNum={viewWeek}
                          data={measurements}
                          onUpdate={(val) => onUpdateMeasurement(goal.id, config.id, viewWeek, val)}
                        />
                      ))}
                   </div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      </section>

      {/* Success Toast */}
      {showResetSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-[var(--primary)] text-black px-6 py-3 rounded-xl font-bold shadow-2xl shadow-[var(--primary)]/20 flex items-center gap-2">
            <div className="w-5 h-5 bg-black/10 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            Plan dates reset to Week 1.
          </div>
        </div>
      )}
    </div>
  );
};
