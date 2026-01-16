import { AlertCircle, CheckCircle, Clock, AlertTriangle, Home } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Property } from '@/types/property';
import { cn } from '@/lib/utils';

interface PropertyTableProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
}

export function PropertyTable({ properties, onPropertyClick }: PropertyTableProps) {
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
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Property Name</TableHead>
            <TableHead>Zone</TableHead>
            <TableHead className="text-center">Health Score</TableHead>
            <TableHead className="text-center">Rent Status</TableHead>
            <TableHead className="text-center">Renewal</TableHead>
            <TableHead className="text-center">Risk</TableHead>
            <TableHead className="text-right">Issues</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
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
              <TableCell>{property.basic.zone}</TableCell>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
