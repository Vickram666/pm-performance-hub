import { useMemo } from 'react';
import { Lightbulb, AlertTriangle, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { RenewalRecord } from '@/types/renewal';
import { Property } from '@/types/property';
import { cn } from '@/lib/utils';

interface SmartNudge {
  id: string;
  icon: typeof Lightbulb;
  message: string;
  type: 'warning' | 'opportunity' | 'info';
}

interface SmartNotificationsProps {
  renewals: RenewalRecord[];
  properties: Property[];
  currentScore: number;
}

export function SmartNotifications({ renewals, properties, currentScore }: SmartNotificationsProps) {
  const nudges = useMemo(() => {
    const result: SmartNudge[] = [];

    // Renewals entering red zone this week
    const nearRed = renewals.filter(
      r => r.lease.daysToExpiry <= 35 && r.lease.daysToExpiry > 25 && 
      r.status.riskLevel !== 'green' &&
      r.status.currentStage !== 'renewal_completed' &&
      r.status.currentStage !== 'renewal_failed'
    );
    if (nearRed.length > 0) {
      result.push({
        id: 'near-red',
        icon: AlertTriangle,
        message: `${nearRed.length} renewal${nearRed.length > 1 ? 's' : ''} entering Red zone this week — act now to avoid -15 pt penalty`,
        type: 'warning',
      });
    }

    // Late rent impact
    const lateRentProps = properties.filter(p => !p.financial.onTimeRent && p.basic.tenantStatus === 'occupied');
    if (lateRentProps.length > 0) {
      const potentialGain = Math.min(lateRentProps.length * 0.8, 6);
      result.push({
        id: 'late-rent-nudge',
        icon: DollarSign,
        message: `Fixing late rent on ${lateRentProps.length} properties could boost your score by +${potentialGain.toFixed(1)} pts`,
        type: 'opportunity',
      });
    }

    // Payout band proximity
    const nextBand = currentScore < 60 ? 60 : currentScore < 70 ? 70 : currentScore < 80 ? 80 : null;
    if (nextBand && (nextBand - currentScore) <= 5) {
      result.push({
        id: 'payout-proximity',
        icon: TrendingUp,
        message: `You're only ${(nextBand - currentScore).toFixed(1)} pts from the next payout band (${nextBand === 80 ? '100%' : nextBand === 70 ? '75%' : '50%'} payout)!`,
        type: 'opportunity',
      });
    }

    // Pending reports impact
    const pendingInspections = properties.filter(p => p.operational.inspectionStatus === 'pending');
    if (pendingInspections.length >= 5) {
      result.push({
        id: 'inspections',
        icon: Clock,
        message: `${pendingInspections.length} pending property inspections — completing these strengthens your Operations score`,
        type: 'info',
      });
    }

    return result.slice(0, 4);
  }, [renewals, properties, currentScore]);

  if (nudges.length === 0) return null;

  const typeStyles = {
    warning: 'border-warning/30 bg-warning/5',
    opportunity: 'border-success/30 bg-success/5',
    info: 'border-info/30 bg-info/5',
  };

  const iconStyles = {
    warning: 'text-warning',
    opportunity: 'text-success',
    info: 'text-info',
  };

  return (
    <div className="space-y-1.5">
      {nudges.map(nudge => {
        const Icon = nudge.icon;
        return (
          <div key={nudge.id} className={cn('flex items-start gap-2.5 p-2.5 rounded-lg border', typeStyles[nudge.type])}>
            <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', iconStyles[nudge.type])} />
            <p className="text-sm">{nudge.message}</p>
          </div>
        );
      })}
    </div>
  );
}
