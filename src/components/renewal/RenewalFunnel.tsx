import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RenewalFunnelStats, RENEWAL_STAGE_LABELS, RenewalStage } from '@/types/renewal';
import { TrendingUp, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface RenewalFunnelProps {
  stats: RenewalFunnelStats;
  onBucketClick?: (bucket: string) => void;
}

export function RenewalFunnel({ stats, onBucketClick }: RenewalFunnelProps) {
  const expiryBuckets = [
    { 
      key: 'critical', 
      label: '0-15 Days', 
      count: stats.byExpiryBucket.critical, 
      color: 'bg-red-500',
      textColor: 'text-red-400',
      icon: XCircle 
    },
    { 
      key: 'urgent', 
      label: '16-30 Days', 
      count: stats.byExpiryBucket.urgent, 
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      icon: AlertTriangle 
    },
    { 
      key: 'upcoming', 
      label: '31-45 Days', 
      count: stats.byExpiryBucket.upcoming, 
      color: 'bg-blue-500',
      textColor: 'text-blue-400',
      icon: Clock 
    },
    { 
      key: 'safe', 
      label: '45+ Days', 
      count: stats.byExpiryBucket.safe, 
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      icon: CheckCircle 
    },
  ];

  const riskCounts = [
    { key: 'green', label: 'Green', count: stats.byRisk.green, color: 'bg-emerald-500' },
    { key: 'amber', label: 'Amber', count: stats.byRisk.amber, color: 'bg-amber-500' },
    { key: 'red', label: 'Red', count: stats.byRisk.red, color: 'bg-red-500' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Expiry Buckets */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Properties Expiring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {expiryBuckets.map(bucket => (
              <button
                key={bucket.key}
                onClick={() => onBucketClick?.(bucket.key)}
                className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-center"
              >
                <bucket.icon className={`h-6 w-6 mx-auto mb-2 ${bucket.textColor}`} />
                <div className={`text-2xl font-bold ${bucket.textColor}`}>
                  {bucket.count}
                </div>
                <div className="text-xs text-muted-foreground">{bucket.label}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Distribution & Conversion */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Conversion Rate */}
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Conversion Rate</span>
              <span className="text-xl font-bold text-primary">{stats.conversionRate}%</span>
            </div>
            <Progress value={stats.conversionRate} className="h-2" />
          </div>

          {/* Risk Distribution */}
          <div>
            <div className="text-sm text-muted-foreground mb-2">Risk Distribution</div>
            <div className="space-y-2">
              {riskCounts.map(risk => (
                <div key={risk.key} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${risk.color}`} />
                  <span className="text-sm flex-1">{risk.label}</span>
                  <span className="font-medium">{risk.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Active</span>
              <span className="font-bold">{stats.total}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
