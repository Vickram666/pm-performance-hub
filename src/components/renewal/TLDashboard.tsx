import { PMRenewalSummary } from '@/types/renewal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface TLDashboardProps {
  pmSummaries: PMRenewalSummary[];
}

export function TLDashboard({ pmSummaries }: TLDashboardProps) {
  const totalRed = pmSummaries.reduce((sum, pm) => sum + pm.redCount, 0);
  const interventionCount = pmSummaries.filter(pm => pm.interventionRequired).length;
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        
        <Card className={totalRed > 5 ? 'border-red-500/30' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/20">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Red Cases</p>
                <p className="text-2xl font-bold text-red-400">{totalRed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={interventionCount > 0 ? 'border-amber-500/30' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/20">
                <Users className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Intervention Required</p>
                <p className="text-2xl font-bold text-amber-400">{interventionCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PM-wise Renewal Ageing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            PM-wise Renewal Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PM Name</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center">🟢 Green</TableHead>
                <TableHead className="text-center">🟡 Amber</TableHead>
                <TableHead className="text-center">🔴 Red</TableHead>
                <TableHead className="text-center">Completed</TableHead>
                <TableHead className="text-center">Failed</TableHead>
                <TableHead>Health</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pmSummaries.map(pm => {
                const healthPercent = pm.totalRenewals > 0 
                  ? Math.round((pm.greenCount / pm.totalRenewals) * 100) 
                  : 0;
                
                return (
                  <TableRow key={pm.pmId}>
                    <TableCell>
                      <Link 
                        to={`/pm/${pm.pmId}`} 
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {pm.pmName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">{pm.totalRenewals}</TableCell>
                    <TableCell className="text-center text-emerald-400">{pm.greenCount}</TableCell>
                    <TableCell className="text-center text-amber-400">{pm.amberCount}</TableCell>
                    <TableCell className="text-center text-red-400 font-medium">
                      {pm.redCount}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        {pm.completedCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {pm.failedCount > 0 ? (
                        <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                          {pm.failedCount}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <Progress value={healthPercent} className="h-2" />
                        <span className="text-xs text-muted-foreground">{healthPercent}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {pm.interventionRequired ? (
                        <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Needs Review
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          On Track
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
