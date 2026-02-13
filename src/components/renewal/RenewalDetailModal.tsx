import { RenewalRecord, RENEWAL_STAGE_LABELS, RENEWAL_STAGE_ORDER, getNextAction } from '@/types/renewal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RenewalRiskBadge } from './RenewalRiskBadge';
import { Button } from '@/components/ui/button';
import { 
  Building, MapPin, User, Calendar, IndianRupee, Clock, AlertTriangle,
  CheckCircle, FileText, Shield, TrendingDown, XCircle, ArrowRight,
  Upload, Activity, ShieldAlert
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useState } from 'react';
import { OwnerAcknowledgementFlow } from './OwnerAcknowledgementFlow';
import { AgreementUploadModal } from './AgreementUploadModal';

interface RenewalDetailModalProps {
  renewal: RenewalRecord | null;
  open: boolean;
  onClose: () => void;
  onRenewalUpdate?: (updated: RenewalRecord) => void;
  onNextAction?: (renewal: RenewalRecord, actionKey: string) => void;
}

export function RenewalDetailModal({ renewal, open, onClose, onRenewalUpdate, onNextAction }: RenewalDetailModalProps) {
  const [ackFlowOpen, setAckFlowOpen] = useState(false);
  const [agreementUploadOpen, setAgreementUploadOpen] = useState(false);

  if (!renewal) return null;

  const hasOwnerAck = renewal.ownerAcknowledgement.status === 'accepted';
  const impact = renewal.scoreImpact;
  const hasImpact = impact.currentPoints < 25;
  const nextAction = getNextAction(renewal.status.currentStage);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              <Building className="h-5 w-5 text-primary" />
              {renewal.property.propertyName}
              <RenewalRiskBadge risk={renewal.status.riskLevel} />
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Summary */}
          <div className="grid grid-cols-5 gap-4 p-4 rounded-lg bg-muted/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{renewal.lease.daysToExpiry}</div>
              <div className="text-xs text-muted-foreground">Days Left</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${
                renewal.status.riskLevel === 'red' ? 'text-red-500' :
                renewal.status.riskLevel === 'amber' ? 'text-amber-500' :
                'text-emerald-500'
              }`}>
                {renewal.status.riskLevel.toUpperCase()}
              </div>
              <div className="text-xs text-muted-foreground">Risk Status</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{impact.currentPoints}/25</div>
              <div className="text-xs text-muted-foreground">Renewal Score</div>
            </div>
            <div className="text-center">
              <Badge variant="outline" className={`text-xs ${
                renewal.status.renewalHealth === 'green' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                renewal.status.renewalHealth === 'yellow' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                <Activity className="h-3 w-3 mr-1" />
                {renewal.status.renewalHealth === 'green' ? 'On Track' : renewal.status.renewalHealth === 'yellow' ? 'At Risk' : 'Overdue'}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">Health</div>
            </div>
            <div className="text-center">
              {hasImpact ? (
                <div className="text-sm font-medium text-red-400">{impact.atRiskMessage}</div>
              ) : (
                <div className="text-sm font-medium text-emerald-500">On Track</div>
              )}
              <div className="text-xs text-muted-foreground">Score Impact</div>
            </div>
          </div>

          {/* Score Impact Alert */}
          {hasImpact && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <TrendingDown className="h-5 w-5 text-red-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-400">Score Impact Warning</p>
                  <p className="text-sm text-muted-foreground">
                    Current renewal status is costing you{' '}
                    <strong>{25 - impact.currentPoints} points</strong> from your renewal score.
                  </p>
                  <div className="mt-2 space-y-1">
                    {impact.deductions.filter(d => d.triggered).map((d, i) => (
                      <div key={i} className="text-xs text-red-400 flex items-center gap-2">
                        <XCircle className="h-3 w-3" />
                        {d.reason}: {d.points} pts
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Visual Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Renewal Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between overflow-x-auto pb-2">
                {RENEWAL_STAGE_ORDER.map((stage, index) => {
                  const currentIndex = RENEWAL_STAGE_ORDER.indexOf(renewal.status.currentStage);
                  const isCompleted = index < currentIndex;
                  const isCurrent = stage === renewal.status.currentStage;
                  
                  return (
                    <div key={stage} className="flex items-center">
                      <div className="flex flex-col items-center min-w-[70px]">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          isCompleted ? 'bg-emerald-500 text-white' :
                          isCurrent ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        <div className={`text-[10px] mt-1 text-center max-w-[60px] ${
                          isCurrent ? 'font-medium text-primary' : 'text-muted-foreground'
                        }`}>
                          {RENEWAL_STAGE_LABELS[stage].split(' ').slice(0, 2).join(' ')}
                        </div>
                      </div>
                      {index < RENEWAL_STAGE_ORDER.length - 1 && (
                        <div className={`w-8 h-0.5 mx-1 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-muted'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
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
                  <span className="text-muted-foreground">Config:</span>
                  <span>{renewal.property.configuration || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{renewal.property.city}, {renewal.property.zone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{renewal.property.assignedPM}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Lease End:</span>
                  <span className="font-medium">
                    {format(parseISO(renewal.lease.leaseEndDate), 'dd MMM yyyy')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Notice Period:</span>
                  <Badge variant="outline">{renewal.lease.noticePeriod} days</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Renewal Opened:</span>
                  <span>{format(parseISO(renewal.lease.renewalOpenDate), 'dd MMM yyyy')}</span>
                </div>
              </CardContent>
            </Card>

            {/* Lease & Rent Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Lease Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Agreement Uploaded:</span>
                  {renewal.agreementUpload.uploaded ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs text-muted-foreground">{renewal.agreementUpload.fileName}</span>
                    </div>
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                {renewal.agreementUpload.uploaded && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Effective Start:</span>
                      <span>{renewal.agreementUpload.effectiveLeaseStartDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{renewal.agreementUpload.leaseDurationMonths} months</span>
                    </div>
                  </>
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
                        {renewal.ownerAcknowledgement.sentDate && (
                          <div>
                            <span className="text-muted-foreground">Sent: </span>
                            <span>{renewal.ownerAcknowledgement.sentDate}</span>
                          </div>
                        )}
                        {renewal.ownerAcknowledgement.approvedDate && (
                          <div>
                            <span className="text-muted-foreground">Approved: </span>
                            <span>{renewal.ownerAcknowledgement.approvedDate}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Consent ID: </span>
                          <span className="font-mono text-xs">{renewal.ownerAcknowledgement.consentId}</span>
                        </div>
                        {renewal.ownerAcknowledgement.deviceInfo && (
                          <div>
                            <span className="text-muted-foreground">Device: </span>
                            <span className="text-xs">{renewal.ownerAcknowledgement.deviceInfo}</span>
                          </div>
                        )}
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
                        Owner acknowledgement is required before uploading the agreement.
                      </p>
                      {renewal.status.currentStage === 'proposal_sent' && (
                        <div className="mt-3">
                          <Button onClick={() => setAckFlowOpen(true)}>
                            Send Owner Acknowledgement
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <OwnerAcknowledgementFlow
            open={ackFlowOpen}
            onOpenChange={setAckFlowOpen}
            renewal={renewal}
            onComplete={(ack) => {
              const updated: RenewalRecord = {
                ...renewal,
                ownerAcknowledgement: ack,
                status: {
                  ...renewal.status,
                  currentStage: ack.status === 'accepted' ? 'owner_acknowledged' : renewal.status.currentStage,
                },
              };
              onRenewalUpdate?.(updated);
            }}
          />

          {/* Agreement Upload Section */}
          {renewal.status.currentStage === 'owner_acknowledged' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Renewal Agreement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload the signed renewal agreement (PDF mandatory). You must provide the effective lease start date and duration.
                  </p>
                  <Button onClick={() => setAgreementUploadOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Agreement
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <AgreementUploadModal
            open={agreementUploadOpen}
            onOpenChange={setAgreementUploadOpen}
            renewal={renewal}
            onComplete={(agreementData) => {
              const updated: RenewalRecord = {
                ...renewal,
                agreementUpload: agreementData,
                status: {
                  ...renewal.status,
                  currentStage: 'agreement_uploaded',
                },
              };
              onRenewalUpdate?.(updated);
              setAgreementUploadOpen(false);
            }}
          />

          {/* Action Log */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Action Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {renewal.actionLog.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      entry.source === 'PM' ? 'bg-primary' :
                      entry.source === 'Owner' ? 'bg-emerald-500' :
                      'bg-muted-foreground'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{entry.action}</span>
                        <Badge variant="outline" className="text-xs">
                          {entry.source}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>by {entry.actionBy}</span>
                        <span>•</span>
                        <span>{format(parseISO(entry.timestamp), 'dd MMM yyyy HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          {renewal.alerts.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Active Alerts & Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {renewal.alerts.map(alert => (
                  <div 
                    key={alert.id}
                    className={`p-3 rounded-lg border ${
                      alert.type === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                      alert.type === 'escalation' ? 'bg-amber-500/10 border-amber-500/20' :
                      alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
                      'bg-blue-500/10 border-blue-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{alert.message}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {alert.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Next Action CTA */}
          {!nextAction.disabled && (
            <div className="sticky bottom-0 bg-background pt-4 border-t">
              <Button 
                className="w-full gap-2" 
                size="lg"
                variant={renewal.status.riskLevel === 'red' ? 'destructive' : 'default'}
                onClick={() => {
                  if (nextAction.actionKey === 'send_owner_ack') {
                    setAckFlowOpen(true);
                  } else if (nextAction.actionKey === 'upload_agreement') {
                    setAgreementUploadOpen(true);
                  } else {
                    onNextAction?.(renewal, nextAction.actionKey);
                  }
                }}
              >
                {nextAction.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
