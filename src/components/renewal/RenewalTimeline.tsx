import { useMemo } from 'react';
import { RenewalRecord } from '@/types/renewal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Clock } from 'lucide-react';
import { parseISO, differenceInDays, format } from 'date-fns';
import { cn } from '@/lib/utils';

interface RenewalTimelineProps {
  renewals: RenewalRecord[];
  onRenewalClick: (renewal: RenewalRecord) => void;
}

export function RenewalTimeline({ renewals, onRenewalClick }: RenewalTimelineProps) {
  const activeRenewals = useMemo(() => 
    renewals
      .filter(r => r.status.currentStage !== 'renewal_completed' && r.status.currentStage !== 'renewal_failed')
      .sort((a, b) => a.lease.daysToExpiry - b.lease.daysToExpiry)
      .slice(0, 20),
    [renewals]
  );

  if (activeRenewals.length === 0) return null;

  const maxDays = Math.max(...activeRenewals.map(r => r.lease.daysToExpiry), 90);

  const buckets = [
    { label: '0-15 days', min: 0, max: 15, color: 'bg-destructive', textColor: 'text-destructive' },
    { label: '16-30 days', min: 16, max: 30, color: 'bg-warning', textColor: 'text-warning' },
    { label: '31-60 days', min: 31, max: 60, color: 'bg-info', textColor: 'text-info' },
    { label: '60+ days', min: 61, max: Infinity, color: 'bg-success', textColor: 'text-success' },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-5 w-5 text-primary" />
          Renewal Timeline
          <Badge variant="outline" className="text-xs ml-auto">
            {activeRenewals.length} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4">
          {buckets.map(b => (
            <div key={b.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className={cn('w-3 h-3 rounded-sm', b.color)} />
              {b.label}
            </div>
          ))}
        </div>

        {/* Gantt bars */}
        <div className="space-y-1.5">
          {activeRenewals.map(renewal => {
            const pct = Math.min((renewal.lease.daysToExpiry / maxDays) * 100, 100);
            const bucket = buckets.find(b => renewal.lease.daysToExpiry >= b.min && renewal.lease.daysToExpiry <= b.max) || buckets[3];

            return (
              <Tooltip key={renewal.id}>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center gap-2 cursor-pointer group hover:bg-muted/50 rounded-md p-1 transition-colors"
                    onClick={() => onRenewalClick(renewal)}
                  >
                    <div className="w-[120px] shrink-0 truncate text-xs font-medium">
                      {renewal.property.propertyName.split(' ').slice(0, 2).join(' ')}
                    </div>
                    <div className="flex-1 h-6 bg-muted/50 rounded-full overflow-hidden relative">
                      <div
                        className={cn('h-full rounded-full transition-all flex items-center justify-end pr-2', bucket.color, 'opacity-80 group-hover:opacity-100')}
                        style={{ width: `${Math.max(pct, 8)}%` }}
                      >
                        <span className="text-[10px] font-bold text-white drop-shadow-sm">
                          {renewal.lease.daysToExpiry}d
                        </span>
                      </div>
                    </div>
                    <div className="w-[60px] shrink-0 text-right">
                      <Badge variant="outline" className={cn('text-[10px]', bucket.textColor)}>
                        {renewal.status.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="text-xs space-y-1">
                    <p className="font-semibold">{renewal.property.propertyName}</p>
                    <p>Lease End: {format(parseISO(renewal.lease.leaseEndDate), 'dd MMM yyyy')}</p>
                    <p>Stage: {renewal.status.currentStage.replace(/_/g, ' ')}</p>
                    <p>PM: {renewal.property.assignedPM}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
