import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'cyan';
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50/80',
    icon: 'text-blue-600',
    border: 'border-blue-100',
    accent: 'bg-blue-500'
  },
  emerald: {
    bg: 'bg-emerald-50/80',
    icon: 'text-emerald-600',
    border: 'border-emerald-100',
    accent: 'bg-emerald-500'
  },
  amber: {
    bg: 'bg-amber-50/80',
    icon: 'text-amber-600',
    border: 'border-amber-100',
    accent: 'bg-amber-500'
  },
  rose: {
    bg: 'bg-rose-50/80',
    icon: 'text-rose-600',
    border: 'border-rose-100',
    accent: 'bg-rose-500'
  },
  indigo: {
    bg: 'bg-indigo-50/80',
    icon: 'text-indigo-600',
    border: 'border-indigo-100',
    accent: 'bg-indigo-500'
  },
  cyan: {
    bg: 'bg-sky-50/80',
    icon: 'text-sky-600',
    border: 'border-sky-100',
    accent: 'bg-sky-500'
  }
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'blue'
}) => {
  const scheme = colorVariants[colorScheme];

  return (
    <div className={`relative overflow-hidden bg-white rounded-2xl p-5 border ${scheme.border} shadow-soft-sm hover:shadow-soft-md transition-all`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
          </div>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl ${scheme.bg} flex items-center justify-center ${scheme.icon} shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-medium">
          <span className={trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
            {trend.value}
          </span>
          <span className="text-slate-400 ml-1.5">vs last week</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;
