import React from 'react';
import { cn } from '../../utils/cn';

interface ContentSectionProps {
  type: 'educational' | 'business' | 'ai';
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  type,
  children,
  className,
  title,
  icon
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'educational':
        return {
          container: 'border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-500/5 to-transparent',
          header: 'text-emerald-400 border-emerald-500/20',
          accent: 'text-emerald-500'
        };
      case 'business':
        return {
          container: 'border-l-4 border-l-cyan-500 bg-gradient-to-r from-cyan-500/5 to-transparent',
          header: 'text-cyan-400 border-cyan-500/20',
          accent: 'text-cyan-500'
        };
      case 'ai':
        return {
          container: 'border-l-4 border-l-violet-500 bg-gradient-to-r from-violet-500/5 to-transparent',
          header: 'text-violet-400 border-violet-500/20',
          accent: 'text-violet-500'
        };
      default:
        return {
          container: '',
          header: '',
          accent: ''
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={cn(
      'rounded-lg p-4 transition-all duration-300',
      styles.container,
      className
    )}>
      {title && (
        <div className={cn(
          'flex items-center gap-2 mb-3 pb-2 border-b',
          styles.header
        )}>
          {icon && (
            <span className={cn('text-lg', styles.accent)}>
              {icon}
            </span>
          )}
          <h3 className="font-medium text-sm uppercase tracking-wide">
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
};