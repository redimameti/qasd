
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Calendar, Target, ListTodo, ChevronDown, AlertTriangle, ArrowLeft, GripVertical, Ruler, Grip, BarChart3 } from 'lucide-react';
import { Goal, Tactic, MeasurementConfig } from '../types';

interface PlanningProps {
  goals: Goal[];
  tactics: Tactic[];
  onAddGoal: (goal: Partial<Goal>) => void;
  onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal: (id: string) => void;
  onAddTactic: (tactic: Partial<Tactic>) => void;
  onUpdateTacticMeta: (id: string, updates: Partial<Tactic>) => void;
  onDeleteTactic: (id: string) => void;
  onReorderGoals: (newGoals: Goal[]) => void;
  onReorderTactics: (newTactics: Tactic[]) => void;
  onFinish: () => void;
}

const TypeDropdown: React.FC<{ 
  value: 'daily' | 'weekly'; 
  onChange: (val: 'daily' | 'weekly') => void;
}> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative min-w-[110px]" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 bg-[#0B0B0B] border border-[#262626] px-3 py-1.5 text-xs font-bold text-[#A3A3A3] hover:text-[#FAFAFA] transition-all outline-none w-full justify-between ${
          isOpen ? 'rounded-t-lg border-b-[#161616]' : 'rounded-lg hover:border-[#10B981]/50'
        }`}
      >
        <span className="capitalize">{value}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#10B981]' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#0B0B0B] border border-[#262626] border-t-0 rounded-b-lg shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
          {(['daily', 'weekly'] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                onChange(type);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors ${
                value === type 
                  ? 'text-[#10B981] bg-[#10B981]/5' 
                  : 'text-[#A3A3A3] hover:bg-white/[0.05] hover:text-[#FAFAFA]'
              }`}
            >
              <span className="capitalize">{type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const Planning: React.FC<PlanningProps> = ({
  goals, tactics, onAddGoal, onUpdateGoal, onDeleteGoal, onAddTactic, onUpdateTacticMeta, onDeleteTactic, onReorderGoals, onReorderTactics, onFinish
}) => {
  const [activeGoalId, setActiveGoalId] = useState<string | null>(goals[0]?.id || null);
  const [confirmSwitch, setConfirmSwitch] = useState<{ tacticId: string; newType: 'daily' | 'weekly' } | null>(null);
  const [draggedGoalIdx, setDraggedGoalIdx] = useState<number | null>(null);
  const [draggedTacticIdx, setDraggedTacticIdx] = useState<number | null>(null);

  const selectedGoal = goals.find(g => g.id === activeGoalId);
  const selectedGoalTactics = tactics.filter(t => t.goalId === activeGoalId);

  const handleGoalDragStart = (e: React.DragEvent, index: number) => {
    setDraggedGoalIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleGoalDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedGoalIdx === null || draggedGoalIdx === index) return;
    const newGoals = [...goals];
    const draggedItem = newGoals[draggedGoalIdx];
    newGoals.splice(draggedGoalIdx, 1);
    newGoals.splice(index, 0, draggedItem);
    setDraggedGoalIdx(index);
    onReorderGoals(newGoals);
  };

  const handleTacticDragStart = (e: React.DragEvent, index: number) => {
    setDraggedTacticIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTacticDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedTacticIdx === null || draggedTacticIdx === index) return;
    const filtered = [...selectedGoalTactics];
    const draggedItem = filtered[draggedTacticIdx];
    filtered.splice(draggedTacticIdx, 1);
    filtered.splice(index, 0, draggedItem);
    const otherTactics = tactics.filter(t => t.goalId !== activeGoalId);
    onReorderTactics([...otherTactics, ...filtered]);
    setDraggedTacticIdx(index);
  };

  const addMeasurement = (goalId: string) => {
    const currentConfigs = selectedGoal?.measurementConfigs || [];
    const newConfig: MeasurementConfig = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      unit: '',
      target: 0
    };
    onUpdateGoal(goalId, { measurementConfigs: [...currentConfigs, newConfig] });
  };

  const updateMeasurement = (goalId: string, configId: string, updates: Partial<MeasurementConfig>) => {
    const currentConfigs = selectedGoal?.measurementConfigs || [];
    const next = currentConfigs.map(c => c.id === configId ? { ...c, ...updates } : c);
    onUpdateGoal(goalId, { measurementConfigs: next });
  };

  const removeMeasurement = (goalId: string, configId: string) => {
    const currentConfigs = selectedGoal?.measurementConfigs || [];
    const next = currentConfigs.filter(c => c.id !== configId);
    onUpdateGoal(goalId, { measurementConfigs: next });
  };

  const handleTypeChange = (tactic: Tactic, newType: 'daily' | 'weekly') => {
    if (tactic.type === newType) return;
    const hasData = Object.values(tactic.completions).some(val => {
      if (Array.isArray(val)) return val.some(b => b === true);
      return val === true;
    });
    if (hasData) {
      setConfirmSwitch({ tacticId: tactic.id, newType });
    } else {
      onUpdateTacticMeta(tactic.id, { type: newType, completions: {} });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Your 12-Week Plan</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2 uppercase tracking-widest text-[10px] text-[#A3A3A3]">Goals</h2>
            <button onClick={() => onAddGoal({ name: 'New Goal', measurementConfigs: [] })} className="p-1.5 hover:bg-[#10B981]/10 rounded-lg border border-[#262626] text-[#A3A3A3] hover:text-[#10B981] transition-all">
              <Plus size={18} />
            </button>
          </div>
          <div className="space-y-2">
            {goals.map((goal, idx) => (
              <div 
                key={goal.id} 
                className={`relative group ${draggedGoalIdx === idx ? 'opacity-40' : 'opacity-100'}`}
                draggable
                onDragStart={(e) => handleGoalDragStart(e, idx)}
                onDragOver={(e) => handleGoalDragOver(e, idx)}
                onDragEnd={() => setDraggedGoalIdx(null)}
              >
                <button 
                  onClick={() => setActiveGoalId(goal.id)} 
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${activeGoalId === goal.id ? 'bg-[#161616] border-[#10B981] ring-1 ring-[#10B981]' : 'bg-[#0B0B0B] border-[#262626] text-[#A3A3A3] hover:bg-[#161616]'}`}
                >
                  <div className="cursor-grab active:cursor-grabbing text-[#262626] group-hover:text-[#10B981] transition-colors">
                    <Grip size={16} />
                  </div>
                  <div className="flex-1 min-w-0 pointer-events-none">
                    <div className="font-bold text-sm mb-1 truncate">{goal.name || 'Untitled Goal'}</div>
                    <div className="text-[10px] uppercase font-mono text-[#A3A3A3]">{tactics.filter(t => t.goalId === goal.id).length} Tactics</div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex-1 space-y-10">
          {selectedGoal ? (
            <>
              {/* Goal Metadata Section */}
              <section className="bg-[#161616] border border-[#262626] rounded-2xl p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 mr-4">
                      <input className="bg-transparent border-none text-2xl font-bold focus:outline-none w-full" value={selectedGoal.name} onChange={(e) => onUpdateGoal(selectedGoal.id, { name: e.target.value })} placeholder="Goal Name..." />
                      <textarea className="bg-transparent border-none text-[#A3A3A3] text-sm focus:outline-none w-full resize-none mt-2" value={selectedGoal.description} onChange={(e) => onUpdateGoal(selectedGoal.id, { description: e.target.value })} placeholder="Vision..." rows={2} />
                  </div>
                  <button onClick={() => onDeleteGoal(selectedGoal.id)} className="p-2 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"><Trash2 size={18} /></button>
                </div>
              </section>

              {/* Tactics Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2 tracking-tight"><ListTodo size={18} className="text-[#0EA5E9]" /> Tactics</h3>
                  <button onClick={() => onAddTactic({ goalId: selectedGoal.id, name: 'New Tactic', type: 'daily', assignedWeeks: [1,2,3,4,5,6,7,8,9,10,11,12] })} className="flex items-center gap-2 text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-full border border-[#10B981]/20 hover:bg-[#10B981]/20 transition-all"><Plus size={14} /> Add Tactic</button>
                </div>

                <div className="space-y-4">
                  {selectedGoalTactics.map((tactic, idx) => (
                    <div 
                      key={tactic.id} 
                      className={`bg-[#161616] border border-[#262626] rounded-xl p-4 space-y-4 relative group/tactic transition-opacity ${draggedTacticIdx === idx ? 'opacity-40 border-dashed border-[#10B981]' : 'opacity-100'}`}
                      draggable
                      onDragStart={(e) => handleTacticDragStart(e, idx)}
                      onDragOver={(e) => handleTacticDragOver(e, idx)}
                      onDragEnd={() => setDraggedTacticIdx(null)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 mr-4">
                          <div className="cursor-grab active:cursor-grabbing text-[#262626] group-hover/tactic:text-[#10B981] transition-colors">
                            <GripVertical size={16} />
                          </div>
                          <input className="bg-transparent border-none text-base font-medium focus:outline-none w-full" value={tactic.name} onChange={(e) => onUpdateTacticMeta(tactic.id, { name: e.target.value })} placeholder="What needs to be done?" />
                        </div>
                        <div className="flex items-center gap-2">
                          <TypeDropdown value={tactic.type} onChange={(val) => handleTypeChange(tactic, val)} />
                          <button onClick={() => onDeleteTactic(tactic.id)} className="p-1 text-[#A3A3A3] hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-[#A3A3A3] flex items-center gap-1"><Calendar size={10} /> Assigned Weeks</label>
                        <div className="flex flex-wrap gap-1">
                            {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => {
                              const isAssigned = tactic.assignedWeeks.includes(w);
                              return (
                                <button key={w} onClick={() => {
                                    const next = isAssigned ? tactic.assignedWeeks.filter(num => num !== w) : [...tactic.assignedWeeks, w].sort((a,b) => a-b);
                                    onUpdateTacticMeta(tactic.id, { assignedWeeks: next });
                                  }} className={`w-8 h-8 rounded text-xs font-mono transition-all border ${isAssigned ? 'bg-[#10B981] border-[#10B981] text-black font-bold' : 'bg-[#0B0B0B] border-[#262626] text-[#A3A3A3] hover:border-[#10B981]/50'}`}>
                                  {w}
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Measurements Section */}
              <section className="space-y-6 pt-6 border-t border-[#262626]">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2 tracking-tight"><BarChart3 size={18} className="text-[#10B981]" /> Measurements</h3>
                  <button onClick={() => addMeasurement(selectedGoal.id)} className="flex items-center gap-2 text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1.5 rounded-full border border-[#10B981]/20 hover:bg-[#10B981]/20 transition-all">
                    <Plus size={14} /> Add Metric
                  </button>
                </div>

                <div className="space-y-8">
                  {selectedGoal.measurementConfigs.map((config) => (
                    <div key={config.id} className="bg-[#161616] border border-[#262626] rounded-2xl p-8 relative group/metric transition-all hover:border-[#10B981]/20 shadow-xl">
                      <div className="space-y-8">
                        {/* Question 1 */}
                        <div className="space-y-3">
                          <label className="text-[10px] uppercase font-bold text-[#A3A3A3] tracking-[0.15em] block ml-1 opacity-70">
                            What are you measuring?
                          </label>
                          <input 
                            className="w-full bg-[#0B0B0B] border border-[#262626] rounded-xl py-4 px-5 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition-all placeholder:text-[#262626] text-base font-medium" 
                            value={config.name} 
                            onChange={(e) => updateMeasurement(selectedGoal.id, config.id, { name: e.target.value })} 
                            placeholder="e.g. Revenue, Weight, Deep Work Hours..." 
                          />
                        </div>

                        {/* Question 2 + Target Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                          <div className="md:col-span-8 space-y-3">
                            <label className="text-[10px] uppercase font-bold text-[#A3A3A3] tracking-[0.15em] block ml-1 opacity-70">
                              Metric or unit of measure
                            </label>
                            <input 
                              className="w-full bg-[#0B0B0B] border border-[#262626] rounded-xl py-4 px-5 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition-all placeholder:text-[#262626] text-sm" 
                              value={config.unit} 
                              onChange={(e) => updateMeasurement(selectedGoal.id, config.id, { unit: e.target.value })} 
                              placeholder="Dollars, Pounds, Calls, Hours, etc." 
                            />
                          </div>
                          <div className="md:col-span-4 space-y-3">
                            <label className="text-[10px] uppercase font-bold text-[#A3A3A3] tracking-[0.15em] block ml-1 opacity-70 flex items-center justify-between">
                              Goal Target <span className="opacity-40 italic lowercase font-normal tracking-normal">(Optional)</span>
                            </label>
                            <div className="relative">
                              <input 
                                type="number" 
                                className="w-full bg-[#0B0B0B] border border-[#262626] rounded-xl py-4 px-5 focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition-all font-mono text-sm pr-12" 
                                value={config.target} 
                                onChange={(e) => updateMeasurement(selectedGoal.id, config.id, { target: parseFloat(e.target.value) || 0 })} 
                              />
                              <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${config.target > 0 ? 'text-[#10B981]' : 'text-[#262626]'}`}>
                                <Target size={16} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => removeMeasurement(selectedGoal.id, config.id)} 
                        className="absolute top-4 right-4 p-2 text-[#262626] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover/metric:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {selectedGoal.measurementConfigs.length === 0 && (
                    <div className="text-center py-16 border-2 border-dashed border-[#262626] rounded-3xl bg-[#161616]/30">
                      <div className="w-12 h-12 bg-[#262626]/50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#404040]">
                        <Ruler size={24} />
                      </div>
                      <p className="text-sm text-[#A3A3A3] max-w-xs mx-auto">No KPIs defined yet for this goal. Add a measurement to track your performance trajectory.</p>
                    </div>
                  )}
                </div>
              </section>
            </>
          ) : (
            <div className="h-full flex items-center justify-center py-20">
              <div className="text-center space-y-4">
                  <Target size={48} className="mx-auto text-[#262626]" />
                  <p className="text-[#A3A3A3]">Select a goal from the sidebar to start planning.</p>
              </div>
            </div>
          )}
          
          <div className="pt-10 border-t border-[#262626] flex justify-end">
            <button 
              onClick={onFinish} 
              className="flex items-center gap-3 px-8 py-3 bg-[#10B981] text-black font-bold rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[#10B981]/20 uppercase tracking-widest text-xs"
            >
              <ArrowLeft size={18} /> Save & Finish
            </button>
          </div>
        </div>
      </div>

      {confirmSwitch && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setConfirmSwitch(null)}></div>
          <div className="bg-[#161616] border border-[#262626] w-full max-w-md rounded-2xl p-8 relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500"><AlertTriangle size={32} /></div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Wipe Completion Data?</h2>
                <p className="text-sm text-[#A3A3A3]">Switching types will erase all existing progress for this tactic across all 12 weeks. This cannot be undone.</p>
              </div>
              <div className="flex gap-3 w-full mt-4">
                <button onClick={() => setConfirmSwitch(null)} className="flex-1 bg-[#0B0B0B] border border-[#262626] py-3 rounded-xl font-bold">Cancel</button>
                <button onClick={() => {
                  if (confirmSwitch) {
                    onUpdateTacticMeta(confirmSwitch.tacticId, { type: confirmSwitch.newType, completions: {} });
                    setConfirmSwitch(null);
                  }
                }} className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold">Confirm Reset</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
