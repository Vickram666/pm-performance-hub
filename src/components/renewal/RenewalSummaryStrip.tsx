import { Card, CardContent } from '@/components/ui/card';
import { RenewalFunnelStats } from '@/types/renewal';
import { FileText, AlertTriangle, Clock, CheckCircle, TrendingUp, Calendar } from 'lucide-react';

interface RenewalSummaryStripProps {
  stats: RenewalFunnelStats;
}

export function RenewalSummaryStrip({ stats }: RenewalSummaryStripProps) {
  const completedRate = stats.total > 0 
    ? Math.round((stats.byStage.renewal_completed / stats.total) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total Renewals</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-500/30">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-500">{stats.byRisk.green}</div>
            <div className="text-xs text-muted-foreground">Green</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-500/30">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-500">{stats.byRisk.amber}</div>
            <div className="text-xs text-muted-foreground">Amber</div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-500/30">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">{stats.byRisk.red}</div>
            <div className="text-xs text-muted-foreground">Red</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.avgDaysLeft}</div>
            <div className="text-xs text-muted-foreground">Avg Days Left</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/10">
            <TrendingUp className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <div className="text-xs text-muted-foreground">Renewal Rate</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
