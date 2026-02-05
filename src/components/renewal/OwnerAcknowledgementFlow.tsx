import { useEffect, useMemo, useState } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { OwnerAcknowledgement, RenewalRecord } from '@/types/renewal';
import { notifyOwnerAcknowledgement } from '@/services/notificationService';
import { Loader2 } from 'lucide-react';

type OwnerAction = 'accept' | 'reject' | 'request_changes';
type Step = 'choose' | 'details' | 'otp' | 'verifying' | 'done';

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
  // Keep it simple + deterministic enough for UI
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
  const [step, setStep] = useState<Step>('choose');
  const [action, setAction] = useState<OwnerAction | null>(null);
  const [changeRequests, setChangeRequests] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const [otp, setOtp] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  const ownerEmail = useMemo(() => {
    // Simulation: if we ever store this in data, prefer that.
    const existing = renewal.ownerAcknowledgement.ownerEmail;
    if (existing) return existing;
    return `owner.${renewal.property.propertyId.toLowerCase()}@example.com`;
  }, [renewal.ownerAcknowledgement.ownerEmail, renewal.property.propertyId]);

  useEffect(() => {
    if (!open) return;
    // Reset flow when opened
    setStep('choose');
    setAction(null);
    setChangeRequests('');
    setRejectionReason('');
    setOtp('');
    setOtpInput('');
    setResendIn(0);
    setAttemptsLeft(3);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [open, resendIn]);

  const proposedRent = renewal.lease.proposedRent ?? Math.round(renewal.lease.currentRent * 1.07);
  const pmsFee = renewal.lease.pmsFee ?? Math.round(proposedRent * 0.05);
  const hikePct = ((proposedRent - renewal.lease.currentRent) / renewal.lease.currentRent) * 100;

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
      toast({
        title: 'Too many attempts',
        description: 'OTP verification locked for this session. Please resend OTP and try again.',
        variant: 'destructive',
      });
      return;
    }

    if (!otp || otpInput.length !== 6) {
      toast({
        title: 'Enter the 6-digit OTP',
        description: 'Please enter the OTP sent to the registered email.',
        variant: 'destructive',
      });
      return;
    }

    if (otpInput !== otp) {
      setAttemptsLeft((n) => Math.max(0, n - 1));
      toast({
        title: 'Incorrect OTP',
        description: `Please try again. Attempts left: ${Math.max(0, attemptsLeft - 1)}.`,
        variant: 'destructive',
      });
      return;
    }

    // Show verifying state
    setStep('verifying');

    const now = new Date();
    const ack: OwnerAcknowledgement = {
      status:
        action === 'accept'
          ? 'accepted'
          : action === 'reject'
            ? 'rejected'
            : 'changes_requested',
      ownerEmail,
      otpVerified: true,
      method: 'app',
      timestamp: now.toLocaleString(),
      consentId: generateConsentId(),
      deviceInfo: getDeviceInfo(),
      ipAddress: '192.0.2.10', // RFC 5737 TEST-NET-1 (safe placeholder)
      changeRequests: action === 'request_changes' ? changeRequests.trim() : undefined,
      rejectionReason: action === 'reject' ? rejectionReason.trim() : undefined,
    };

    // Simulate verification delay and send notification
    setTimeout(async () => {
      onComplete(ack);
      
      // Send email notification
      await notifyOwnerAcknowledgement(renewal, ack.status as 'accepted' | 'rejected' | 'changes_requested');
      
      setStep('done');
    }, 1500);
  };

  const title =
    step === 'choose'
      ? 'Owner Acknowledgement'
      : step === 'details'
        ? 'Confirm Owner Decision'
        : step === 'otp'
          ? 'Verify OTP (Registered Email)'
          : 'Acknowledgement Recorded';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Renewal Proposal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Property</p>
                  <p className="font-medium">{renewal.property.propertyName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Registered Email</p>
                  <p className="font-medium">{maskEmail(ownerEmail)}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Current Rent</p>
                  <p className="text-sm font-semibold">₹ {renewal.lease.currentRent.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Proposed Rent</p>
                  <p className="text-sm font-semibold text-primary">₹ {proposedRent.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">+{hikePct.toFixed(1)}%</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">PMS Fee (monthly)</p>
                  <p className="text-sm font-semibold">₹ {pmsFee.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {step === 'choose' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button
                onClick={() => {
                  setAction('accept');
                  setStep('otp');
                  sendOtp();
                }}
              >
                Accept
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setAction('reject');
                  setStep('details');
                }}
              >
                Reject
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setAction('request_changes');
                  setStep('details');
                }}
              >
                Request Changes
              </Button>
            </div>
          )}

          {step === 'details' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{action === 'reject' ? 'Rejection' : 'Change Request'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {action === 'reject' ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Please capture a clear reason (stored in the audit trail).
                    </p>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="E.g., Proposed rent is too high."
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      What changes does the owner request?
                    </p>
                    <Textarea
                      value={changeRequests}
                      onChange={(e) => setChangeRequests(e.target.value)}
                      placeholder="E.g., Reduce hike to 6% and keep lock-in unchanged."
                    />
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <Button variant="outline" onClick={() => setStep('choose')}>
                    Back
                  </Button>
                  <Button
                    disabled={!canProceedFromDetails}
                    onClick={() => {
                      setStep('otp');
                      sendOtp();
                    }}
                  >
                    Continue to OTP
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'otp' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">OTP Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground">OTP sent to</p>
                    <p className="font-medium">{maskEmail(ownerEmail)}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className={cn(attemptsLeft <= 1 && 'border-destructive/50')}>
                      Attempts left: {attemptsLeft}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-center py-2">
                  <InputOTP maxLength={6} value={otpInput} onChange={setOtpInput}>
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <InputOTPSlot key={i} index={i} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Button variant="outline" onClick={() => setStep(action === 'accept' ? 'choose' : 'details')}>
                    Back
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      disabled={resendIn > 0}
                      onClick={sendOtp}
                    >
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
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Verifying and recording acknowledgement...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 'done' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Confirmation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border p-3">
                  <p className="text-sm font-medium">Acknowledgement captured successfully.</p>
                  <p className="text-sm text-muted-foreground">
                    You can now proceed with the SOP-locked steps (e.g., sending the agreement only after acknowledgement).
                  </p>
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
