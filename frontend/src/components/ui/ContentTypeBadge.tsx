import React from 'react'
import { BarChart3, BookOpen, Brain } from 'lucide-react'

export type ContentType = 'company' | 'educational' | 'ai'

interface ContentTypeBadgeProps {
  type: ContentType
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  showText?: boolean
  className?: string
}

export const CONTENT_TYPE_CONFIG = {
  company: {
    icon: BarChart3,
    label: 'Datos Empresa',
    shortLabel: 'Empresa',
    bgColor: 'bg-cyan-500/10',
    textColor: 'text-cyan-600',
    borderColor: 'border-cyan-500/30',
    dotColor: 'bg-cyan-500'
  },
  educational: {
    icon: BookOpen,
    label: 'Contenido Educativo',
    shortLabel: 'Educativo',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-500/30',
    dotColor: 'bg-emerald-500'
  },
  ai: {
    icon: Brain,
    label: 'Análisis IA',
    shortLabel: 'IA',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-500/30',
    dotColor: 'bg-purple-500'
  }
}

export const ContentTypeBadge: React.FC<ContentTypeBadgeProps> = ({
  type,
  size = 'md',
  showIcon = true,
  showText = true,
  className = ''
}) => {
  const typeConfig = CONTENT_TYPE_CONFIG[type] || CONTENT_TYPE_CONFIG.company
  const IconComponent = typeConfig.icon

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
      dot: 'w-1.5 h-1.5'
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      dot: 'w-2 h-2'
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      dot: 'w-2.5 h-2.5'
    }
  }

  const currentSize = sizeClasses[size]

  return (
    <div 
      className={`inline-flex items-center space-x-1.5 ${typeConfig.bgColor} ${typeConfig.textColor} ${typeConfig.borderColor} border rounded-full ${currentSize.container} font-medium ${className}`}
    >
      {showIcon && (
        <IconComponent className={currentSize.icon} />
      )}
      {showText && (
        <span>{size === 'sm' ? typeConfig.shortLabel : typeConfig.label}</span>
      )}
      {!showIcon && !showText && (
        <div className={`${typeConfig.dotColor} ${currentSize.dot} rounded-full`}></div>
      )}
    </div>
  )
}

export default ContentTypeBadge