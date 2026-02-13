import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  FileText, TrendingUp, Clock, AlertTriangle, XCircle, CheckCircle, 
  Target, Calendar, Users
} from 'lucide-react';
import type { RenewalAnalyticsStats, RenewalRecord } from '@/types/renewal';
import { getAnalyticsStats } from '@/data/renewalData';

interface RenewalAnalyticsDashboardProps {
  stats: RenewalAnalyticsStats;
  renewals: RenewalRecord[];
  cities: string[];
}

const COLORS = [
  'hsl(217, 91%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 
  'hsl(0, 84%, 60%)', 'hsl(262, 83%, 58%)', 'hsl(199, 89%, 48%)',
  'hsl(330, 80%, 60%)', 'hsl(160, 60%, 45%)', 'hsl(45, 90%, 55%)'
];

export function RenewalAnalyticsDashboard({ stats, renewals, cities }: RenewalAnalyticsDashboardProps) {
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterPM, setFilterPM] = useState<string>('all');

  const pms = useMemo(() => {
    const pmSet = new Map<string, string>();
    renewals.forEach(r => pmSet.set(r.property.pmId, r.property.assignedPM));
    return Array.from(pmSet.entries()).map(([id, name]) => ({ id, name }));
  }, [renewals]);

  const filteredStats = useMemo(() => {
    return getAnalyticsStats(renewals, {
      city: filterCity !== 'all' ? filterCity : undefined,
      pmId: filterPM !== 'all' ? filterPM : undefined,
    });
  }, [renewals, filterCity, filterPM]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Filter:</span>
            <Select value={filterCity} onValueChange={setFilterCity}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPM} onValueChange={setFilterPM}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All PMs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All PMs</SelectItem>
                {pms.map(pm => (
                  <SelectItem key={pm.id} value={pm.id}>{pm.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{filteredStats.totalRenewalsDue}</div>
              <div className="text-xs text-muted-foreground">Total Due</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Target className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-500">{filteredStats.renewalPercent}%</div>
              <div className="text-xs text-muted-foreground">Renewal %</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <CheckCircle className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">{filteredStats.onTimeRenewalPercent}%</div>
              <div className="text-xs text-muted-foreground">On-Time %</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <Clock className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{filteredStats.avgDaysToClose}</div>
              <div className="text-xs text-muted-foreground">Avg Days</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-500">{filteredStats.renewalsInRiskZone}</div>
              <div className="text-xs text-muted-foreground">At Risk</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">{filteredStats.failedRenewalsPercent}%</div>
              <div className="text-xs text-muted-foreground">Failed %</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage-wise Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart className="h-4 w-4 text-primary" />
              Stage-wise Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredStats.stageDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis 
                    dataKey="stage" 
                    type="category" 
                    width={120}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Month-wise Renewal % */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Month-wise Renewal %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredStats.monthlyRenewalPercent}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[50, 100]}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Renewal %']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="percent" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PM-wise Renewal % */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            PM-wise Renewal %
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PM Name</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">Completed</TableHead>
                <TableHead>Renewal %</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStats.pmWiseRenewalPercent.map((pm) => (
                <TableRow key={pm.pmName}>
                  <TableCell className="font-medium">{pm.pmName}</TableCell>
                  <TableCell className="text-center">{pm.total}</TableCell>
                  <TableCell className="text-center text-emerald-500">{pm.completed}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <Progress value={pm.percent} className="h-2" />
                      <span className={`text-sm font-medium ${
                        pm.percent >= 80 ? 'text-emerald-500' :
                        pm.percent >= 60 ? 'text-amber-500' : 'text-red-500'
                      }`}>
                        {pm.percent}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {pm.percent >= 80 ? (
                      <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                        Excellent
                      </Badge>
                    ) : pm.percent >= 60 ? (
                      <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                        Needs Work
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                        Critical
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Renewal % Formula */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>
              <strong>Renewal %</strong> = (Renewals Successfully Completed ÷ Total Eligible Renewals) × 100 
              <span className="ml-2 text-xs">(Excludes force-terminated & owner exit cases)</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
