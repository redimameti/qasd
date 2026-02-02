import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Layout } from './Layout';
import { Dashboard } from './Dashboard';
import { Planning } from './Planning';
import { Measurements } from './Measurements';
import { Vision } from './Vision';
import { SavingStatus, SaveStatus } from './SavingStatus';
import { View, Goal, Tactic, Cycle, MeasurementValue, User } from '../types';
import { supabase } from '../lib/supabase';

const INITIAL_GOALS: Goal[] = [
  {
    id: 'g1',
    name: 'Scale Digital Agency',
    description: 'Hit $20k MRR by scaling outreach and systems.',
    measurementConfigs: [
      { id: 'm1', name: 'Revenue', unit: '$', target: 20000 },
      { id: 'm2', name: 'Calls Booked', unit: 'Calls', target: 120 }
    ]
  },
  {
    id: 'g2',
    name: 'Physical Vitality',
    description: 'Optimal energy levels for high-output working days.',
    measurementConfigs: [
      { id: 'm3', name: 'Bodyweight', unit: 'kg', target: 85 }
    ]
  },
  {
    id: 'g3',
    name: 'Spiritual Grounding',
    description: 'Build consistency in Deen-based habits.',
    measurementConfigs: [
      { id: 'm4', name: 'Qur\'an Pages', unit: 'Pages', target: 500 }
    ]
  },
];

const INITIAL_TACTICS: Tactic[] = [
  { id: 't1', goalId: 'g1', name: 'Cold Outreach - 50 DMs', type: 'daily', assignedWeeks: [1,2,3,4,5,6,7,8,9,10,11,12], completions: {} },
  { id: 't2', goalId: 'g1', name: 'Refine Landing Page Copy', type: 'weekly', assignedWeeks: [1], completions: {} },
  { id: 't3', goalId: 'g2', name: 'Zone 2 Cardio (45 min)', type: 'daily', assignedWeeks: [1,2,3,4,5,6,7,8,9,10,11,12], completions: {} },
  { id: 't4', goalId: 'g3', name: 'Fajr at Masjid', type: 'daily', assignedWeeks: [1,2,3,4,5,6,7,8,9,10,11,12], completions: {} },
];

interface AppShellProps {
  currentUser: User;
  routeView: View;
  onNavigateView: (view: View) => void;
  onLogout: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({ currentUser, routeView, onNavigateView, onLogout }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tactics, setTactics] = useState<Tactic[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementValue[]>([]);
  const [vision, setVision] = useState<{ longTerm: string; shortTerm: string }>({ longTerm: '', shortTerm: '' });
  const [cycle, setCycle] = useState<Cycle>({ id: 'c1', startDate: new Date().toISOString(), currentWeek: 1 });
  const [viewWeek, setViewWeek] = useState(1);
  const prevViewRef = useRef<View | null>(null);
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reorderSaveTimersRef = useRef<{ goals?: NodeJS.Timeout; tactics?: NodeJS.Timeout }>({});

  const calculateActualWeek = useCallback((startDate: string): number => {
    const start = new Date(startDate);
    const diff = Date.now() - start.getTime();
    const weeks = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
    return Math.min(Math.max(weeks, 1), 12);
  }, []);

  const actualWeek = useMemo(
    () => calculateActualWeek(cycle.startDate),
    [cycle.startDate, calculateActualWeek],
  );

  useEffect(() => {
    setViewWeek(actualWeek);
  }, [actualWeek]);

  useEffect(() => {
    if (routeView === 'dashboard' && prevViewRef.current !== 'dashboard') {
      setViewWeek(actualWeek);
    }
    prevViewRef.current = routeView;
  }, [routeView, actualWeek]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load goals
        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('position', { ascending: true });

        if (goalsError) throw goalsError;

        if (goalsData && goalsData.length > 0) {
          setGoals(goalsData.map(g => ({
            id: g.id,
            name: g.name,
            description: g.description || '',
            measurementConfigs: g.measurement_configs || []
          })));
        }

        // Load tactics
        const { data: tacticsData, error: tacticsError } = await supabase
          .from('tactics')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('position', { ascending: true });

        if (tacticsError) throw tacticsError;

        if (tacticsData) {
          setTactics(tacticsData.map(t => ({
            id: t.id,
            goalId: t.goal_id,
            name: t.name,
            type: t.type,
            assignedWeeks: t.assigned_weeks || [],
            completions: t.completions || {}
          })));
        }

        // Load measurements
        const { data: measurementsData, error: measurementsError } = await supabase
          .from('measurements')
          .select('*')
          .eq('user_id', currentUser.id);

        if (measurementsError) throw measurementsError;

        if (measurementsData) {
          setMeasurements(measurementsData.map(m => ({
            goalId: m.goal_id,
            configId: m.config_id,
            weekNum: m.week_num,
            value: parseFloat(m.value)
          })));
        }

        // Load vision
        const { data: visionData, error: visionError } = await supabase
          .from('vision')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();

        if (visionError) {
          console.warn('Vision load error:', visionError);
        }

        if (visionData) {
          setVision({
            longTerm: visionData.long_term || '',
            shortTerm: visionData.short_term || ''
          });
        }

        // Load cycle
        const { data: cycleData, error: cycleError } = await supabase
          .from('cycles')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();

        if (cycleError) {
          console.warn('Cycle load error:', cycleError);
        }

        if (cycleData) {
          const derivedWeek = calculateActualWeek(cycleData.start_date);
          setCycle({
            id: cycleData.id,
            startDate: cycleData.start_date,
            currentWeek: derivedWeek
          });
        } else {
          const snapToMonday = (date: Date): Date => {
            const day = date.getDay();
            const diff = day === 0 ? -6 : 1 - day;
            const monday = new Date(date);
            monday.setDate(date.getDate() + diff);
            monday.setHours(0, 0, 0, 0);
            return monday;
          };

          const mondayStart = snapToMonday(new Date());
          const newCycle = {
            id: `c_${currentUser.id}`,
            user_id: currentUser.id,
            start_date: mondayStart.toISOString(),
            current_week: 1
          };
          const { error: insertError } = await supabase.from('cycles').insert(newCycle);

          if (insertError) {
            console.error('Error creating cycle:', insertError);
          }

          setCycle({
            id: newCycle.id,
            startDate: newCycle.start_date,
            currentWeek: newCycle.current_week
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load data from Supabase. Please check that Row Level Security policies are properly configured.');
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const triggerSaveStatus = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setSaveStatus('saving');
    setSaveError(null);

    saveTimerRef.current = setTimeout(() => {
      setSaveStatus('saved');
    }, 1200);
  }, []);

  const setSaveFailure = useCallback((message: string) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    setSaveStatus('error');
    setSaveError(message);
  }, []);

  const scheduleReorderPersist = useCallback(
    (type: 'goals' | 'tactics', items: { id: string }[]) => {
      const existingTimer = reorderSaveTimersRef.current[type];
      if (existingTimer) clearTimeout(existingTimer);

      reorderSaveTimersRef.current[type] = setTimeout(async () => {
        await Promise.all(
          items.map((item, idx) =>
            supabase
              .from(type)
              .update({ position: idx })
              .eq('id', item.id)
              .eq('user_id', currentUser.id),
          ),
        );
      }, 400);
    },
    [currentUser],
  );

  const handleReorderGoals = useCallback(
    (newGoals: Goal[]) => {
      setGoals(newGoals);
      scheduleReorderPersist('goals', newGoals);
    },
    [scheduleReorderPersist],
  );

  const handleReorderTactics = useCallback(
    (newTactics: Tactic[]) => {
      setTactics(newTactics);
      scheduleReorderPersist('tactics', newTactics);
    },
    [scheduleReorderPersist],
  );

  const seedInitialData = async (userId: string) => {
    try {
      const goalsToInsert = INITIAL_GOALS.map((g, idx) => ({
        id: g.id,
        user_id: userId,
        name: g.name,
        description: g.description,
        measurement_configs: g.measurementConfigs,
        position: idx
      }));

      await supabase.from('goals').insert(goalsToInsert);
      setGoals(INITIAL_GOALS);

      const tacticsToInsert = INITIAL_TACTICS.map((t, idx) => ({
        id: t.id,
        user_id: userId,
        goal_id: t.goalId,
        name: t.name,
        type: t.type,
        assigned_weeks: t.assignedWeeks,
        completions: t.completions,
        position: idx
      }));

      await supabase.from('tactics').insert(tacticsToInsert);
      setTactics(INITIAL_TACTICS);
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

  const setWeek = async (week: number, showToast = false) => {
    if (week >= 1 && week <= 12) {
      setViewWeek(week);
      if (showToast) {
        setShowResetSuccess(true);
        setTimeout(() => {
          setShowResetSuccess(false);
        }, 4000);
      }
    }
  };

  const updateCycleStartDate = async (newStartDate: string) => {
    triggerSaveStatus();
    setCycle(prev => ({ ...prev, startDate: newStartDate }));

    const { error } = await supabase
      .from('cycles')
      .update({ start_date: newStartDate })
      .eq('user_id', currentUser.id);
    if (error) {
      console.error('Error updating cycle start date:', error);
      setSaveFailure('Cycle');
    }
  };

  const handleUpdateTactic = useCallback(async (tacticId: string, weekNum: number, completion: any) => {
    setTactics(prev => prev.map(t => {
      if (t.id === tacticId) {
        return {
          ...t,
          completions: { ...t.completions, [weekNum]: completion }
        };
      }
      return t;
    }));

    const tactic = tactics.find(t => t.id === tacticId);
    if (tactic) {
      const updatedCompletions = { ...tactic.completions, [weekNum]: completion };
      await supabase
        .from('tactics')
        .update({ completions: updatedCompletions })
        .eq('id', tacticId)
        .eq('user_id', currentUser.id);
    }
  }, [currentUser.id, tactics]);

  const handleUpdateMeasurement = useCallback(async (goalId: string, configId: string, weekNum: number, value: number) => {
    triggerSaveStatus();

    setMeasurements(prev => {
      const existingIdx = prev.findIndex(m => m.configId === configId && m.weekNum === weekNum);
      if (existingIdx !== -1) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], value };
        return next;
      }
      return [...prev, { goalId, configId, weekNum, value }];
    });

    const { error } = await supabase
      .from('measurements')
      .upsert({
        user_id: currentUser.id,
        goal_id: goalId,
        config_id: configId,
        week_num: weekNum,
        value: value
      }, {
        onConflict: 'user_id,config_id,week_num'
      });
    if (error) {
      console.error('Error updating measurement:', error);
      setSaveFailure('Measurement');
    }
  }, [currentUser.id, triggerSaveStatus, setSaveFailure]);

  const addGoal = async (g: Partial<Goal>) => {
    triggerSaveStatus();

    const newGoal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      name: g.name || '',
      description: g.description || '',
      measurementConfigs: g.measurementConfigs || []
    };

    setGoals([...goals, newGoal]);

    const { error } = await supabase.from('goals').insert({
      id: newGoal.id,
      user_id: currentUser.id,
      name: newGoal.name,
      description: newGoal.description,
      measurement_configs: newGoal.measurementConfigs,
      position: goals.length
    });

    if (error) {
      console.error('Error adding goal:', error);
      setSaveFailure('Goal');
      alert(`Failed to save goal. Error: ${error.message}\n\nPlease check the console for details.`);
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    triggerSaveStatus();

    setGoals(goals.map(g => g.id === id ? { ...g, ...updates } : g));

    const { error } = await supabase
      .from('goals')
      .update({
        name: updates.name,
        description: updates.description,
        measurement_configs: updates.measurementConfigs
      })
      .eq('id', id)
      .eq('user_id', currentUser.id);

    if (error) {
      console.error('Error updating goal:', error);
      setSaveFailure('Goal');
    }
  };

  const deleteGoal = async (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
    setTactics(tactics.filter(t => t.goalId !== id));
    setMeasurements(measurements.filter(m => m.goalId !== id));

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.id);
    if (error) {
      console.error('Error deleting goal:', error);
      setSaveFailure('Goal');
    }
  };

  const addTactic = async (t: Partial<Tactic>) => {
    triggerSaveStatus();

    const newTactic: Tactic = {
      id: Math.random().toString(36).substr(2, 9),
      goalId: t.goalId!,
      name: t.name || '',
      type: t.type || 'weekly',
      assignedWeeks: t.assignedWeeks || [1,2,3,4,5,6,7,8,9,10,11,12],
      completions: {}
    };

    setTactics([...tactics, newTactic]);

    const { error } = await supabase.from('tactics').insert({
      id: newTactic.id,
      user_id: currentUser.id,
      goal_id: newTactic.goalId,
      name: newTactic.name,
      type: newTactic.type,
      assigned_weeks: newTactic.assignedWeeks,
      completions: newTactic.completions,
      position: tactics.length
    });

    if (error) {
      console.error('Error adding tactic:', error);
      setSaveFailure('Tactic');
      alert('Failed to save tactic. Please check that Row Level Security policies are enabled in Supabase.');
    }
  };

  const updateTacticMeta = async (id: string, updates: Partial<Tactic>) => {
    triggerSaveStatus();

    setTactics(tactics.map(t => t.id === id ? { ...t, ...updates } : t));

    const { error } = await supabase
      .from('tactics')
      .update({
        name: updates.name,
        type: updates.type,
        assigned_weeks: updates.assignedWeeks
      })
      .eq('id', id)
      .eq('user_id', currentUser.id);
    if (error) {
      console.error('Error updating tactic:', error);
      setSaveFailure('Tactic');
    }
  };

  const deleteTactic = async (id: string) => {
    setTactics(tactics.filter(t => t.id !== id));

    const { error } = await supabase
      .from('tactics')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.id);
    if (error) {
      console.error('Error deleting tactic:', error);
      setSaveFailure('Tactic');
    }
  };

  const handleUpdateVision = async (updates: Partial<{ longTerm: string; shortTerm: string }>) => {
    triggerSaveStatus();

    setVision(v => ({ ...v, ...updates }));

    const { error } = await supabase
      .from('vision')
      .upsert({
        user_id: currentUser.id,
        long_term: updates.longTerm !== undefined ? updates.longTerm : vision.longTerm,
        short_term: updates.shortTerm !== undefined ? updates.shortTerm : vision.shortTerm
      }, {
        onConflict: 'user_id'
      });
    if (error) {
      console.error('Error updating vision:', error);
      setSaveFailure('Vision');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-[var(--primary)] text-sm">Loading...</div>
      </div>
    );
  }

  const view = routeView;

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard
            goals={goals}
            tactics={tactics}
            measurements={measurements}
            cycle={cycle}
            viewWeek={viewWeek}
            vision={vision}
            onUpdateTactic={handleUpdateTactic}
            onUpdateMeasurement={handleUpdateMeasurement}
            onSetWeek={(week) => setWeek(week, false)}
            onEditPlan={() => onNavigateView('plan')}
            onEditVision={() => onNavigateView('vision')}
            onReorderGoals={handleReorderGoals}
            onReorderTactics={handleReorderTactics}
            showResetSuccess={showResetSuccess}
          />
        );
      case 'plan':
        return (
          <Planning
            goals={goals}
            tactics={tactics}
            cycle={cycle}
            actualWeek={actualWeek}
            onAddGoal={addGoal}
            onUpdateGoal={updateGoal}
            onDeleteGoal={deleteGoal}
            onAddTactic={addTactic}
            onUpdateTacticMeta={updateTacticMeta}
            onDeleteTactic={deleteTactic}
            onReorderGoals={handleReorderGoals}
            onReorderTactics={handleReorderTactics}
            onUpdateCycleStartDate={updateCycleStartDate}
            onSetWeek={(week) => setWeek(week, true)}
            onFinish={() => onNavigateView('dashboard')}
          />
        );
      case 'measurements':
        return (
          <Measurements
            goals={goals}
            measurements={measurements}
            onUpdateMeasurement={handleUpdateMeasurement}
          />
        );
      case 'vision':
        return (
          <Vision
            vision={vision}
            onUpdateVision={handleUpdateVision}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout
      currentView={view}
      setView={onNavigateView}
      currentWeek={viewWeek}
      onSetWeek={setWeek}
      currentUser={currentUser}
      vision={vision}
      onEditVision={() => onNavigateView('vision')}
      onLogout={handleLogout}
    >
      <div className="fixed top-6 right-6 z-50">
        <SavingStatus status={saveStatus} message={saveError} />
      </div>

      {renderView()}
    </Layout>
  );
};
