import { Phone, MessageSquare, StickyNote, Flag, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  contact?: string;
  onOpen?: () => void;
  className?: string;
}

const btn =
  'inline-flex items-center justify-center h-6 w-6 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors';

export function InlineQuickActions({ contact, onOpen, className }: Props) {
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <div className={cn('inline-flex items-center gap-0.5', className)} onClick={stop}>
      <button className={btn} title="Call" onClick={() => toast.success(`Calling ${contact ?? 'contact'}`)}>
        <Phone className="h-3.5 w-3.5" />
      </button>
      <button className={btn} title="Message" onClick={() => toast.success('Message drafted')}>
        <MessageSquare className="h-3.5 w-3.5" />
      </button>
      <button className={btn} title="Add note" onClick={() => { onOpen?.(); toast.success('Open property to add note'); }}>
        <StickyNote className="h-3.5 w-3.5" />
      </button>
      <button className={btn} title="Escalate" onClick={() => toast.warning('Escalated to Team Lead')}>
        <Flag className="h-3.5 w-3.5" />
      </button>
      <button className={btn} title="Mark done" onClick={() => toast.success('Marked done')}>
        <Check className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
