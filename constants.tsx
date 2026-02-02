
import React from 'react';
import { LayoutDashboard, Settings, Ruler, Target, Crosshair } from 'lucide-react';

export const COLORS = {
  background: 'var(--background)',
  card: 'var(--card)',
  border: 'var(--border)',
  primary: 'var(--primary)',
  secondary: 'var(--secondary)',
  accent: 'var(--accent)',
  textMain: 'var(--text-main)',
  textMuted: 'var(--text-muted)',
  error: 'var(--error)',
  success: 'var(--primary)',
};

export const DAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, shortcut: 'd' },
  { id: 'plan', label: 'Plan', icon: <Crosshair size={20} />, shortcut: 'p' },
  { id: 'measurements', label: 'Measurements', icon: <Ruler size={20} />, shortcut: 'm' },
  { id: 'vision', label: 'Vision', icon: <Target size={20} />, shortcut: 'v' },
] as const;
