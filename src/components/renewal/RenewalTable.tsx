import { RenewalRecord, getNextAction, RENEWAL_STAGE_LABELS } from '@/types/renewal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RenewalRiskBadge } from './RenewalRiskBadge';
import { RenewalStageBadge } from './RenewalStageBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, TrendingDown, ChevronRight, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface RenewalTableProps {
  renewals: RenewalRecord[];
  onRenewalClick: (renewal: RenewalRecord) => void;
  onNextAction: (renewal: RenewalRecord, actionKey: string) => void;
}

// Sort renewals: Red → Amber → Green, then by days left ascending, then by pending owner action
function sortRenewalsForCommandCenter(renewals: RenewalRecord[]): RenewalRecord[] {
  const riskOrder = { red: 0, amber: 1, green: 2 };
  return [...renewals].sort((a, b) => {
    // First sort by risk level
    const riskDiff = riskOrder[a.status.riskLevel] - riskOrder[b.status.riskLevel];
    if (riskDiff !== 0) return riskDiff;
    // Then by days left ascending
    const daysDiff = a.lease.daysToExpiry - b.lease.daysToExpiry;
    if (daysDiff !== 0) return daysDiff;
    // Then by awaiting owner action
    const aWaitingOwner = a.status.currentStage === 'proposal_sent' || a.status.currentStage === 'agreement_sent';
    const bWaitingOwner = b.status.currentStage === 'proposal_sent' || b.status.currentStage === 'agreement_sent';
    if (aWaitingOwner && !bWaitingOwner) return -1;
    if (!aWaitingOwner && bWaitingOwner) return 1;
    return 0;
  });
}

export function RenewalTable({ renewals, onRenewalClick, onNextAction }: RenewalTableProps) {
  if (renewals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No renewals found matching your filters.</p>
      </div>
    );
  }

  const sortedRenewals = sortRenewalsForCommandCenter(renewals);

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[70px] text-center font-bold">Days Left</TableHead>
            <TableHead className="w-[180px]">Property</TableHead>
            <TableHead className="w-[100px]">PM</TableHead>
            <TableHead className="w-[90px]">Lease End</TableHead>
            <TableHead className="w-[90px]">Renewal Open</TableHead>
            <TableHead className="w-[70px] text-center">Risk</TableHead>
            <TableHead className="w-[130px]">Stage</TableHead>
            <TableHead className="w-[160px]">Next Action</TableHead>
            <TableHead className="w-[70px] text-center">Signed</TableHead>
            <TableHead className="w-[70px] text-center">Uploaded</TableHead>
            <TableHead className="w-[150px]">Score Impact</TableHead>
            <TableHead className="w-[40px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRenewals.map((renewal) => {
            const nextAction = getNextAction(
              renewal.status.currentStage,
              renewal.status.agreementSigned,
              renewal.status.agreementUploaded
            );
            const impact = renewal.scoreImpact;
            const hasImpact = impact.currentPoints < 25;
            
            return (
              <TableRow 
                key={renewal.id}
                className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                  renewal.status.riskLevel === 'red' ? 'bg-red-500/5' :
                  renewal.status.riskLevel === 'amber' ? 'bg-amber-500/5' : ''
                }`}
                onClick={() => onRenewalClick(renewal)}
              >
                {/* Days Left - Big & Color-coded */}
                <TableCell className="text-center">
                  <div className={`text-xl font-bold ${
                    renewal.lease.daysToExpiry <= 15 ? 'text-red-500' :
                    renewal.lease.daysToExpiry <= 30 ? 'text-amber-500' :
                    renewal.lease.daysToExpiry <= 45 ? 'text-blue-500' :
                    'text-emerald-500'
                  }`}>
                    {renewal.lease.daysToExpiry}
                  </div>
                </TableCell>
                
                {/* Property */}
                <TableCell>
                  <div>
                    <div className="font-medium truncate max-w-[160px]" title={renewal.property.propertyName}>
                      {renewal.property.propertyId}
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                      {renewal.property.propertyName}
                    </div>
                  </div>
                </TableCell>
                
                {/* PM Name */}
                <TableCell>
                  <div className="text-sm flex items-center gap-1">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="truncate max-w-[80px]">{renewal.property.assignedPM.split(' ')[0]}</span>
                  </div>
                </TableCell>
                
                {/* Lease End Date */}
                <TableCell>
                  <div className="text-sm">
                    {format(parseISO(renewal.lease.leaseEndDate), 'dd MMM yy')}
                  </div>
                </TableCell>
                
                {/* Renewal Open Date */}
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="text-sm text-muted-foreground">
                        {format(parseISO(renewal.lease.renewalOpenDate), 'dd MMM')}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Renewal auto-opened on this date</p>
                      <p className="text-xs text-muted-foreground">
                        Notice period: {renewal.lease.noticePeriod} days
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                
                {/* Risk */}
                <TableCell className="text-center">
                  <RenewalRiskBadge risk={renewal.status.riskLevel} size="sm" />
                </TableCell>
                
                {/* Stage (read-only) */}
                <TableCell>
                  <RenewalStageBadge stage={renewal.status.currentStage} showIcon={false} />
                </TableCell>
                
                {/* Next Action (Primary CTA) */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {nextAction.disabled ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-xs px-2 py-1.5 rounded bg-muted text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {nextAction.label}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{nextAction.disabledReason}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      size="sm"
                      variant={renewal.status.riskLevel === 'red' ? 'destructive' : 'default'}
                      className="text-xs h-7 w-full"
                      onClick={() => onNextAction(renewal, nextAction.actionKey)}
                    >
                      {nextAction.label}
                    </Button>
                  )}
                </TableCell>
                
                {/* Agreement Signed */}
                <TableCell className="text-center">
                  {renewal.status.agreementSigned ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                  )}
                </TableCell>
                
                {/* Agreement Uploaded */}
                <TableCell className="text-center">
                  {renewal.status.agreementUploaded ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                  )}
                </TableCell>
                
                {/* Score Impact */}
                <TableCell>
                  {hasImpact ? (
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {impact.atRiskMessage}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">Current: {impact.currentPoints}/25 pts</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {impact.deductions.filter(d => d.triggered).map((d, i) => (
                            <div key={i}>{d.reason}: {d.points} pts</div>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="text-xs text-emerald-500 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      On track
                    </span>
                  )}
                </TableCell>
                
                <TableCell>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
