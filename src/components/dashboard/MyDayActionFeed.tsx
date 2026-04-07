import { Link } from 'react-router-dom';
import { 
  AlertTriangle, Clock, DollarSign, Star, RefreshCw, 
  ArrowRight, Zap, CheckCircle2, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Property } from '@/types/property';
import { RenewalRecord } from '@/types/renewal';
import { cn } from '@/lib/utils';

interface ActionItem {
  id: string;
  type: 'renewal_red' | 'late_rent' | 'low_rating' | 'pending_report' | 'renewal_expiring';
  title: string;
  subtitle: string;
  impact: string;
  urgency: 'critical' | 'high' | 'medium';
  link: string;
}

interface MyDayActionFeedProps {
  properties: Property[];
  renewals: RenewalRecord[];
}

function deriveActions(properties: Property[], renewals: RenewalRecord[]): ActionItem[] {
  const actions: ActionItem[] = [];

  // Red risk renewals
  const redRenewals = renewals.filter(
    r => r.status.riskLevel === 'red' && 
    r.status.currentStage !== 'renewal_completed' && 
    r.status.currentStage !== 'renewal_failed'
  );
  redRenewals.forEach(r => {
    actions.push({
      id: `renewal-red-${r.id}`,
      type: 'renewal_red',
      title: `${r.property.propertyName} — Renewal Critical`,
      subtitle: `${r.lease.daysToExpiry} days left • ${r.property.city}`,
      impact: '-15 pts if move-out',
      urgency: 'critical',
      link: '/renewals',
    });
  });

  // Late rent properties
  const lateRent = properties.filter(p => !p.financial.onTimeRent && p.basic.tenantStatus === 'occupied');
  if (lateRent.length > 0) {
    const worst = lateRent.sort((a, b) => b.financial.lateDays - a.financial.lateDays).slice(0, 3);
    worst.forEach(p => {
      actions.push({
        id: `late-rent-${p.basic.propertyId}`,
        type: 'late_rent',
        title: `${p.basic.propertyName} — Rent ${p.financial.lateDays}d Late`,
        subtitle: `Owner: ${p.basic.ownerName}`,
        impact: `Recover ~${Math.min(p.financial.lateDays * 0.5, 5).toFixed(1)} pts`,
        urgency: p.financial.lateDays > 10 ? 'critical' : 'high',
        link: '/properties',
      });
    });
  }

  // Low owner rating
  const lowRating = properties.filter(p => p.customerExperience.ownerRating < 3.5);
  if (lowRating.length > 0) {
    actions.push({
      id: 'low-rating-group',
      type: 'low_rating',
      title: `${lowRating.length} properties with low owner rating`,
      subtitle: `Avg rating: ${(lowRating.reduce((s, p) => s + p.customerExperience.ownerRating, 0) / lowRating.length).toFixed(1)}`,
      impact: 'Affects CX pillar score',
      urgency: 'medium',
      link: '/properties',
    });
  }

  // Pending reports
  const pendingReports = properties.filter(
    p => !p.operational.moveInReportCompleted || !p.operational.moveOutReportCompleted
  );
  if (pendingReports.length > 3) {
    actions.push({
      id: 'pending-reports',
      type: 'pending_report',
      title: `${pendingReports.length} pending move-in/out reports`,
      subtitle: 'Complete to boost Operations score',
      impact: `Recover ~${Math.min(pendingReports.length * 0.3, 4).toFixed(1)} pts`,
      urgency: 'medium',
      link: '/properties',
    });
  }

  // Renewals expiring within 30 days (amber)
  const amberRenewals = renewals.filter(
    r => r.status.riskLevel === 'amber' && 
    r.status.currentStage !== 'renewal_completed' && 
    r.status.currentStage !== 'renewal_failed'
  );
  if (amberRenewals.length > 0) {
    actions.push({
      id: 'renewal-amber',
      type: 'renewal_expiring',
      title: `${amberRenewals.length} renewals approaching deadline`,
      subtitle: 'Act now to avoid Red status',
      impact: '-5 pts per late initiation',
      urgency: 'high',
      link: '/renewals',
    });
  }

  return actions.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2 };
    return order[a.urgency] - order[b.urgency];
  });
}

const urgencyConfig = {
  critical: { bg: 'bg-destructive/10', border: 'border-destructive/30', dot: 'bg-destructive', text: 'text-destructive' },
  high: { bg: 'bg-warning/10', border: 'border-warning/30', dot: 'bg-warning', text: 'text-warning' },
  medium: { bg: 'bg-info/10', border: 'border-info/30', dot: 'bg-info', text: 'text-info' },
};

const typeIcons = {
  renewal_red: AlertTriangle,
  late_rent: DollarSign,
  low_rating: Star,
  pending_report: FileText,
  renewal_expiring: Clock,
};

export function MyDayActionFeed({ properties, renewals }: MyDayActionFeedProps) {
  const actions = deriveActions(properties, renewals);

  if (actions.length === 0) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="py-6 flex items-center justify-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-success" />
          <div>
            <p className="font-semibold text-success">All clear! No urgent actions today.</p>
            <p className="text-sm text-muted-foreground">Keep up the great work 🎉</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Today's Priority Actions</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {actions.length} {actions.length === 1 ? 'item' : 'items'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.slice(0, 6).map(action => {
          const config = urgencyConfig[action.urgency];
          const Icon = typeIcons[action.type];
          return (
            <Link key={action.id} to={action.link}>
              <div className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm hover:-translate-y-0.5 cursor-pointer',
                config.bg, config.border
              )}>
                <div className={cn('p-2 rounded-lg', config.bg)}>
                  <Icon className={cn('h-4 w-4', config.text)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    {action.impact}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
