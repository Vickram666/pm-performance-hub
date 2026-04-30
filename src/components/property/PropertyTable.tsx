import { useMemo } from 'react';
import { AlertCircle, CheckCircle, Clock, AlertTriangle, Home, Zap, StickyNote } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Property } from '@/types/property';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSortableData } from '@/hooks/useSortableData';
import { SortableHeader } from '@/components/ui/sortable-header';

type PropertySortKey = 'id' | 'name' | 'score' | 'rent' | 'renewal' | 'risk' | 'notes' | 'issues';

interface PropertyTableProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
}

export function PropertyTable({ properties, onPropertyClick }: PropertyTableProps) {
  const accessors = useMemo(() => ({
    id: (p: Property) => p.basic.propertyId,
    name: (p: Property) => p.basic.propertyName,
    score: (p: Property) => p.healthScore,
    rent: (p: Property) => p.financial.onTimeRent ? 0 : p.financial.lateDays,
    renewal: (p: Property) => p.retention.renewalCompleted ? 9999 : p.retention.daysToLeaseEnd,
    risk: (p: Property) => ({ low: 0, medium: 1, high: 2 }[p.riskLevel]),
    notes: (p: Property) => p.notes.length,
    issues: (p: Property) => p.issues.length,
  }), []);

  const { sortedItems, sortConfig, requestSort } = useSortableData<Property, PropertySortKey>(
    properties,
    accessors,
    { key: 'score', direction: 'asc' }, // default: lowest score first (worst)
  );
  const getRiskBadge = (riskLevel: Property['riskLevel']) => {
    switch (riskLevel) {
      case 'low':
        return <Badge className="bg-success text-success-foreground">Low Risk</Badge>;
      case 'medium':
        return <Badge className="bg-warning text-warning-foreground">Medium</Badge>;
      case 'high':
        return <Badge variant="destructive">High Risk</Badge>;
    }
  };

  const getRentStatus = (property: Property) => {
    if (property.basic.tenantStatus === 'vacant') {
      return <Badge variant="outline">Vacant</Badge>;
    }
    if (property.financial.onTimeRent) {
      return (
        <div className="flex items-center gap-1 text-success">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">On-time</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">{property.financial.lateDays}d late</span>
      </div>
    );
  };

  const getRenewalStatus = (property: Property) => {
    if (property.retention.renewalCompleted) {
      return (
        <div className="flex items-center gap-1 text-success">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Renewed</span>
        </div>
      );
    }
    if (property.retention.daysToLeaseEnd <= 30) {
      return (
        <div className="flex items-center gap-1 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">{property.retention.daysToLeaseEnd}d left</span>
        </div>
      );
    }
    if (property.retention.daysToLeaseEnd <= 60) {
      return (
        <div className="flex items-center gap-1 text-warning">
          <Clock className="h-4 w-4" />
          <span className="text-sm">{property.retention.daysToLeaseEnd}d left</span>
        </div>
      );
    }
    if (property.retention.renewalInitiated) {
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm">In progress</span>
        </div>
      );
    }
    return <span className="text-sm text-muted-foreground">—</span>;
  };

  const getQuickActions = (property: Property) => {
    const actions: { label: string; variant: 'destructive' | 'outline'; action: string }[] = [];

    if (!property.financial.onTimeRent && property.basic.tenantStatus === 'occupied') {
      actions.push({ label: 'Fix Late Rent', variant: 'destructive', action: 'fix_rent' });
    }
    if (property.retention.daysToLeaseEnd <= 60 && !property.retention.renewalCompleted && !property.retention.renewalInitiated) {
      actions.push({ label: 'Start Renewal', variant: 'outline', action: 'start_renewal' });
    }
    if (property.customerExperience.ownerRating < 3.5) {
      actions.push({ label: 'Owner Follow-up', variant: 'outline', action: 'owner_followup' });
    }
    if (!property.operational.moveInReportCompleted || !property.operational.moveOutReportCompleted) {
      actions.push({ label: 'Complete Report', variant: 'outline', action: 'complete_report' });
    }

    return actions.slice(0, 2); // Max 2 inline actions
  };

  const handleQuickAction = (e: React.MouseEvent, property: Property, action: string) => {
    e.stopPropagation();
    const messages: Record<string, string> = {
      fix_rent: `Rent follow-up initiated for ${property.basic.propertyName}`,
      start_renewal: `Renewal process started for ${property.basic.propertyName}`,
      owner_followup: `Owner follow-up scheduled for ${property.basic.propertyName}`,
      complete_report: `Report marked for completion — ${property.basic.propertyName}`,
    };
    toast.success(messages[action] || 'Action initiated');
  };

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Home className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No properties found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px]">
              <SortableHeader label="ID" sortKey="id" sortConfig={sortConfig} onSort={requestSort} />
            </TableHead>
            <TableHead>
              <SortableHeader label="Property Name" sortKey="name" sortConfig={sortConfig} onSort={requestSort} />
            </TableHead>
            <TableHead className="text-center">
              <SortableHeader label="Health Score" sortKey="score" sortConfig={sortConfig} onSort={requestSort} align="center" />
            </TableHead>
            <TableHead className="text-center">
              <SortableHeader label="Rent Status" sortKey="rent" sortConfig={sortConfig} onSort={requestSort} align="center" />
            </TableHead>
            <TableHead className="text-center">
              <SortableHeader label="Renewal" sortKey="renewal" sortConfig={sortConfig} onSort={requestSort} align="center" />
            </TableHead>
            <TableHead className="text-center">
              <SortableHeader label="Risk" sortKey="risk" sortConfig={sortConfig} onSort={requestSort} align="center" />
            </TableHead>
            <TableHead className="text-center">Quick Actions</TableHead>
            <TableHead className="text-center">
              <SortableHeader label="Notes" sortKey="notes" sortConfig={sortConfig} onSort={requestSort} align="center" />
            </TableHead>
            <TableHead className="text-right">
              <SortableHeader label="Issues" sortKey="issues" sortConfig={sortConfig} onSort={requestSort} align="right" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((property) => {
            const quickActions = getQuickActions(property);
            return (
              <TableRow 
                key={property.basic.propertyId}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onPropertyClick(property)}
              >
                <TableCell className="font-mono text-sm">
                  {property.basic.propertyId}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{property.basic.propertyName}</p>
                    <p className="text-xs text-muted-foreground">{property.basic.ownerName}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-center gap-1">
                    <span className={cn(
                      "font-bold tabular-nums",
                      property.healthScore >= 70 && "text-success",
                      property.healthScore >= 50 && property.healthScore < 70 && "text-warning",
                      property.healthScore < 50 && "text-destructive"
                    )}>
                      {property.healthScore}
                    </span>
                    <Progress 
                      value={property.healthScore} 
                      className="h-1.5 w-16"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {getRentStatus(property)}
                </TableCell>
                <TableCell className="text-center">
                  {getRenewalStatus(property)}
                </TableCell>
                <TableCell className="text-center">
                  {getRiskBadge(property.riskLevel)}
                </TableCell>
                <TableCell>
                  {quickActions.length > 0 ? (
                    <div className="flex items-center gap-1 justify-center" onClick={e => e.stopPropagation()}>
                      {quickActions.map(qa => (
                        <Button
                          key={qa.action}
                          size="sm"
                          variant={qa.variant}
                          className="text-[11px] h-6 px-2"
                          onClick={(e) => handleQuickAction(e, property, qa.action)}
                        >
                          {qa.label}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-success flex items-center justify-center gap-1">
                      <CheckCircle className="h-3 w-3" /> OK
                    </span>
                )}
                </TableCell>
                <TableCell className="text-center">
                  {property.notes.length > 0 ? (
                    <div className="flex items-center justify-center gap-1">
                      <StickyNote className="h-3 w-3 text-primary" />
                      <span className="text-xs">{property.notes.length}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-500">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {property.issues.length > 0 ? (
                    <Badge variant="outline" className="text-destructive border-destructive">
                      {property.issues.length}
                    </Badge>
                  ) : (
                    <span className="text-success">✓</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
