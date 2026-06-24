import { useEffect, useState } from 'react';
import { Phone, MessageSquare, Mail, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface CommunicateContext {
  taskTitle: string;
  nextStep: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  propertyName?: string;
  propertyId?: string;
  category?: string;
}

interface Props {
  open: boolean;
  context: CommunicateContext | null;
  onClose: () => void;
}

type Channel = 'call' | 'whatsapp' | 'email';

export function CommunicateModal({ open, context, onClose }: Props) {
  const [channel, setChannel] = useState<Channel>('whatsapp');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!context) return;
    const intro = channel === 'email' ? `Hi ${context.contactName},\n\n` : `Hi ${context.contactName}, `;
    const body = `Reaching out regarding ${context.propertyName ? `“${context.propertyName}”` : 'your property'}.\n\nIssue: ${context.taskTitle}\nNext step: ${context.nextStep}\n\nCan you confirm timing so we can resolve this today?\n\n— Azuro Property Manager`;
    setMessage(channel === 'email' ? intro + body : `${intro}quick note on ${context.propertyName ?? 'your property'} — ${context.taskTitle}. ${context.nextStep}. Please confirm. — Azuro`);
  }, [context, channel]);

  if (!context) return null;

  const handleSend = () => {
    toast.success(`${channel === 'call' ? 'Call logged' : channel === 'whatsapp' ? 'WhatsApp drafted' : 'Email queued'} to ${context.contactName}`, {
      description: context.taskTitle,
    });
    onClose();
  };

  const channels: { id: Channel; label: string; icon: typeof Phone }[] = [
    { id: 'call', label: 'Call', icon: Phone },
    { id: 'whatsapp', label: 'Message', icon: MessageSquare },
    { id: 'email', label: 'Email', icon: Mail },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Communicate with property</DialogTitle>
          <DialogDescription>
            Prefilled from the task. Edit before sending.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-md border bg-muted/40 p-3 text-xs space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="font-normal">{context.propertyName ?? '—'}</Badge>
              {context.category && <Badge variant="secondary" className="font-normal">{context.category}</Badge>}
            </div>
            <p className="text-foreground"><span className="text-muted-foreground">Task:</span> {context.taskTitle}</p>
            <p className="text-foreground"><span className="text-muted-foreground">Next step:</span> {context.nextStep}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">To</p>
            <Input value={`${context.contactName}${context.contactPhone ? ` · ${context.contactPhone}` : ''}`} readOnly />
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Channel</p>
            <div className="inline-flex rounded-md border p-0.5 bg-card">
              {channels.map(c => (
                <button
                  key={c.id}
                  onClick={() => setChannel(c.id)}
                  className={cn(
                    'px-3 py-1.5 text-xs rounded-sm inline-flex items-center gap-1.5 transition-colors',
                    channel === c.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <c.icon className="h-3.5 w-3.5" />
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              {channel === 'call' ? 'Call notes (logged after call)' : channel === 'email' ? 'Email body' : 'Message'}
            </p>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={channel === 'email' ? 8 : 5}
              className="text-xs"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSend} className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            {channel === 'call' ? 'Log call' : channel === 'email' ? 'Send email' : 'Send message'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
