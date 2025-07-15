import React from 'react'
import type { LucideIcon } from 'lucide-react'
import ContentTypeBadge, { type ContentType, CONTENT_TYPE_CONFIG } from './ContentTypeBadge'

interface ContentCardProps {
  type: ContentType
  title: string
  description: string
  children?: React.ReactNode
  className?: string
  onClick?: () => void
  badge?: string
  icon?: LucideIcon
  actions?: React.ReactNode
}

const ContentCard: React.FC<ContentCardProps> = ({
  type,
  title,
  description,
  children,
  className = '',
  onClick,
  badge,
  icon: CustomIcon,
  actions
}) => {
  const config = CONTENT_TYPE_CONFIG[type]
  const Icon = CustomIcon || config.icon

  // Type-specific styling
  const typeStyles = {
    company: 'hover:border-cyan-500/40 hover:shadow-cyan-500/10',
    educational: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
    ai: 'hover:border-violet-500/40 hover:shadow-violet-500/10'
  }

  const iconBgStyles = {
    company: 'bg-cyan-500/10 text-cyan-400',
    educational: 'bg-emerald-500/10 text-emerald-400',
    ai: 'bg-violet-500/10 text-violet-400'
  }

  const isClickable = !!onClick

  return (
    <div 
      className={`
        bg-surface border border-border rounded-xl p-6 transition-all duration-300
        ${typeStyles[type]}
        ${isClickable ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBgStyles[type]}`}>
            <Icon className="w-6 h-6" />
          </div>
          
          {/* Title and Badge */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
              {badge && (
                <span className="text-xs bg-surface-light text-text-secondary px-2 py-1 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <ContentTypeBadge type={type} size="sm" />
          </div>
        </div>
        
        {/* Actions */}
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-text-secondary mb-4 leading-relaxed">
        {description}
      </p>

      {/* Children Content */}
      {children && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  )
}

export default ContentCard