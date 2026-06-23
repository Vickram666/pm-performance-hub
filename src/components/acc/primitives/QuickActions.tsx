import { Phone, MessageSquare, StickyNote, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  context: string;
  className?: string;
}

export function QuickActions({ context, className }: Props) {
  const btn = 'h-7 w-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors';
  return (
    <div className={cn('flex items-center gap-0.5', className)} onClick={(e) => e.stopPropagation()}>
      <button className={btn} title="Call" onClick={() => toast.success(`Calling ${context}…`)}>
        <Phone className="h-3.5 w-3.5" />
      </button>
      <button className={btn} title="Message" onClick={() => toast.success(`Message drafted for ${context}`)}>
        <MessageSquare className="h-3.5 w-3.5" />
      </button>
      <button className={btn} title="Add note" onClick={() => toast(`Note added: ${context}`)}>
        <StickyNote className="h-3.5 w-3.5" />
      </button>
      <button className={btn} title="Mark done" onClick={() => toast.success(`Marked done: ${context}`)}>
        <CheckCircle2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
