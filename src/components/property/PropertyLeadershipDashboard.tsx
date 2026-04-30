import { CityPropertyStats } from '@/types/property';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, Building, TrendingUp, TrendingDown, AlertTriangle, 
  StickyNote, Home, Target 
} from 'lucide-react';

interface PropertyLeadershipDashboardProps {
  cityStats: CityPropertyStats[];
  totalProperties: number;
  overallAvgScore: number;
}

export function PropertyLeadershipDashboard({ cityStats, totalProperties, overallAvgScore }: PropertyLeadershipDashboardProps) {
  const totalHighRisk = cityStats.reduce((s, c) => s + c.highRiskCount, 0);
  const totalNotesNotUpdated = cityStats.reduce((s, c) => s + c.notesNotUpdated, 0);
  const totalLateRent = cityStats.reduce((s, c) => s + c.lateRentCount, 0);

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
                <p className="text-sm text-muted-foreground">PAN India Avg Score</p>
                <p className="text-2xl font-bold text-primary">{overallAvgScore}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
                <p className="text-2xl font-bold">{totalProperties}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Risk Properties</p>
                <p className="text-2xl font-bold text-destructive">{totalHighRisk}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/10">
                <StickyNote className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Notes Not Updated</p>
                <p className="text-2xl font-bold text-warning">{totalNotesNotUpdated}</p>
                <p className="text-xs text-muted-foreground">of {totalProperties} properties</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* City-wise Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            City-wise Property Health Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>City</TableHead>
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
              {cityStats.map(city => (
                <TableRow key={city.city}>
                  <TableCell className="font-medium">{city.city}</TableCell>
                  <TableCell className="text-center">{city.totalProperties}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <Progress value={city.avgScore} className="h-2" />
                      <span className={`text-sm font-medium ${
                        city.avgScore >= 70 ? 'text-success' :
                        city.avgScore >= 50 ? 'text-warning' : 'text-destructive'
                      }`}>
                        {city.avgScore}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {city.highRiskCount > 5 ? (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                        {city.highRiskCount}
                      </Badge>
                    ) : (
                      city.highRiskCount
                    )}
                  </TableCell>
                  <TableCell className="text-center text-destructive">{city.lateRentCount}</TableCell>
                  <TableCell className="text-center text-warning">{city.renewalDueCount}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-success">{city.notesUpdated}</span>
                      <span className="text-muted-foreground">/</span>
                      <span>{city.totalProperties}</span>
                      {city.notesNotUpdated > 5 && (
                        <Badge variant="outline" className="ml-1 bg-warning/10 text-warning border-warning/20 text-[10px]">
                          {city.notesNotUpdated} missing
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {city.avgScore >= 70 ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Excellent
                      </Badge>
                    ) : city.avgScore >= 50 ? (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Needs Attention
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
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

      {/* Formula */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>
              <strong>Property Health Score</strong> = Operations (40) + Financial (15) + Customer Experience (25) + Ecosystem (20) = 100 pts
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
