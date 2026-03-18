import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, XCircle } from 'lucide-react';
import type { RenewalRecord } from '@/types/renewal';

const FAILURE_REASONS = [
  { value: 'owner_exit', label: 'Owner Exit / Self-use' },
  { value: 'tenant_vacating', label: 'Tenant Vacating' },
  { value: 'rent_disagreement', label: 'Rent Disagreement' },
  { value: 'maintenance_issues', label: 'Maintenance / Property Issues' },
  { value: 'relocation', label: 'Tenant Relocation' },
  { value: 'force_terminated', label: 'Force Terminated by Owner' },
  { value: 'other', label: 'Other' },
] as const;

interface FailedRenewalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renewal: RenewalRecord;
  onConfirm: (reason: string, details: string) => void;
}

export function FailedRenewalModal({ open, onOpenChange, renewal, onConfirm }: FailedRenewalModalProps) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const canSubmit = reason && details.trim().length >= 5;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Mark Renewal as Failed
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning */}
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive">This action is irreversible</p>
                <p className="text-muted-foreground mt-1">
                  Marking <strong>{renewal.property.propertyName}</strong> as failed will:
                </p>
                <ul className="list-disc ml-4 mt-1 text-muted-foreground space-y-0.5">
                  <li>Apply a <Badge variant="destructive" className="text-xs px-1 py-0">−15 point</Badge> deduction to renewal score</li>
                  <li>Initiate forced move-out process</li>
                  <li>Lock this renewal permanently</li>
                  <li>Record in PM's audit trail</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reason dropdown */}
          <div className="space-y-2">
            <Label>Failure Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason for failure" />
              </SelectTrigger>
              <SelectContent>
                {FAILURE_REASONS.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <Label>Details * (min 5 characters)</Label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide specific details about the failure reason..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" disabled={!canSubmit} onClick={() => onConfirm(reason, details.trim())}>
            <XCircle className="h-4 w-4 mr-2" />
            Confirm Failure
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
