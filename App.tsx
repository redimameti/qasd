import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Planning } from './components/Planning';
import { Measurements } from './components/Measurements';
import { Vision } from './components/Vision';
import { Auth } from './components/Auth';
import { View, Goal, Tactic, Cycle, MeasurementValue, User } from './types';
import { supabase } from './lib/supabase';

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

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('dashboard');

  const [goals, setGoals] = useState<Goal[]>([]);
  const [tactics, setTactics] = useState<Tactic[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementValue[]>([]);
  const [vision, setVision] = useState<{ longTerm: string; shortTerm: string }>({ longTerm: '', shortTerm: '' });
  const [cycle, setCycle] = useState<Cycle>({ id: 'c1', startDate: new Date().toISOString(), currentWeek: 1 });

  // Check for existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!.split('@')[0]
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name || session.user.email!.split('@')[0]
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user data from Supabase
  useEffect(() => {
    if (!currentUser) return;

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
        // New users start with empty goals - no seeding

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

        if (cycleData) {
          setCycle({
            id: cycleData.id,
            startDate: cycleData.start_date,
            currentWeek: cycleData.current_week
          });
        } else {
          // Create default cycle
          const newCycle = {
            id: 'c1',
            user_id: currentUser.id,
            start_date: new Date().toISOString(),
            current_week: 1
          };
          await supabase.from('cycles').insert(newCycle);
          setCycle({
            id: newCycle.id,
            startDate: newCycle.start_date,
            currentWeek: newCycle.current_week
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [currentUser]);

  const seedInitialData = async (userId: string) => {
    try {
      // Insert goals
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

      // Insert tactics
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

  const setWeek = async (week: number) => {
    if (week >= 1 && week <= 12 && currentUser) {
      setCycle(prev => ({ ...prev, currentWeek: week }));

      await supabase
        .from('cycles')
        .update({ current_week: week })
        .eq('user_id', currentUser.id);
    }
  };

  const handleUpdateTactic = useCallback(async (tacticId: string, weekNum: number, completion: any) => {
    if (!currentUser) return;

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
  }, [currentUser, tactics]);

  const handleUpdateMeasurement = useCallback(async (goalId: string, configId: string, weekNum: number, value: number) => {
    if (!currentUser) return;

    setMeasurements(prev => {
      const existingIdx = prev.findIndex(m => m.configId === configId && m.weekNum === weekNum);
      if (existingIdx !== -1) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], value };
        return next;
      }
      return [...prev, { goalId, configId, weekNum, value }];
    });

    await supabase
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
  }, [currentUser]);

  const addGoal = async (g: Partial<Goal>) => {
    if (!currentUser) return;

    const newGoal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      name: g.name || 'New Goal',
      description: g.description || '',
      measurementConfigs: g.measurementConfigs || []
    };

    setGoals([...goals, newGoal]);

    await supabase.from('goals').insert({
      id: newGoal.id,
      user_id: currentUser.id,
      name: newGoal.name,
      description: newGoal.description,
      measurement_configs: newGoal.measurementConfigs,
      position: goals.length
    });
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    if (!currentUser) return;

    setGoals(goals.map(g => g.id === id ? { ...g, ...updates } : g));

    await supabase
      .from('goals')
      .update({
        name: updates.name,
        description: updates.description,
        measurement_configs: updates.measurementConfigs
      })
      .eq('id', id)
      .eq('user_id', currentUser.id);
  };

  const deleteGoal = async (id: string) => {
    if (!currentUser) return;

    setGoals(goals.filter(g => g.id !== id));
    setTactics(tactics.filter(t => t.goalId !== id));
    setMeasurements(measurements.filter(m => m.goalId !== id));

    await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.id);
  };

  const addTactic = async (t: Partial<Tactic>) => {
    if (!currentUser) return;

    const newTactic: Tactic = {
      id: Math.random().toString(36).substr(2, 9),
      goalId: t.goalId!,
      name: t.name || 'New Tactic',
      type: t.type || 'daily',
      assignedWeeks: t.assignedWeeks || [1,2,3,4,5,6,7,8,9,10,11,12],
      completions: {}
    };

    setTactics([...tactics, newTactic]);

    await supabase.from('tactics').insert({
      id: newTactic.id,
      user_id: currentUser.id,
      goal_id: newTactic.goalId,
      name: newTactic.name,
      type: newTactic.type,
      assigned_weeks: newTactic.assignedWeeks,
      completions: newTactic.completions,
      position: tactics.length
    });
  };

  const updateTacticMeta = async (id: string, updates: Partial<Tactic>) => {
    if (!currentUser) return;

    setTactics(tactics.map(t => t.id === id ? { ...t, ...updates } : t));

    await supabase
      .from('tactics')
      .update({
        name: updates.name,
        type: updates.type,
        assigned_weeks: updates.assignedWeeks
      })
      .eq('id', id)
      .eq('user_id', currentUser.id);
  };

  const deleteTactic = async (id: string) => {
    if (!currentUser) return;

    setTactics(tactics.filter(t => t.id !== id));

    await supabase
      .from('tactics')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.id);
  };

  const handleUpdateVision = async (updates: Partial<{ longTerm: string; shortTerm: string }>) => {
    if (!currentUser) return;

    setVision(v => ({ ...v, ...updates }));

    await supabase
      .from('vision')
      .upsert({
        user_id: currentUser.id,
        long_term: updates.longTerm !== undefined ? updates.longTerm : vision.longTerm,
        short_term: updates.shortTerm !== undefined ? updates.shortTerm : vision.shortTerm
      }, {
        onConflict: 'user_id'
      });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setView('dashboard');
    setGoals([]);
    setTactics([]);
    setMeasurements([]);
    setVision({ longTerm: '', shortTerm: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="text-[#10B981] text-sm">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLogin={setCurrentUser} />;
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard
            goals={goals}
            tactics={tactics}
            measurements={measurements}
            cycle={cycle}
            vision={vision}
            onUpdateTactic={handleUpdateTactic}
            onUpdateMeasurement={handleUpdateMeasurement}
            onSetWeek={setWeek}
            onEditPlan={() => setView('plan')}
            onEditVision={() => setView('vision')}
            onReorderGoals={setGoals}
            onReorderTactics={setTactics}
          />
        );
      case 'plan':
        return (
          <Planning
            goals={goals}
            tactics={tactics}
            onAddGoal={addGoal}
            onUpdateGoal={updateGoal}
            onDeleteGoal={deleteGoal}
            onAddTactic={addTactic}
            onUpdateTacticMeta={updateTacticMeta}
            onDeleteTactic={deleteTactic}
            onReorderGoals={setGoals}
            onReorderTactics={setTactics}
            onFinish={() => setView('dashboard')}
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
      setView={setView}
      currentWeek={cycle.currentWeek}
      onSetWeek={setWeek}
      currentUser={currentUser}
      vision={vision}
      onEditVision={() => setView('vision')}
      onLogout={handleLogout}
    >
      {renderView()}
    </Layout>
  );
};

export default App;
