/**
 * Design Tokens & Constants for EcoSort UI
 * Implements clean-architecture-guard Rule: Design system tokens
 * Single source of truth for retro aesthetic surfaces, borders, and shadows.
 */

export const RETRO_TOKENS = {
  surfaces: {
    cream: '#FDFBF7',
    creamTranslucent: 'rgba(253, 251, 247, 0.95)',
    dark: '#0f172a',
    card: '#1e293b',
  },
  borders: {
    default: 'border-2 border-slate-900',
    thick: 'border-[2.5px] border-slate-900',
    heavy: 'border-[3px] border-slate-950',
    extraHeavy: 'border-4 border-slate-900',
    slate900: 'border-slate-900',
    slate950: 'border-slate-950',
  },
  shadows: {
    xs: 'shadow-retro-xs',
    sm: 'shadow-retro-sm',
    base: 'shadow-retro',
    md: 'shadow-retro-md',
    lg: 'shadow-retro-lg',
    xl: 'shadow-retro-xl',
  },
  radii: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    phone: 'rounded-[1.5rem] sm:rounded-[2rem]',
  },
} as const;

export const RETRO_CARD_CLASS =
  'bg-[#FDFBF7] border-2 border-slate-900 rounded-3xl shadow-retro-xl text-slate-900';

export const RETRO_BUTTON_PRESS_CLASS =
  'transition-transform active:translate-x-[1px] active:translate-y-[1px]';
