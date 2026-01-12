
import { Tactic } from '../types';

export const calculateTacticScore = (tactic: Tactic, weekNum: number): number => {
  const completion = tactic.completions[weekNum];
  if (tactic.type === 'daily') {
    const days = (completion as boolean[]) || [false, false, false, false, false, false, false];
    const completedCount = days.filter(Boolean).length;
    return (completedCount / 7) * 100;
  } else {
    return completion === true ? 100 : 0;
  }
};

export const calculateWeeklyScore = (tactics: Tactic[], weekNum: number): number => {
  const activeTactics = tactics.filter(t => t.assignedWeeks.includes(weekNum));
  if (activeTactics.length === 0) return 0;
  
  const totalScore = activeTactics.reduce((sum, t) => sum + calculateTacticScore(t, weekNum), 0);
  return totalScore / activeTactics.length;
};

export const calculateOverallProgress = (tactics: Tactic[], currentWeek: number): number => {
  let totalAchieved = 0;
  let totalPossible = 0;

  for (let w = 1; w <= currentWeek; w++) {
    const weeklyTactics = tactics.filter(t => t.assignedWeeks.includes(w));
    weeklyTactics.forEach(t => {
      totalAchieved += calculateTacticScore(t, w);
      totalPossible += 100;
    });
  }

  return totalPossible === 0 ? 0 : (totalAchieved / totalPossible) * 100;
};
