import { RenewalRecord, RENEWAL_STAGE_LABELS } from '@/types/renewal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RenewalRiskBadge } from './RenewalRiskBadge';
import { RenewalStageBadge } from './RenewalStageBadge';
import { RenewalStageProgress } from './RenewalStageProgress';
import { 
  Building, 
  MapPin, 
  User, 
  Calendar, 
  IndianRupee, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Shield,
  TrendingDown
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { OwnerAcknowledgementFlow } from './OwnerAcknowledgementFlow';

interface RenewalDetailModalProps {
  renewal: RenewalRecord | null;
  open: boolean;
  onClose: () => void;
  onRenewalUpdate?: (updated: RenewalRecord) => void;
}

export function RenewalDetailModal({ renewal, open, onClose, onRenewalUpdate }: RenewalDetailModalProps) {
  const [ackFlowOpen, setAckFlowOpen] = useState(false);

  if (!renewal) return null;

  const hasOwnerAck = renewal.ownerAcknowledgement.status === 'accepted';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Building className="h-5 w-5 text-primary" />
            {renewal.property.propertyName}
            <RenewalRiskBadge risk={renewal.status.riskLevel} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Score Impact Alert */}
          {renewal.scoreImpact !== 0 && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <TrendingDown className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <p className="font-medium text-red-400">Score Impact Warning</p>
                  <p className="text-sm text-muted-foreground">
                    This renewal delay is reducing your Property Health Score by{' '}
                    <strong>{Math.abs(renewal.scoreImpact)} points</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stage Progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Renewal Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <RenewalStageProgress currentStage={renewal.status.currentStage} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {/* Property Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono">{renewal.property.propertyId}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{renewal.property.city}, {renewal.property.zone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{renewal.property.assignedPM}</span>
                </div>
              </CardContent>
            </Card>

            {/* Lease Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Lease Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Lease End:</span>
                  <span className="font-medium">
                    {format(parseISO(renewal.lease.leaseEndDate), 'dd MMM yyyy')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Days to Expiry:</span>
                  <Badge variant="outline" className={
                    renewal.lease.daysToExpiry <= 15 ? 'bg-red-500/20 text-red-400' :
                    renewal.lease.daysToExpiry <= 30 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }>
                    {renewal.lease.daysToExpiry} days
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current Rent:</span>
                  <span className="flex items-center font-medium">
                    <IndianRupee className="h-3 w-3" />
                    {renewal.lease.currentRent.toLocaleString()}
                  </span>
                </div>
                {renewal.lease.proposedRent && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Proposed Rent:</span>
                    <span className="flex items-center font-medium text-primary">
                      <IndianRupee className="h-3 w-3" />
                      {renewal.lease.proposedRent.toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Owner Acknowledgement */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Owner Acknowledgement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasOwnerAck ? (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    <div className="flex-1">
                      <p className="font-medium text-emerald-400">Acknowledgement Received</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Method: </span>
                          <span className="capitalize">{renewal.ownerAcknowledgement.method}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">OTP Verified: </span>
                          <span>{renewal.ownerAcknowledgement.otpVerified ? 'Yes' : 'No'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Timestamp: </span>
                          <span>{renewal.ownerAcknowledgement.timestamp}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Consent ID: </span>
                          <span className="font-mono text-xs">{renewal.ownerAcknowledgement.consentId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-amber-400" />
                    <div>
                      <p className="font-medium text-amber-400">Pending Acknowledgement</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Owner acknowledgement is required before sending the agreement.
                      </p>

                      <div className="mt-3">
                        <Button onClick={() => setAckFlowOpen(true)}>
                          Simulate Owner Response
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Owner acknowledgement simulation flow */}
          <OwnerAcknowledgementFlow
            open={ackFlowOpen}
            onOpenChange={setAckFlowOpen}
            renewal={renewal}
            onComplete={(ack) => {
              const updated: RenewalRecord = {
                ...renewal,
                ownerAcknowledgement: ack,
              };
              onRenewalUpdate?.(updated);
            }}
          />

          {/* Alerts */}
          {renewal.alerts.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Active Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {renewal.alerts.map(alert => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.type === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                      alert.type === 'escalation' ? 'bg-amber-500/10 border-amber-500/20' :
                      'bg-blue-500/10 border-blue-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{alert.message}</span>
                      <Badge variant="outline" className="text-xs">
                        {alert.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Stage History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Stage History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {renewal.status.stageHistory.map((entry, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {RENEWAL_STAGE_LABELS[entry.stage]}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {entry.enteredAt}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        by {entry.actionBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
