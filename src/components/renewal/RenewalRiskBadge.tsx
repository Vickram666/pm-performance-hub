import { Badge } from '@/components/ui/badge';
import { RiskLevel } from '@/types/renewal';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface RenewalRiskBadgeProps {
  risk: RiskLevel;
  showIcon?: boolean;
  size?: 'sm' | 'default';
}

export function RenewalRiskBadge({ risk, showIcon = true, size = 'default' }: RenewalRiskBadgeProps) {
  const config = {
    green: {
      label: 'Green',
      className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle,
    },
    amber: {
      label: 'Amber',
      className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
    },
    red: {
      label: 'Red',
      className: 'bg-red-500/20 text-red-400 border-red-500/30',
      icon: XCircle,
    },
  };

  const { label, className, icon: Icon } = config[risk];

  return (
    <Badge 
      variant="outline" 
      className={`${className} ${size === 'sm' ? 'text-xs px-1.5 py-0' : ''}`}
    >
      {showIcon && <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} mr-1`} />}
      {label}
    </Badge>
  );
}
