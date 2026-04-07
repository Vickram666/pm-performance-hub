import { LeadershipRenewalStats } from '@/types/renewal';
import { PMLeaderboardEntry } from '@/types/leaderboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer, FileText, AlertTriangle, TrendingDown, Building, Users } from 'lucide-react';

interface LeadershipExportViewProps {
  stats: LeadershipRenewalStats;
  bottomPMs: PMLeaderboardEntry[];
}

export function LeadershipExportView({ stats, bottomPMs }: LeadershipExportViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Print Header */}
      <div className="flex items-center justify-between print:block">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary print:hidden" />
            Weekly Leadership Digest
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generated {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 print:hidden" onClick={handlePrint}>
          <Printer className="h-4 w-4" />
          Print Digest
        </Button>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:grid-cols-4">
        {[
          { label: 'PAN India Renewal Rate', value: `${stats.panIndiaRenewalRate}%`, highlight: stats.panIndiaRenewalRate >= 80 },
          { label: 'Active Renewals', value: stats.totalActiveRenewals },
          { label: 'Completed', value: stats.totalCompleted },
          { label: 'Churn Rate', value: `${stats.churnRate}%`, danger: stats.churnRate > 10 },
        ].map(kpi => (
          <Card key={kpi.label} className="print:border print:shadow-none">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground">{kpi.label}</div>
              <div className={`text-2xl font-bold mt-1 ${kpi.danger ? 'text-destructive' : kpi.highlight ? 'text-success' : ''}`}>
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* City Red Cases */}
      <Card className="print:border print:shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Building className="h-4 w-4 text-primary" />
            City-wise Red Renewals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>City</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">🔴 Red Cases</TableHead>
                <TableHead className="text-center">Renewal Rate</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.cityStats.map(city => (
                <TableRow key={city.city}>
                  <TableCell className="font-medium">{city.city}</TableCell>
                  <TableCell className="text-center">{city.totalRenewals}</TableCell>
                  <TableCell className="text-center">
                    {city.redCases > 3 ? (
                      <Badge variant="destructive" className="text-xs">{city.redCases}</Badge>
                    ) : city.redCases}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={city.renewalRate >= 80 ? 'text-success' : city.renewalRate >= 70 ? 'text-warning' : 'text-destructive'}>
                      {city.renewalRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {city.renewalRate < 70 && (
                      <Badge variant="outline" className="text-destructive text-xs gap-1">
                        <AlertTriangle className="h-3 w-3" /> Needs Review
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bottom 10 PMs */}
      <Card className="print:border print:shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-destructive" />
            Bottom 10 PMs — Requires Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>PM Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Payout</TableHead>
                <TableHead className="text-center">Portfolio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bottomPMs.slice(0, 10).map(pm => (
                <TableRow key={pm.id}>
                  <TableCell className="text-muted-foreground">#{pm.rank}</TableCell>
                  <TableCell className="font-medium">{pm.name}</TableCell>
                  <TableCell>{pm.city}</TableCell>
                  <TableCell className="text-center">
                    <span className={pm.propertyScore < 60 ? 'text-destructive font-bold' : 'text-warning font-bold'}>
                      {pm.propertyScore.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={pm.incentiveStatus === 'blocked' ? 'destructive' : 'outline'} className="text-xs">
                      {pm.payoutBand}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{pm.portfolioSize}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
