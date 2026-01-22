import { RenewalRecord } from '@/types/renewal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RenewalRiskBadge } from './RenewalRiskBadge';
import { RenewalStageBadge } from './RenewalStageBadge';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, TrendingDown, ChevronRight, Clock, FileText, CheckCircle, XCircle } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface RenewalTableProps {
  renewals: RenewalRecord[];
  onRenewalClick: (renewal: RenewalRecord) => void;
}

// Sort renewals: Red → Amber → Green, then by days left ascending
function sortRenewalsForCommandCenter(renewals: RenewalRecord[]): RenewalRecord[] {
  const riskOrder = { red: 0, amber: 1, green: 2 };
  return [...renewals].sort((a, b) => {
    // First sort by risk level
    const riskDiff = riskOrder[a.status.riskLevel] - riskOrder[b.status.riskLevel];
    if (riskDiff !== 0) return riskDiff;
    // Then by days left ascending
    return a.lease.daysToExpiry - b.lease.daysToExpiry;
  });
}

// Get next required action based on current stage
function getNextRequiredAction(renewal: RenewalRecord): { action: string; urgency: 'high' | 'medium' | 'low' } {
  const stage = renewal.status.currentStage;
  const daysLeft = renewal.lease.daysToExpiry;
  
  switch (stage) {
    case 'not_started':
      return { action: 'Initiate renewal discussion', urgency: daysLeft <= 30 ? 'high' : 'medium' };
    case 'renewal_initiated':
      return { action: 'Begin negotiation', urgency: 'medium' };
    case 'negotiation_in_progress':
      return { action: 'Get owner acknowledgement', urgency: daysLeft <= 30 ? 'high' : 'medium' };
    case 'owner_acknowledgement_pending':
      return { action: 'Follow up for acknowledgement', urgency: daysLeft <= 30 ? 'high' : 'medium' };
    case 'agreement_sent':
      return { action: 'Get agreement signed', urgency: daysLeft <= 15 ? 'high' : 'medium' };
    case 'agreement_signed':
      return { action: 'Complete TCF', urgency: 'medium' };
    case 'tcf_completed':
      return { action: 'Complete PMS renewal', urgency: 'low' };
    case 'pms_renewed':
      return { action: 'Mark as completed', urgency: 'low' };
    case 'renewal_completed':
      return { action: 'No action needed', urgency: 'low' };
    case 'renewal_failed':
      return { action: 'Initiate move-out', urgency: 'high' };
    default:
      return { action: 'Review status', urgency: 'low' };
  }
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

  const sortedRenewals = sortRenewalsForCommandCenter(renewals);

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[60px] text-center font-bold">Days Left</TableHead>
            <TableHead className="w-[180px]">Property</TableHead>
            <TableHead className="w-[80px] text-center">Notice</TableHead>
            <TableHead className="w-[100px]">Renewal Opens</TableHead>
            <TableHead className="w-[120px]">Stage</TableHead>
            <TableHead className="w-[70px] text-center">Risk</TableHead>
            <TableHead className="w-[100px]">Last Action</TableHead>
            <TableHead className="w-[160px]">Next Required Action</TableHead>
            <TableHead className="w-[80px] text-center">Owner Ack</TableHead>
            <TableHead className="w-[70px] text-center">Impact</TableHead>
            <TableHead className="w-[40px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRenewals.map((renewal) => {
            const nextAction = getNextRequiredAction(renewal);
            const today = new Date();
            const lastActionDate = parseISO(renewal.status.lastActionDate);
            const daysSinceAction = differenceInDays(today, lastActionDate);
            
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
                  <div className={`text-lg font-bold ${
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
                    <div className="font-medium truncate max-w-[160px]">
                      {renewal.property.propertyName}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {renewal.property.city}
                    </div>
                  </div>
                </TableCell>
                
                {/* Notice Period */}
                <TableCell className="text-center">
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="text-xs">
                        {renewal.lease.noticePeriod}d
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{renewal.lease.noticePeriod}-day notice period</p>
                      <p className="text-xs text-muted-foreground">
                        Lock by: {format(parseISO(renewal.lease.lockDeadline), 'dd MMM')}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                
                {/* Renewal Open Date */}
                <TableCell>
                  <div className="text-sm">
                    {format(parseISO(renewal.lease.renewalOpenDate), 'dd MMM')}
                  </div>
                </TableCell>
                
                {/* Stage */}
                <TableCell>
                  <RenewalStageBadge stage={renewal.status.currentStage} />
                </TableCell>
                
                {/* Risk */}
                <TableCell className="text-center">
                  <RenewalRiskBadge risk={renewal.status.riskLevel} size="sm" />
                </TableCell>
                
                {/* Last Action */}
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="text-sm">
                        <span className={daysSinceAction > 5 ? 'text-amber-500' : ''}>
                          {daysSinceAction}d ago
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{format(lastActionDate, 'dd MMM yyyy')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                
                {/* Next Required Action */}
                <TableCell>
                  <div className={`text-xs px-2 py-1 rounded ${
                    nextAction.urgency === 'high' ? 'bg-red-500/20 text-red-400' :
                    nextAction.urgency === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {nextAction.action}
                  </div>
                </TableCell>
                
                {/* Owner Acknowledgement Status */}
                <TableCell className="text-center">
                  <Tooltip>
                    <TooltipTrigger>
                      {renewal.ownerAcknowledgement.status === 'accepted' ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : renewal.ownerAcknowledgement.status === 'rejected' ? (
                        <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500 mx-auto" />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="capitalize">{renewal.ownerAcknowledgement.status}</p>
                      {renewal.ownerAcknowledgement.method && (
                        <p className="text-xs">Via {renewal.ownerAcknowledgement.method}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                
                {/* Score Impact */}
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
                        <p className="font-medium">This renewal delay is reducing your score by {Math.abs(renewal.scoreImpact)} points.</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Complete this renewal to recover these points.
                        </p>
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
