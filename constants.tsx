
import React from 'react';
import { LayoutDashboard, Settings, Ruler, Target, Crosshair } from 'lucide-react';

export const COLORS = {
  background: '#0B0B0B',
  card: '#161616',
  border: '#262626',
  primary: '#10B981',
  secondary: '#0EA5E9',
  accent: '#F59E0B',
  textMain: '#FAFAFA',
  textMuted: '#A3A3A3',
  error: '#EF4444',
  success: '#10B981',
};

export const DAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, shortcut: 'd' },
  { id: 'plan', label: 'Plan', icon: <Crosshair size={20} />, shortcut: 'p' },
  { id: 'measurements', label: 'Measurements', icon: <Ruler size={20} />, shortcut: 'm' },
  { id: 'vision', label: 'Vision', icon: <Target size={20} />, shortcut: 'v' },
] as const;
