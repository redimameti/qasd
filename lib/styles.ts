/**
 * Juhd Design Token System
 * ========================
 *
 * ALL design values are defined as CSS variables in index.html.
 * This file provides TypeScript references and pre-composed component styles.
 *
 * To change ANY value globally, edit index.html :root section.
 *
 * Usage:
 *   import { components, layout, cn, rawColors } from '../lib/styles';
 *   <div className={components.card}>...</div>
 *
 *   // For JS contexts (charts, etc) where CSS vars don't work:
 *   tick={{ fill: rawColors.textMuted }}
 */

// =============================================================================
// RAW COLOR VALUES - For JavaScript contexts (charts, canvas, etc.)
// Keep in sync with index.html :root CSS variables
// =============================================================================

export const rawColors = {
  background: '#0b0b0b',
  backgroundElevated: '#101010',
  card: '#161616',
  border: '#262626',
  borderMuted: 'rgba(38, 38, 38, 0.6)',    // 60% opacity border for subtle lines
  primary: '#10b981',
  primaryGlow: 'rgba(16, 185, 129, 0.2)',  // 20% opacity for glow effects
  secondary: '#2378ce',
  accent: '#f59e0b',
  textMain: '#fafafa',
  textMuted: '#a3a3a3',
  textFaint: '#404040',                     // Very muted text
  error: '#ef4444',
  success: '#10b981',
} as const;

// =============================================================================
// CSS VARIABLE REFERENCES
// These map to the CSS variables defined in index.html
// =============================================================================

export const vars = {
  // Colors
  background: 'var(--background)',
  card: 'var(--card)',
  border: 'var(--border)',
  borderMuted: 'var(--border-muted)',       // 60% opacity for subtle lines
  primary: 'var(--primary)',
  primaryGlow: 'var(--primary-glow)',       // 20% opacity for glow effects
  secondary: 'var(--secondary)',
  accent: 'var(--accent)',
  textMain: 'var(--text-main)',
  textMuted: 'var(--text-muted)',
  error: 'var(--error)',
  success: 'var(--success)',

  // Spacing
  space1: 'var(--space-1)',
  space2: 'var(--space-2)',
  space3: 'var(--space-3)',
  space4: 'var(--space-4)',
  space5: 'var(--space-5)',
  space6: 'var(--space-6)',
  space8: 'var(--space-8)',
  space10: 'var(--space-10)',
  space12: 'var(--space-12)',
  space16: 'var(--space-16)',

  // Sizing
  sidebarCollapsed: 'var(--sidebar-collapsed)',
  sidebarExpanded: 'var(--sidebar-expanded)',
  containerSm: 'var(--container-sm)',
  containerMd: 'var(--container-md)',
  containerLg: 'var(--container-lg)',
  containerXl: 'var(--container-xl)',
  headerHeight: 'var(--header-height)',
  mobileNavHeight: 'var(--mobile-nav-height)',

  // Border Radius
  radiusSm: 'var(--radius-sm)',
  radiusMd: 'var(--radius-md)',
  radiusLg: 'var(--radius-lg)',
  radiusXl: 'var(--radius-xl)',
  radius2xl: 'var(--radius-2xl)',
  radius3xl: 'var(--radius-3xl)',
  radiusFull: 'var(--radius-full)',

  // Typography
  textXs: 'var(--text-xs)',
  textSm: 'var(--text-sm)',
  textBase: 'var(--text-base)',
  textLg: 'var(--text-lg)',
  textXl: 'var(--text-xl)',
  text2xl: 'var(--text-2xl)',
  text3xl: 'var(--text-3xl)',
  text4xl: 'var(--text-4xl)',
  text5xl: 'var(--text-5xl)',

  // Z-Index
  zDropdown: 'var(--z-dropdown)',
  zSticky: 'var(--z-sticky)',
  zFixed: 'var(--z-fixed)',
  zModalBackdrop: 'var(--z-modal-backdrop)',
  zModal: 'var(--z-modal)',
  zPopover: 'var(--z-popover)',
  zToast: 'var(--z-toast)',

  // Shadows
  shadowSm: 'var(--shadow-sm)',
  shadowMd: 'var(--shadow-md)',
  shadowLg: 'var(--shadow-lg)',
  shadowXl: 'var(--shadow-xl)',
  shadowGlow: 'var(--shadow-glow)',
  shadowDeep: 'var(--shadow-deep)',

  // Transitions
  transitionFast: 'var(--transition-fast)',
  transitionNormal: 'var(--transition-normal)',
  transitionSlow: 'var(--transition-slow)',
} as const;


// =============================================================================
// COMPONENT STYLES - Pre-composed Tailwind class strings
// All use CSS variables for colors, making them theme-able
// =============================================================================

export const components = {
  // ---------------------------------------------------------------------------
  // CARDS
  // ---------------------------------------------------------------------------
  card: `bg-[var(--card)] border border-[var(--border)] rounded-xl`,
  cardLg: `bg-[var(--card)] border border-[var(--border)] rounded-2xl`,
  cardHover: `bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-[var(--primary)]/30 transition-colors`,
  cardInteractive: `bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-[var(--primary)]/30 hover:bg-[var(--card)]/80 transition-all cursor-pointer`,

  // ---------------------------------------------------------------------------
  // BUTTONS
  // ---------------------------------------------------------------------------
  btnPrimary: `bg-[var(--primary)] text-black font-semibold px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`,
  btnPrimarySm: `bg-[var(--primary)] text-black font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-opacity`,
  btnSecondary: `border border-[var(--border)] text-[var(--text-muted)] font-semibold px-6 py-3 rounded-2xl hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors`,
  btnGhost: `text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors`,
  btnPill: `px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)]/30 transition-all text-[11px] font-bold uppercase tracking-widest`,
  btnIcon: `p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--card)] transition-colors`,
  btnDanger: `text-[var(--text-muted)] hover:text-[var(--error)] transition-colors`,

  // ---------------------------------------------------------------------------
  // INPUTS
  // ---------------------------------------------------------------------------
  input: `w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-4 px-5 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-all text-[var(--text-main)] placeholder:text-[var(--text-muted)]/50`,
  inputSm: `w-full bg-[var(--background)] border border-[var(--border)] rounded-lg py-2 px-3 focus:outline-none focus:border-[var(--primary)] transition-all text-sm`,
  inputTransparent: `w-full bg-transparent border-none focus:outline-none text-[var(--text-main)]`,
  textarea: `w-full bg-[var(--background)] border border-[var(--border)] rounded-xl py-4 px-5 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]/20 transition-all resize-none`,

  // ---------------------------------------------------------------------------
  // LABELS & TEXT
  // ---------------------------------------------------------------------------
  label: `text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]`,
  labelSm: `text-[8px] uppercase font-bold tracking-wider text-[var(--text-muted)]`,
  labelAccent: `text-[8px] uppercase font-bold tracking-wider text-[var(--accent)]`,
  labelSecondary: `text-[8px] uppercase font-bold tracking-wider text-[var(--secondary)]`,
  sectionTitle: `text-2xl font-bold uppercase tracking-tight`,
  textMuted: `text-[var(--text-muted)]`,
  textPrimary: `text-[var(--primary)]`,

  // ---------------------------------------------------------------------------
  // DIVIDERS
  // ---------------------------------------------------------------------------
  divider: `border-b border-[var(--border-muted)]`,
  dividerSolid: `border-b border-[var(--border)]`,
  dividerVertical: `border-l border-[var(--border)]`,

  // ---------------------------------------------------------------------------
  // WEEK SLIDER
  // ---------------------------------------------------------------------------
  weekSlider: {
    container: `flex items-center gap-1.5 bg-[var(--card)] border border-[var(--border)] rounded-xl p-1.5 overflow-x-auto no-scrollbar`,
    button: `w-10 h-10 shrink-0 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center`,
    active: `bg-[var(--primary)] text-black shadow-lg shadow-[var(--primary-glow)]`,
    inactive: `text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5`,
  },

  // ---------------------------------------------------------------------------
  // MODALS & OVERLAYS
  // ---------------------------------------------------------------------------
  modalBackdrop: `fixed inset-0 bg-black/60 backdrop-blur-sm z-40`,
  modalContainer: `fixed inset-0 flex items-center justify-center z-50 p-4`,
  modalContent: `bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 max-w-md w-full shadow-2xl`,

  // ---------------------------------------------------------------------------
  // NAVIGATION
  // ---------------------------------------------------------------------------
  navItem: `w-full flex items-center gap-3 p-3 rounded-lg transition-colors`,
  navItemActive: `bg-[var(--card)] text-[var(--primary)] border border-[var(--border)]`,
  navItemInactive: `text-[var(--text-muted)] hover:bg-[var(--card)] hover:text-[var(--text-main)]`,
  navShortcut: `text-[10px] text-[var(--border)] border border-[var(--border)] px-1 rounded uppercase`,

  // ---------------------------------------------------------------------------
  // TOASTS & NOTIFICATIONS
  // ---------------------------------------------------------------------------
  toast: `fixed top-6 left-1/2 -translate-x-1/2 z-[70] bg-[var(--primary)] text-black px-6 py-3 rounded-xl font-bold shadow-2xl`,
  toastError: `fixed top-6 left-1/2 -translate-x-1/2 z-[70] bg-[var(--error)] text-white px-6 py-3 rounded-xl font-bold shadow-2xl`,

  // ---------------------------------------------------------------------------
  // PROGRESS BARS
  // ---------------------------------------------------------------------------
  progressBar: `h-2 bg-[var(--background)] rounded-full overflow-hidden border border-[var(--border)]`,
  progressFill: `h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]`,

  // ---------------------------------------------------------------------------
  // AVATARS
  // ---------------------------------------------------------------------------
  avatar: `rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-black font-bold`,
  avatarSm: `w-8 h-8 text-xs`,
  avatarMd: `w-10 h-10 text-sm`,
  avatarLg: `w-12 h-12 text-base`,

  // ---------------------------------------------------------------------------
  // CHECKBOXES
  // ---------------------------------------------------------------------------
  checkbox: `w-5 h-5 rounded-lg border-2 border-[var(--border)] flex items-center justify-center transition-all cursor-pointer`,
  checkboxChecked: `bg-[var(--primary)] border-[var(--primary)]`,
  checkboxUnchecked: `hover:border-[var(--primary)]/50`,

  // ---------------------------------------------------------------------------
  // BADGES
  // ---------------------------------------------------------------------------
  badge: `px-2 py-0.5 rounded-full text-[10px] font-bold uppercase`,
  badgePrimary: `bg-[var(--primary)]/20 text-[var(--primary)]`,
  badgeSecondary: `bg-[var(--secondary)]/20 text-[var(--secondary)]`,
  badgeAccent: `bg-[var(--accent)]/20 text-[var(--accent)]`,
} as const;


// =============================================================================
// LAYOUT PATTERNS - Common layout compositions
// =============================================================================

export const layout = {
  // Page wrappers
  page: `p-4 md:p-6 max-w-5xl mx-auto w-full`,
  pageLanding: `max-w-6xl mx-auto px-6`,
  pageAuth: `min-h-screen flex items-center justify-center p-4`,

  // Sections
  section: `space-y-8`,
  sectionSm: `space-y-4`,
  sectionLg: `space-y-12`,

  // Flex patterns
  flexCenter: `flex items-center justify-center`,
  flexBetween: `flex items-center justify-between`,
  flexStart: `flex items-center`,
  flexCol: `flex flex-col`,
  flexWrap: `flex flex-wrap items-center gap-4`,

  // Grid patterns
  grid2: `grid grid-cols-1 md:grid-cols-2 gap-6`,
  grid3: `grid grid-cols-1 sm:grid-cols-3 gap-4`,
  gridAuto: `grid grid-cols-1 lg:grid-cols-2 gap-6`,

  // Responsive centering (for stacked layouts)
  centerOnMobile: `text-center lg:text-left`,
  centerContentOnMobile: `mx-auto lg:mx-0`,
  justifyCenterOnMobile: `justify-center lg:justify-start`,

  // Sidebar layout
  sidebarLayout: `flex h-screen w-full bg-[var(--background)] text-[var(--text-main)] overflow-hidden`,
  sidebar: `hidden md:flex flex-col w-20 lg:w-64 border-r border-[var(--border)] bg-[var(--background)] p-4 transition-all`,
  mainContent: `flex-1 flex flex-col relative overflow-y-auto pb-20 md:pb-0`,

  // Mobile navigation
  mobileNav: `md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--card)] border-t border-[var(--border)] flex items-center justify-around h-16 px-2`,
  mobileHeader: `sticky top-0 z-20 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)] p-4 flex items-center justify-between md:hidden`,
} as const;


// =============================================================================
// ICON SIZES - Consistent icon dimensions
// =============================================================================

export const iconSize = {
  xs: 12,
  sm: 14,
  md: 18,
  lg: 20,
  xl: 24,
} as const;


// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Combine multiple class strings, filtering out falsy values
 * Usage: cn(components.card, isActive && 'ring-2', className)
 */
export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Get conditional class based on state
 * Usage: when(isActive, components.navItemActive, components.navItemInactive)
 */
export const when = (condition: boolean, trueClass: string, falseClass: string = ''): string => {
  return condition ? trueClass : falseClass;
};
