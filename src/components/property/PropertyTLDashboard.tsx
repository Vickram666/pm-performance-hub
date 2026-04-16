import { PMPropertySummary } from '@/types/property';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, AlertTriangle, CheckCircle, TrendingUp, StickyNote } from 'lucide-react';

interface PropertyTLDashboardProps {
  pmSummaries: PMPropertySummary[];
}

export function PropertyTLDashboard({ pmSummaries }: PropertyTLDashboardProps) {
  const totalHighRisk = pmSummaries.reduce((sum, pm) => sum + pm.highRiskCount, 0);
  const interventionCount = pmSummaries.filter(pm => pm.interventionRequired).length;
  const totalWithoutNotes = pmSummaries.reduce((sum, pm) => sum + pm.propertiesWithoutNotes, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total PMs</p>
                <p className="text-2xl font-bold">{pmSummaries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={totalHighRisk > 5 ? 'border-destructive/30' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-destructive/20">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total High Risk</p>
                <p className="text-2xl font-bold text-destructive">{totalHighRisk}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={interventionCount > 0 ? 'border-warning/30' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/20">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Needs Intervention</p>
                <p className="text-2xl font-bold text-warning">{interventionCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/20">
                <StickyNote className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">No Notes Updated</p>
                <p className="text-2xl font-bold text-amber-500">{totalWithoutNotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            PM-wise Property Score Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PM Name</TableHead>
                <TableHead className="text-center">Properties</TableHead>
                <TableHead>Avg Score</TableHead>
                <TableHead className="text-center">🔴 High Risk</TableHead>
                <TableHead className="text-center">Late Rent</TableHead>
                <TableHead className="text-center">Renewal Due</TableHead>
                <TableHead className="text-center">Notes Updated</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pmSummaries.map(pm => (
                <TableRow key={pm.pmId}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{pm.pmName}</p>
                      <p className="text-xs text-muted-foreground">{pm.city}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{pm.totalProperties}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Progress value={pm.avgScore} className="h-2" />
                      <span className={`text-sm font-medium ${
                        pm.avgScore >= 70 ? 'text-success' :
                        pm.avgScore >= 50 ? 'text-warning' : 'text-destructive'
                      }`}>
                        {pm.avgScore}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {pm.highRiskCount > 3 ? (
                      <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">
                        {pm.highRiskCount}
                      </Badge>
                    ) : (
                      <span className={pm.highRiskCount > 0 ? 'text-destructive' : 'text-muted-foreground'}>{pm.highRiskCount}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-destructive">{pm.lateRentCount}</TableCell>
                  <TableCell className="text-center text-warning">{pm.renewalDueCount}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-success">{pm.totalProperties - pm.propertiesWithoutNotes}</span>
                      <span className="text-muted-foreground">/</span>
                      <span>{pm.totalProperties}</span>
                      {pm.propertiesWithoutNotes > 3 && (
                        <Badge variant="outline" className="ml-1 bg-amber-500/20 text-amber-500 border-amber-500/30 text-[10px]">
                          {pm.propertiesWithoutNotes} missing
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {pm.interventionRequired ? (
                      <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Needs Review
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        On Track
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
