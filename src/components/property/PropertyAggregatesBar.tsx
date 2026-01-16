import { Home, AlertTriangle, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PropertyAggregates } from '@/types/property';
import { cn } from '@/lib/utils';

interface PropertyAggregatesBarProps {
  aggregates: PropertyAggregates;
}

export function PropertyAggregatesBar({ aggregates }: PropertyAggregatesBarProps) {
  const stats = [
    {
      icon: Home,
      label: 'Total Properties',
      value: aggregates.totalProperties,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: null,
      label: 'Avg Score',
      value: aggregates.avgPropertyScore,
      color: aggregates.avgPropertyScore >= 70 ? 'text-success' : aggregates.avgPropertyScore >= 50 ? 'text-warning' : 'text-destructive',
      bgColor: aggregates.avgPropertyScore >= 70 ? 'bg-success/10' : aggregates.avgPropertyScore >= 50 ? 'bg-warning/10' : 'bg-destructive/10',
    },
    {
      icon: AlertTriangle,
      label: 'High Risk',
      value: aggregates.highRiskCount,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      icon: Clock,
      label: 'Renewal Due',
      value: aggregates.renewalDueCount,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      icon: AlertCircle,
      label: 'Late Rent',
      value: aggregates.lateRentCount,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <Card>
      <CardContent className="py-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <div 
              key={stat.label}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg",
                stat.bgColor
              )}
            >
              {stat.icon && <stat.icon className={cn("h-5 w-5", stat.color)} />}
              <div>
                <p className={cn("text-2xl font-bold tabular-nums", stat.color)}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
