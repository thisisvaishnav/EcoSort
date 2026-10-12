import React from 'react';
import { RetroCard } from './RetroCard';

export interface RetroModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  backdropClassName?: string;
  children: React.ReactNode;
  'data-testid'?: string;
}

export const RetroModal: React.FC<RetroModalProps> = ({
  isOpen = true,
  onClose,
  className = '',
  backdropClassName = '',
  children,
  'data-testid': testId,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150 ${backdropClassName}`.trim()}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
      data-testid={testId}
    >
      <RetroCard
        variant="modal"
        className={`p-6 max-h-[85vh] flex flex-col ${className}`.trim()}
      >
        {children}
      </RetroCard>
    </div>
  );
};
