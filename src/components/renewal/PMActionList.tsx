import { RenewalRecord } from '@/types/renewal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RenewalRiskBadge } from './RenewalRiskBadge';
import { AlertTriangle, ChevronRight, Clock, TrendingDown } from 'lucide-react';

interface PMActionListProps {
  needsActionToday: RenewalRecord[];
  onRenewalClick: (renewal: RenewalRecord) => void;
}

export function PMActionList({ needsActionToday, onRenewalClick }: PMActionListProps) {
  if (needsActionToday.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            What Needs Action Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>All caught up! No urgent renewals need your attention.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/30">
      <CardHeader className="pb-3 bg-amber-500/10">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          What Needs Action Today
          <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30 ml-auto">
            {needsActionToday.length} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {needsActionToday.map(renewal => {
            const impact = renewal.scoreImpact;
            const hasImpact = impact.currentPoints < 25;
            
            return (
              <button
                key={renewal.id}
                onClick={() => onRenewalClick(renewal)}
                className="w-full p-4 hover:bg-muted/50 transition-colors text-left flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">{renewal.property.propertyName}</span>
                    <RenewalRiskBadge risk={renewal.status.riskLevel} size="sm" showIcon={false} />
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{renewal.lease.daysToExpiry} days left</span>
                    <span>•</span>
                    <span>{renewal.property.city}</span>
                    {hasImpact && (
                      <>
                        <span>•</span>
                        <span className="flex items-center text-red-400">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          {impact.atRiskMessage}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
