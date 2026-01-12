
export type TacticType = 'daily' | 'weekly';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Tactic {
  id: string;
  goalId: string;
  name: string;
  type: TacticType;
  assignedWeeks: number[]; // 1-12
  completions: { [weekNum: number]: boolean | boolean[] }; // for daily: boolean[7], for weekly: boolean
}

export interface MeasurementConfig {
  id: string;
  name: string;
  unit: string;
  target: number;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  measurementConfigs: MeasurementConfig[];
}

export interface MeasurementValue {
  goalId: string;
  configId: string;
  weekNum: number;
  value: number;
}

export interface Cycle {
  id: string;
  startDate: string; // ISO String, Monday
  currentWeek: number;
}

export type View = 'dashboard' | 'plan' | 'measurements' | 'vision' | 'landing';
