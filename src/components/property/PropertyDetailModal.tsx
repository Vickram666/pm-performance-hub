import { 
  X, Settings, DollarSign, Users, Leaf, AlertTriangle, 
  CheckCircle, ArrowRight, Home, User, Calendar
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Property } from '@/types/property';
import { cn } from '@/lib/utils';

interface PropertyDetailModalProps {
  property: Property | null;
  open: boolean;
  onClose: () => void;
}

export function PropertyDetailModal({ property, open, onClose }: PropertyDetailModalProps) {
  if (!property) return null;

  const pillars = [
    {
      name: 'Operations',
      icon: Settings,
      score: property.scoreBreakdown.operations,
      max: 40,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500',
    },
    {
      name: 'Financial',
      icon: DollarSign,
      score: property.scoreBreakdown.financial,
      max: 15,
      color: property.scoreBreakdown.financial < 0 ? 'text-destructive' : 'text-green-500',
      bgColor: property.scoreBreakdown.financial < 0 ? 'bg-destructive' : 'bg-green-500',
    },
    {
      name: 'Customer',
      icon: Users,
      score: property.scoreBreakdown.customerExperience,
      max: 25,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500',
    },
    {
      name: 'Ecosystem',
      icon: Leaf,
      score: property.scoreBreakdown.ecosystem,
      max: 20,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500',
    },
  ];

  const issuesByCategory = {
    operations: property.issues.filter(i => i.category === 'operations'),
    financial: property.issues.filter(i => i.category === 'financial'),
    customer: property.issues.filter(i => i.category === 'customer'),
    ecosystem: property.issues.filter(i => i.category === 'ecosystem'),
  };

  const totalRecoveryPoints = property.issues.reduce((sum, i) => sum + i.recoveryPoints, 0);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Home className="h-5 w-5 text-primary" />
            <div>
              <span className="text-lg">{property.basic.propertyName}</span>
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({property.basic.propertyId})
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Basic Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{property.basic.ownerName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Zone:</span> {property.basic.zone}
          </div>
          <div>
            <Badge variant={property.basic.tenantStatus === 'occupied' ? 'default' : 'secondary'}>
              {property.basic.tenantStatus}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Lease: {property.retention.daysToLeaseEnd}d left</span>
          </div>
        </div>

        <Separator />

        {/* Health Score Summary */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <p className="text-sm text-muted-foreground">Property Health Score</p>
            <p className={cn(
              "text-4xl font-bold",
              property.healthScore >= 70 && "text-success",
              property.healthScore >= 50 && property.healthScore < 70 && "text-warning",
              property.healthScore < 50 && "text-destructive"
            )}>
              {property.healthScore}
              <span className="text-lg font-normal text-muted-foreground">/100</span>
            </p>
          </div>
          <Badge 
            variant={property.riskLevel === 'low' ? 'default' : property.riskLevel === 'medium' ? 'secondary' : 'destructive'}
            className={cn(
              "text-lg px-4 py-2",
              property.riskLevel === 'low' && "bg-success"
            )}
          >
            {property.riskLevel.toUpperCase()} RISK
          </Badge>
        </div>

        {/* Score Breakdown by Pillar */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pillars.map((pillar) => (
              <div key={pillar.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <pillar.icon className={cn("h-4 w-4", pillar.color)} />
                    <span>{pillar.name}</span>
                  </div>
                  <span className={cn("font-bold tabular-nums", pillar.color)}>
                    {pillar.score}/{pillar.max}
                  </span>
                </div>
                <Progress 
                  value={Math.max(0, (pillar.score / pillar.max) * 100)} 
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* What Went Wrong */}
        {property.issues.length > 0 && (
          <Card className="border-destructive/30">
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                What Went Wrong ({property.issues.length} issues)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {property.issues.map((issue) => (
                <div 
                  key={issue.id}
                  className="flex items-start gap-3 p-2 rounded bg-destructive/5 text-sm"
                >
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">{issue.issue}</p>
                    <p className="text-xs text-muted-foreground">
                      Impact: -{issue.impact} points
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* What To Fix */}
        {property.issues.length > 0 && (
          <Card className="border-success/30">
            <CardHeader className="py-3">
              <CardTitle className="text-sm flex items-center gap-2 text-success">
                <CheckCircle className="h-4 w-4" />
                What To Fix (Recover up to {totalRecoveryPoints} points)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {property.issues.filter(i => i.recoveryPoints > 0).map((issue) => (
                <div 
                  key={issue.id}
                  className="flex items-center gap-3 p-2 rounded bg-success/5 text-sm"
                >
                  <ArrowRight className="h-4 w-4 text-success shrink-0" />
                  <div className="flex-1">
                    <p>{issue.actionRequired}</p>
                  </div>
                  <Badge variant="outline" className="text-success border-success shrink-0">
                    +{issue.recoveryPoints} pts
                  </Badge>
                </div>
              ))}
              {property.issues.filter(i => i.recoveryPoints === 0).length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Note: Some issues (like past late rent) cannot be recovered this month.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* All Good */}
        {property.issues.length === 0 && (
          <Card className="border-success/30 bg-success/5">
            <CardContent className="py-6 text-center">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-2" />
              <p className="font-medium text-success">All Good!</p>
              <p className="text-sm text-muted-foreground">
                This property has no outstanding issues.
              </p>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
