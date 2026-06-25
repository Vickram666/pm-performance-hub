import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getAuditTrail, type AuditEvent } from '@/data/accOperationsData';
import { CheckCircle2, AlertTriangle, MessageSquare, FileText, UserCheck, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  taskId: string | null;
  taskTitle?: string;
  propertyName?: string;
}

const ICONS: Record<AuditEvent['kind'], typeof CheckCircle2> = {
  created: FileText,
  status_change: CheckCircle2,
  assigned: UserCheck,
  comment: MessageSquare,
  breach: AlertTriangle,
  resolved: Wrench,
};

const TONES: Record<AuditEvent['kind'], string> = {
  created: 'bg-info/15 text-info',
  status_change: 'bg-urgency-medium-soft text-urgency-medium',
  assigned: 'bg-primary/15 text-primary',
  comment: 'bg-muted text-muted-foreground',
  breach: 'bg-urgency-critical-soft text-urgency-critical',
  resolved: 'bg-urgency-low-soft text-urgency-low',
};

export function AuditTimeline({ open, onClose, taskId, taskTitle, propertyName }: Props) {
  const events = taskId ? getAuditTrail(taskId) : [];
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Audit timeline</DialogTitle>
          <DialogDescription>
            {taskTitle ?? 'Task'}{propertyName ? ` · ${propertyName}` : ''}
          </DialogDescription>
        </DialogHeader>
        <ol className="relative border-l border-border ml-2 space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {events.map((ev, i) => {
            const Icon = ICONS[ev.kind];
            return (
              <li key={i} className="ml-4">
                <span className={cn('absolute -left-[11px] flex h-5 w-5 items-center justify-center rounded-full border bg-background', TONES[ev.kind])}>
                  <Icon className="h-3 w-3" />
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium">{ev.label}</p>
                  <Badge variant="outline" className="text-[10px] font-normal capitalize">{ev.kind.replace('_', ' ')}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {ev.timestamp} · by <span className="text-foreground/80">{ev.actor}</span> ({ev.role})
                </p>
                {ev.detail && <p className="text-xs text-foreground/80 mt-0.5">{ev.detail}</p>}
              </li>
            );
          })}
          {events.length === 0 && <p className="text-sm text-muted-foreground py-4">No audit events.</p>}
        </ol>
      </DialogContent>
    </Dialog>
  );
}
