import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import type { RenewalRecord, AgreementUpload } from '@/types/renewal';
import { format } from 'date-fns';

interface AgreementUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renewal: RenewalRecord;
  onComplete: (data: AgreementUpload) => void;
}

export function AgreementUploadModal({ open, onOpenChange, renewal, onComplete }: AgreementUploadModalProps) {
  const [fileName, setFileName] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [duration, setDuration] = useState('12');

  const handleFileSelect = () => {
    // Simulate file selection (PDF mandatory)
    const simulatedName = `renewal_agreement_${renewal.property.propertyId}.pdf`;
    setFileName(simulatedName);
    toast.success('PDF file selected (simulated)');
  };

  const canSubmit = fileName && effectiveDate && duration;

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.error('All fields are mandatory');
      return;
    }

    const data: AgreementUpload = {
      uploaded: true,
      fileName,
      uploadedAt: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      effectiveLeaseStartDate: effectiveDate,
      leaseDurationMonths: parseInt(duration),
    };

    onComplete(data);
    toast.success('Renewal agreement uploaded successfully');
    setFileName('');
    setEffectiveDate('');
    setDuration('12');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Renewal Agreement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Read-only info */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Property:</span>
                <span className="font-medium">{renewal.property.propertyName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Rent:</span>
                <span>₹{renewal.lease.currentRent.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* PDF Upload */}
          <div className="space-y-2">
            <Label>Agreement Document (PDF mandatory) *</Label>
            <div 
              onClick={handleFileSelect}
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            >
              {fileName ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium">{fileName}</span>
                </div>
              ) : (
                <div>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload PDF</p>
                  <p className="text-xs text-muted-foreground">Only PDF files accepted</p>
                </div>
              )}
            </div>
          </div>

          {/* Effective Lease Start Date */}
          <div className="space-y-2">
            <Label htmlFor="effectiveDate">Effective Lease Start Date *</Label>
            <Input
              id="effectiveDate"
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
            />
          </div>

          {/* Lease Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Lease Duration (months) *</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="60"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="12"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              <Upload className="h-4 w-4 mr-2" />
              Upload & Lock Stage
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
