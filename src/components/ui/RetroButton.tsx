import React from 'react';
import { RETRO_BUTTON_PRESS_CLASS } from './retroTokens';

export interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const RetroButton: React.FC<RetroButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  let variantClass = 'bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 shadow-retro-sm';

  if (variant === 'primary') {
    variantClass = 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 border-2 border-slate-900 shadow-retro-sm';
  } else if (variant === 'accent') {
    variantClass = 'bg-amber-300 hover:bg-amber-400 text-slate-950 border-2 border-slate-900 shadow-retro-sm';
  } else if (variant === 'danger') {
    variantClass = 'bg-rose-500 hover:bg-rose-600 text-white border-2 border-slate-900 shadow-retro-sm';
  } else if (variant === 'icon') {
    variantClass = 'bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 shadow-retro-sm';
  }

  let sizeClass = 'px-4 py-2 text-xs sm:text-sm font-fun font-black rounded-xl';
  if (size === 'sm') {
    sizeClass = 'px-2.5 py-1 text-xs font-fun font-bold rounded-lg';
  } else if (size === 'lg') {
    sizeClass = 'px-6 py-3 text-sm sm:text-base font-fun font-black rounded-2xl shadow-retro';
  }

  return (
    <button
      className={`${variantClass} ${sizeClass} ${RETRO_BUTTON_PRESS_CLASS} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};
