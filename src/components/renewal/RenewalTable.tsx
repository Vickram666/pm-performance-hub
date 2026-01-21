import { RenewalRecord } from '@/types/renewal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RenewalRiskBadge } from './RenewalRiskBadge';
import { RenewalStageBadge } from './RenewalStageBadge';
import { RenewalStageProgress } from './RenewalStageProgress';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, TrendingDown, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface RenewalTableProps {
  renewals: RenewalRecord[];
  onRenewalClick: (renewal: RenewalRecord) => void;
}

export function RenewalTable({ renewals, onRenewalClick }: RenewalTableProps) {
  if (renewals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No renewals found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[200px]">Property</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>PM</TableHead>
            <TableHead className="text-center">Days Left</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead className="text-center">Risk</TableHead>
            <TableHead className="text-center">Score Impact</TableHead>
            <TableHead className="w-[40px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {renewals.map((renewal) => (
            <TableRow 
              key={renewal.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onRenewalClick(renewal)}
            >
              <TableCell>
                <div>
                  <div className="font-medium truncate max-w-[180px]">
                    {renewal.property.propertyName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {renewal.property.propertyId}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span>{renewal.property.city}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{renewal.property.zone}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <User className="h-3 w-3 text-muted-foreground" />
                  {renewal.property.assignedPM}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Tooltip>
                  <TooltipTrigger>
                    <Badge 
                      variant="outline" 
                      className={`
                        ${renewal.lease.daysToExpiry <= 15 ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}
                        ${renewal.lease.daysToExpiry > 15 && renewal.lease.daysToExpiry <= 30 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : ''}
                        ${renewal.lease.daysToExpiry > 30 && renewal.lease.daysToExpiry <= 45 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''}
                        ${renewal.lease.daysToExpiry > 45 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : ''}
                      `}
                    >
                      {renewal.lease.daysToExpiry} days
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Lease ends: {format(parseISO(renewal.lease.leaseEndDate), 'dd MMM yyyy')}</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
              <TableCell>
                <div className="max-w-[150px]">
                  <RenewalStageProgress currentStage={renewal.status.currentStage} compact />
                </div>
              </TableCell>
              <TableCell className="text-center">
                <RenewalRiskBadge risk={renewal.status.riskLevel} size="sm" />
              </TableCell>
              <TableCell className="text-center">
                {renewal.scoreImpact !== 0 ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                        <TrendingDown className="h-3 w-3 mr-1" />
                        {renewal.scoreImpact}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This renewal delay is reducing your score by {Math.abs(renewal.scoreImpact)} points.</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
