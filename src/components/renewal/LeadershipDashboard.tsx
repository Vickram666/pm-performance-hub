import { LeadershipRenewalStats } from '@/types/renewal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  XCircle,
  Building,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LeadershipDashboardProps {
  stats: LeadershipRenewalStats;
}

export function LeadershipDashboard({ stats }: LeadershipDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PAN India Renewal Rate</p>
                <p className="text-2xl font-bold text-primary">{stats.panIndiaRenewalRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Building className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Renewals</p>
                <p className="text-2xl font-bold">{stats.totalActiveRenewals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/20">
                <CheckCircle className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-emerald-400">{stats.totalCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/20">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Churn (Failed)</p>
                <p className="text-2xl font-bold text-red-400">{stats.totalFailed}</p>
                <p className="text-xs text-muted-foreground">{stats.churnRate}% churn rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Monthly Renewal Rate Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  domain={[60, 100]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value}%`, 'Renewal Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* City-wise Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            City-wise Renewal Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>City</TableHead>
                <TableHead className="text-center">Total Renewals</TableHead>
                <TableHead className="text-center">Completed</TableHead>
                <TableHead className="text-center">Failed</TableHead>
                <TableHead className="text-center">🔴 Red Cases</TableHead>
                <TableHead>Renewal Rate</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.cityStats.map(city => (
                <TableRow key={city.city}>
                  <TableCell className="font-medium">{city.city}</TableCell>
                  <TableCell className="text-center">{city.totalRenewals}</TableCell>
                  <TableCell className="text-center text-emerald-400">{city.completedCount}</TableCell>
                  <TableCell className="text-center text-red-400">{city.failedCount}</TableCell>
                  <TableCell className="text-center">
                    {city.redCases > 5 ? (
                      <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                        {city.redCases}
                      </Badge>
                    ) : (
                      city.redCases
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <Progress 
                        value={city.renewalRate} 
                        className="h-2"
                      />
                      <span className={`text-sm font-medium ${
                        city.renewalRate >= 85 ? 'text-emerald-400' :
                        city.renewalRate >= 70 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {city.renewalRate}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {city.renewalRate >= 85 ? (
                      <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Excellent
                      </Badge>
                    ) : city.renewalRate >= 70 ? (
                      <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Needs Attention
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                        <TrendingDown className="h-3 w-3 mr-1" />
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
    </div>
  );
}
