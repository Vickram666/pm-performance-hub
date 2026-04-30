import { useMemo, useRef } from 'react';
import { StickyNote, ArrowDown, Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PropertyNote } from '@/types/property';

interface PropertyNotesTimelineProps {
  notes: PropertyNote[];
}

const noteTypeStyles: Record<PropertyNote['type'], string> = {
  general: 'bg-primary/10 text-primary border-primary/30',
  escalation: 'bg-destructive/10 text-destructive border-destructive/30',
  'follow-up': 'bg-warning/10 text-warning border-warning/30',
  resolution: 'bg-success/10 text-success border-success/30',
};

function daysSince(dateStr: string): number {
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function PropertyNotesTimeline({ notes }: PropertyNotesTimelineProps) {
  const latestRef = useRef<HTMLDivElement | null>(null);

  // Sort newest-first for timeline display
  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [notes],
  );

  const latest = sortedNotes[0];
  const daysSinceLatest = latest ? daysSince(latest.createdAt) : null;
  const isStale = daysSinceLatest !== null && daysSinceLatest > 14;

  const jumpToLatest = () => {
    latestRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (notes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-warning/40 bg-warning/5 p-4 text-center">
        <StickyNote className="h-8 w-8 text-warning/70 mx-auto mb-2" />
        <p className="text-sm font-medium text-warning">No new notes</p>
        <p className="text-xs text-muted-foreground mt-1">
          Add a note to start tracking updates for this property.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header strip */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 text-xs">
          {isStale ? (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
              <Clock className="h-3 w-3 mr-1" />
              No new notes in {daysSinceLatest}d
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Last updated {daysSinceLatest === 0 ? 'today' : `${daysSinceLatest}d ago`}
            </Badge>
          )}
        </div>
        {sortedNotes.length > 1 && (
          <Button size="sm" variant="ghost" onClick={jumpToLatest} className="h-7 text-xs gap-1">
            <ArrowDown className="h-3 w-3" />
            Jump to latest
          </Button>
        )}
      </div>

      {/* Timeline */}
      <div className="relative pl-5 max-h-[260px] overflow-y-auto pr-1">
        <div className="absolute left-1.5 top-1 bottom-1 w-px bg-border" />
        {sortedNotes.map((note, idx) => {
          const isLatest = idx === 0;
          return (
            <div
              key={note.id}
              ref={isLatest ? latestRef : undefined}
              className="relative pb-4 last:pb-0"
            >
              <span
                className={cn(
                  'absolute -left-3.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background',
                  isLatest ? 'bg-primary ring-2 ring-primary/30' : 'bg-muted-foreground/40',
                )}
              />
              <div className="rounded-md border bg-muted/20 p-2.5 text-sm">
                <div className="flex items-start gap-2 mb-1">
                  <Badge
                    variant="outline"
                    className={cn('text-[10px] shrink-0', noteTypeStyles[note.type])}
                  >
                    {note.type}
                  </Badge>
                  {isLatest && (
                    <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                      Latest
                    </Badge>
                  )}
                </div>
                <p className="text-foreground">{note.text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {note.createdBy} • {note.createdAt}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
