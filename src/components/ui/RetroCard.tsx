import React from 'react';
import { RETRO_CARD_CLASS } from './retroTokens';

export interface RetroCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'modal' | 'panel' | 'subtle';
  className?: string;
  children: React.ReactNode;
}

export const RetroCard: React.FC<RetroCardProps> = ({
  variant = 'panel',
  className = '',
  children,
  ...props
}) => {
  let variantStyle = RETRO_CARD_CLASS;

  if (variant === 'modal') {
    variantStyle = 'bg-[#FDFBF7] border-2 border-slate-900 rounded-3xl shadow-retro-xl text-slate-900 animate-in zoom-in-95 duration-200';
  } else if (variant === 'subtle') {
    variantStyle = 'bg-[#FDFBF7] border-2 border-slate-900 rounded-2xl shadow-retro text-slate-900';
  }

  return (
    <div className={`${variantStyle} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};
