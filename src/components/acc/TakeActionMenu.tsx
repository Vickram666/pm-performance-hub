import { useState } from 'react';
import {
  Zap, ArrowRight, ChevronDown,
  UserCheck, CalendarClock, ShieldAlert, CheckCircle2, FileText, Wrench, Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export type TaskKind = 'sr' | 'rent' | 'inspection' | 'renewal' | 'followup' | 'escalation';

interface Props {
  kind: TaskKind;
  taskTitle: string;
  propertyName?: string;
  propertyId?: string;
  onOpenProperty?: (id: string) => void;
  onOpenAudit?: () => void;
}

interface Action {
  id: string;
  label: string;
  icon: typeof Zap;
  toastText: string;
  toastDesc?: string;
  destructive?: boolean;
}

const ACTIONS: Record<TaskKind, Action[]> = {
  sr: [
    { id: 'assign', label: 'Assign vendor', icon: UserCheck, toastText: 'Vendor assigned', toastDesc: 'Tenant notified, ETA set' },
    { id: 'schedule', label: 'Schedule visit', icon: CalendarClock, toastText: 'Visit scheduled' },
    { id: 'resolve', label: 'Mark resolved', icon: CheckCircle2, toastText: 'Marked resolved · awaiting tenant sign-off' },
    { id: 'escalate', label: 'Escalate to TL', icon: ShieldAlert, toastText: 'Escalated to Team Lead', destructive: true },
  ],
  rent: [
    { id: 'commit', label: 'Log payment commitment', icon: FileText, toastText: 'Commitment logged · reminder set' },
    { id: 'reminder', label: 'Send formal reminder', icon: Phone, toastText: 'Formal reminder sent to tenant' },
    { id: 'escalate', label: 'Escalate to TL', icon: ShieldAlert, toastText: 'Escalated · legal-track flag raised', destructive: true },
    { id: 'note', label: 'Add audit note', icon: FileText, toastText: 'Audit note added' },
  ],
  inspection: [
    { id: 'schedule', label: 'Schedule walkthrough', icon: CalendarClock, toastText: 'Walkthrough scheduled' },
    { id: 'complete', label: 'Mark step complete', icon: CheckCircle2, toastText: 'Step marked complete' },
    { id: 'upload', label: 'Upload report', icon: FileText, toastText: 'Report upload link copied' },
    { id: 'escalate', label: 'Flag blocker', icon: ShieldAlert, toastText: 'Blocker flagged · TL notified', destructive: true },
  ],
  renewal: [
    { id: 'owner', label: 'Log owner alignment', icon: UserCheck, toastText: 'Owner alignment captured' },
    { id: 'proposal', label: 'Send proposal', icon: FileText, toastText: 'Proposal sent' },
    { id: 'escalate', label: 'Escalate to TL', icon: ShieldAlert, toastText: 'Escalated to TL', destructive: true },
  ],
  followup: [
    { id: 'done', label: 'Mark done', icon: CheckCircle2, toastText: 'Follow-up closed' },
    { id: 'snooze', label: 'Snooze 24h', icon: CalendarClock, toastText: 'Snoozed for 24 hours' },
    { id: 'note', label: 'Add audit note', icon: FileText, toastText: 'Note added' },
  ],
  escalation: [
    { id: 'own', label: 'Take ownership', icon: UserCheck, toastText: 'Ownership taken · 24h SLA started' },
    { id: 'route', label: 'Route to vendor ops', icon: Wrench, toastText: 'Routed to vendor ops' },
    { id: 'close', label: 'Close escalation', icon: CheckCircle2, toastText: 'Escalation closed' },
  ],
};

export function TakeActionMenu({ kind, taskTitle, propertyName, propertyId, onOpenProperty, onOpenAudit }: Props) {
  const [primary, ...rest] = ACTIONS[kind];
  const fire = (a: Action) => toast.success(a.toastText, { description: a.toastDesc ?? `${taskTitle}${propertyName ? ` · ${propertyName}` : ''}` });

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <Button size="sm" variant="default" className="h-7 text-xs gap-1 px-2" onClick={() => fire(primary)}>
        <primary.icon className="h-3 w-3" /> {primary.label}
      </Button>
      <DropdownMenuWrapper rest={rest} fire={fire} onOpenAudit={onOpenAudit} />
      {propertyId && onOpenProperty && (
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Open property" onClick={() => onOpenProperty(propertyId)}>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

function DropdownMenuWrapper({ rest, fire, onOpenAudit }: { rest: Action[]; fire: (a: Action) => void; onOpenAudit?: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="More actions">
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Quick actions</DropdownMenuLabel>
        {rest.map(a => (
          <DropdownMenuItem key={a.id} onSelect={() => fire(a)} className={a.destructive ? 'text-urgency-critical focus:text-urgency-critical' : ''}>
            <a.icon className="h-3.5 w-3.5 mr-2" /> {a.label}
          </DropdownMenuItem>
        ))}
        {onOpenAudit && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onOpenAudit}>
              <FileText className="h-3.5 w-3.5 mr-2" /> View audit timeline
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
