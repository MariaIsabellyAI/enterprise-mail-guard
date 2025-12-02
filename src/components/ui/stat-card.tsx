import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'accent';
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

const variantStyles = {
  default: 'bg-card border-border',
  primary: 'bg-primary-light border-primary/20',
  success: 'bg-success-light border-success/20',
  warning: 'bg-warning-light border-warning/20',
  accent: 'bg-accent-light border-accent/20',
};

const iconStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  accent: 'bg-accent/10 text-accent',
};

export function StatCard({ title, value, icon, variant = 'default', trend, className }: StatCardProps) {
  return (
    <div className={cn(
      "stat-card border animate-fade-in",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className={cn(
              "text-sm font-medium",
              trend.value >= 0 ? "text-success" : "text-destructive"
            )}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          iconStyles[variant]
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
