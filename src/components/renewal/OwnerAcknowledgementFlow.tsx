import { useEffect, useMemo, useState } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { OwnerAcknowledgement, RenewalRecord } from '@/types/renewal';
import { notifyOwnerAcknowledgement } from '@/services/notificationService';
import { Loader2, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

type OwnerAction = 'accept' | 'reject' | 'request_changes';
type Step = 'form' | 'preview' | 'choose' | 'details' | 'otp' | 'verifying' | 'done';

interface OwnerAcknowledgementFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renewal: RenewalRecord;
  onComplete: (ack: OwnerAcknowledgement) => void;
}

function maskEmail(email: string) {
  const [user, domain] = email.split('@');
  if (!domain) return '***';
  const first = user?.[0] ?? 'x';
  return `${first}${'*'.repeat(Math.max(2, user.length - 1))}@${domain}`;
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateConsentId() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const r = Math.floor(10000 + Math.random() * 90000);
  return `CON-${y}${m}${day}-${r}`;
}

function getDeviceInfo() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  if (ua.includes('Mac')) return 'Safari on macOS';
  if (ua.includes('Windows')) return 'Chrome on Windows';
  if (ua.includes('Android')) return 'Chrome on Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'Safari on iOS';
  return 'Web Browser';
}

export function OwnerAcknowledgementFlow({
  open,
  onOpenChange,
  renewal,
  onComplete,
}: OwnerAcknowledgementFlowProps) {
  const [step, setStep] = useState<Step>('form');
  const [action, setAction] = useState<OwnerAction | null>(null);
  const [changeRequests, setChangeRequests] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Editable form fields
  const [revisedRent, setRevisedRent] = useState('');
  const [newLeaseStartDate, setNewLeaseStartDate] = useState('');
  const [serviceFeePercent, setServiceFeePercent] = useState('');
  const [maintenanceIncluded, setMaintenanceIncluded] = useState(false);
  const [specialRemarks, setSpecialRemarks] = useState('');

  const [otp, setOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  const ownerEmail = useMemo(() => {
    const existing = renewal.ownerAcknowledgement.ownerEmail;
    if (existing) return existing;
    return `owner.${renewal.property.propertyId.toLowerCase()}@example.com`;
  }, [renewal.ownerAcknowledgement.ownerEmail, renewal.property.propertyId]);

  useEffect(() => {
    if (!open) return;
    setStep('form');
    setAction(null);
    setChangeRequests('');
    setRejectionReason('');
    setOtp('');
    setOtpInput('');
    setResendIn(0);
    setAttemptsLeft(3);
    // Pre-fill form
    setRevisedRent(String(renewal.lease.proposedRent || Math.round(renewal.lease.currentRent * 1.07)));
    const leaseEnd = new Date(renewal.lease.leaseEndDate);
    leaseEnd.setDate(leaseEnd.getDate() + 1);
    setNewLeaseStartDate(format(leaseEnd, 'yyyy-MM-dd'));
    setServiceFeePercent(String(renewal.lease.serviceFeePercent || 5));
    setMaintenanceIncluded(renewal.property.maintenanceIncluded || false);
    setSpecialRemarks('');
  }, [open, renewal]);

  useEffect(() => {
    if (!open) return;
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [open, resendIn]);

  const canProceedFromForm = revisedRent && newLeaseStartDate && serviceFeePercent;

  const canProceedFromDetails =
    action === 'accept' ||
    (action === 'reject' && rejectionReason.trim().length >= 3) ||
    (action === 'request_changes' && changeRequests.trim().length >= 5);

  const sendOtp = () => {
    const code = generateOtp();
    setOtp(code);
    setOtpInput('');
    setResendIn(30);
    toast({
      title: 'OTP sent (simulation)',
      description: `Sent to ${maskEmail(ownerEmail)} • OTP: ${code}`,
    });
  };

  const verifyOtp = () => {
    if (attemptsLeft <= 0) {
      toast({ title: 'Too many attempts', description: 'OTP verification locked.', variant: 'destructive' });
      return;
    }
    if (!otp || otpInput.length !== 6) {
      toast({ title: 'Enter the 6-digit OTP', variant: 'destructive' });
      return;
    }
    if (otpInput !== otp) {
      setAttemptsLeft((n) => Math.max(0, n - 1));
      toast({ title: 'Incorrect OTP', description: `Attempts left: ${Math.max(0, attemptsLeft - 1)}.`, variant: 'destructive' });
      return;
    }

    setStep('verifying');

    const now = new Date();
    const sentDate = format(now, 'yyyy-MM-dd');
    const ack: OwnerAcknowledgement = {
      status: action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'changes_requested',
      ownerEmail,
      otpVerified: true,
      method: 'app',
      timestamp: now.toLocaleString(),
      consentId: generateConsentId(),
      deviceInfo: getDeviceInfo(),
      ipAddress: '192.0.2.10',
      changeRequests: action === 'request_changes' ? changeRequests.trim() : undefined,
      rejectionReason: action === 'reject' ? rejectionReason.trim() : undefined,
      sentDate,
      viewedDate: sentDate,
      approvedDate: action === 'accept' ? sentDate : undefined,
      proposalDetails: {
        revisedRent: parseInt(revisedRent),
        newLeaseStartDate,
        serviceFeePercent: parseFloat(serviceFeePercent),
        maintenanceIncluded,
        specialRemarks: specialRemarks || undefined,
      },
    };

    setTimeout(async () => {
      onComplete(ack);
      await notifyOwnerAcknowledgement(renewal, ack.status as 'accepted' | 'rejected' | 'changes_requested');
      setStep('done');
    }, 1500);
  };

  const title = {
    form: 'Send Owner Acknowledgement',
    preview: 'Preview Acknowledgement',
    choose: 'Owner Response (Simulation)',
    details: 'Confirm Owner Decision',
    otp: 'Verify OTP',
    verifying: 'Processing...',
    done: 'Acknowledgement Recorded',
  }[step];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Structured Form */}
          {step === 'form' && (
            <>
              {/* Auto-fetched read-only fields */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Auto-fetched (Read-only)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Property:</span>
                      <p className="font-medium">{renewal.property.propertyName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Configuration:</span>
                      <p className="font-medium">{renewal.property.configuration || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Current Rent:</span>
                      <p className="font-medium flex items-center gap-1">
                        <IndianRupee className="h-3 w-3" />
                        {renewal.lease.currentRent.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Maintenance included?</span>
                      <Switch checked={maintenanceIncluded} onCheckedChange={setMaintenanceIncluded} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Editable fields */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Editable (Mandatory)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="revisedRent">Revised Rent *</Label>
                      <Input
                        id="revisedRent"
                        type="number"
                        value={revisedRent}
                        onChange={(e) => setRevisedRent(e.target.value)}
                        placeholder="Enter revised rent"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="newLeaseStart">New Lease Start Date *</Label>
                      <Input
                        id="newLeaseStart"
                        type="date"
                        value={newLeaseStartDate}
                        onChange={(e) => setNewLeaseStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="serviceFee">Service Fee % *</Label>
                      <Input
                        id="serviceFee"
                        type="number"
                        step="0.5"
                        min="0"
                        max="20"
                        value={serviceFeePercent}
                        onChange={(e) => setServiceFeePercent(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="remarks">Special Remarks (optional)</Label>
                    <Textarea
                      id="remarks"
                      value={specialRemarks}
                      onChange={(e) => setSpecialRemarks(e.target.value)}
                      placeholder="Any special conditions or notes..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button disabled={!canProceedFromForm} onClick={() => setStep('preview')}>
                  Preview & Send
                </Button>
              </div>
            </>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Acknowledgement Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border p-4 space-y-2 text-sm bg-muted/30">
                    <p className="font-medium">Dear Property Owner,</p>
                    <p>We are pleased to share the renewal proposal for <strong>{renewal.property.propertyName}</strong> ({renewal.property.configuration}).</p>
                    <Separator />
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-muted-foreground">Current Rent:</span> ₹{renewal.lease.currentRent.toLocaleString()}</div>
                      <div><span className="text-muted-foreground">Revised Rent:</span> <strong className="text-primary">₹{parseInt(revisedRent).toLocaleString()}</strong></div>
                      <div><span className="text-muted-foreground">New Lease Start:</span> {newLeaseStartDate}</div>
                      <div><span className="text-muted-foreground">Service Fee:</span> {serviceFeePercent}%</div>
                      <div><span className="text-muted-foreground">Maintenance:</span> {maintenanceIncluded ? 'Included' : 'Not included'}</div>
                    </div>
                    {specialRemarks && (
                      <div><span className="text-muted-foreground">Remarks:</span> {specialRemarks}</div>
                    )}
                    <Separator />
                    <p className="text-muted-foreground text-xs">This will be sent via App + Email to the registered owner at {maskEmail(ownerEmail)}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep('form')}>Edit</Button>
                <Button onClick={() => {
                  toast({ title: '📨 Acknowledgement sent (simulated)', description: `Sent to ${maskEmail(ownerEmail)} via App + Email` });
                  setStep('choose');
                }}>
                  Send to Owner
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Simulated Owner Response */}
          {step === 'choose' && (
            <>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Simulating owner's response. In production, this happens in the Owner App.
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Revised Rent</p>
                      <p className="font-semibold text-primary">₹{parseInt(revisedRent).toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">New Start</p>
                      <p className="font-semibold">{newLeaseStartDate}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Service Fee</p>
                      <p className="font-semibold">{serviceFeePercent}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => { setAction('accept'); setStep('otp'); sendOtp(); }}>Accept</Button>
                <Button variant="destructive" onClick={() => { setAction('reject'); setStep('details'); }}>Reject</Button>
                <Button variant="secondary" onClick={() => { setAction('request_changes'); setStep('details'); }}>Request Changes</Button>
              </div>
            </>
          )}

          {/* Details step for reject/changes */}
          {step === 'details' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{action === 'reject' ? 'Rejection' : 'Change Request'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {action === 'reject' ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Capture a clear reason (stored in audit trail).</p>
                    <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="E.g., Proposed rent is too high." />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">What changes does the owner request?</p>
                    <Textarea value={changeRequests} onChange={(e) => setChangeRequests(e.target.value)} placeholder="E.g., Reduce hike to 6%." />
                  </div>
                )}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep('choose')}>Back</Button>
                  <Button disabled={!canProceedFromDetails} onClick={() => { setStep('otp'); sendOtp(); }}>Continue to OTP</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* OTP */}
          {step === 'otp' && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">OTP Verification</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground">OTP sent to</p>
                    <p className="font-medium">{maskEmail(ownerEmail)}</p>
                  </div>
                  <Badge variant="outline" className={cn(attemptsLeft <= 1 && 'border-destructive/50')}>
                    Attempts: {attemptsLeft}
                  </Badge>
                </div>
                <div className="flex justify-center py-2">
                  <InputOTP maxLength={6} value={otpInput} onChange={setOtpInput}>
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, i) => (<InputOTPSlot key={i} index={i} />))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(action === 'accept' ? 'choose' : 'details')}>Back</Button>
                  <div className="flex gap-2">
                    <Button variant="secondary" disabled={resendIn > 0} onClick={sendOtp}>
                      {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend OTP'}
                    </Button>
                    <Button onClick={verifyOtp}>Verify</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'verifying' && (
            <Card>
              <CardContent className="py-8">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Verifying and recording acknowledgement...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'done' && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="rounded-lg border p-3">
                  <p className="text-sm font-medium">Acknowledgement captured successfully.</p>
                  <p className="text-sm text-muted-foreground">Proceed with SOP-locked steps.</p>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => onOpenChange(false)}>Done</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
