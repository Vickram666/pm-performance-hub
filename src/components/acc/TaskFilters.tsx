import { useState } from 'react';
import { Filter, X, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

export type Urgency = 'critical' | 'high' | 'medium';
export type Category = 'renewal' | 'rent' | 'sr' | 'inspection' | 'followup' | 'churn';

export interface TaskFilterState {
  urgency: Urgency[];
  category: Category[];
  dueWithinDays: number | null;
  dateRange: DateRange | null;
}

export const EMPTY_TASK_FILTERS: TaskFilterState = {
  urgency: [],
  category: [],
  dueWithinDays: null,
  dateRange: null,
};

const URGENCIES: { id: Urgency; label: string; dot: string }[] = [
  { id: 'critical', label: 'Critical', dot: 'bg-urgency-critical' },
  { id: 'high', label: 'High', dot: 'bg-urgency-high' },
  { id: 'medium', label: 'Medium', dot: 'bg-urgency-medium' },
];

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'renewal', label: 'Renewal' },
  { id: 'rent', label: 'Rent' },
  { id: 'sr', label: 'Service request' },
  { id: 'inspection', label: 'Inspection' },
  { id: 'followup', label: 'Follow-up' },
  { id: 'churn', label: 'Churn' },
];

const DUE_BUCKETS = [
  { label: 'Overdue', value: 0 },
  { label: '≤ 24h', value: 1 },
  { label: '≤ 3d', value: 3 },
  { label: '≤ 7d', value: 7 },
];

interface Props {
  value: TaskFilterState;
  onChange: (v: TaskFilterState) => void;
}

export function TaskFilters({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const toggleUrgency = (u: Urgency) =>
    onChange({ ...value, urgency: value.urgency.includes(u) ? value.urgency.filter(x => x !== u) : [...value.urgency, u] });
  const toggleCategory = (c: Category) =>
    onChange({ ...value, category: value.category.includes(c) ? value.category.filter(x => x !== c) : [...value.category, c] });
  const setDue = (d: number | null) => onChange({ ...value, dueWithinDays: value.dueWithinDays === d ? null : d });

  const activeCount = value.urgency.length + value.category.length + (value.dueWithinDays !== null ? 1 : 0) + (value.dateRange ? 1 : 0);
  const clear = () => onChange(EMPTY_TASK_FILTERS);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            Filters
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 h-5">{activeCount}</Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 space-y-4" align="end">
          <div>
            <p className="text-xs font-semibold mb-2">Urgency</p>
            <div className="flex flex-wrap gap-1.5">
              {URGENCIES.map(u => (
                <button
                  key={u.id}
                  onClick={() => toggleUrgency(u.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border transition-colors',
                    value.urgency.includes(u.id) ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  <span className={cn('h-2 w-2 rounded-full', u.dot)} />
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold mb-2">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => toggleCategory(c.id)}
                  className={cn(
                    'px-2 py-1 rounded-md text-xs border transition-colors',
                    value.category.includes(c.id) ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold mb-2">Due within</p>
            <div className="flex flex-wrap gap-1.5">
              {DUE_BUCKETS.map(b => (
                <button
                  key={b.label}
                  onClick={() => setDue(b.value)}
                  className={cn(
                    'px-2 py-1 rounded-md text-xs border transition-colors',
                    value.dueWithinDays === b.value ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground',
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-1 border-t">
            <Button variant="ghost" size="sm" onClick={clear} disabled={activeCount === 0}>
              Clear all
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>Apply</Button>
          </div>
        </PopoverContent>
      </Popover>

      {value.urgency.map(u => (
        <Badge key={u} variant="secondary" className="gap-1 capitalize">
          {u} <X className="h-3 w-3 cursor-pointer" onClick={() => toggleUrgency(u)} />
        </Badge>
      ))}
      {value.category.map(c => (
        <Badge key={c} variant="secondary" className="gap-1 capitalize">
          {c} <X className="h-3 w-3 cursor-pointer" onClick={() => toggleCategory(c)} />
        </Badge>
      ))}
      {value.dueWithinDays !== null && (
        <Badge variant="secondary" className="gap-1">
          Due ≤ {value.dueWithinDays}d <X className="h-3 w-3 cursor-pointer" onClick={() => setDue(null)} />
        </Badge>
      )}
    </div>
  );
}

interface RangeProps {
  value: DateRange | null;
  onChange: (v: DateRange | null) => void;
}

export function DateRangePicker({ value, onChange }: RangeProps) {
  const [open, setOpen] = useState(false);
  const label = value?.from
    ? value.to
      ? `${format(value.from, 'MMM d')} – ${format(value.to, 'MMM d')}`
      : format(value.from, 'MMM d')
    : 'Custom range';
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <CalendarIcon className="h-3.5 w-3.5" />
          {label}
          {value && <X className="h-3 w-3 ml-1" onClick={(e) => { e.stopPropagation(); onChange(null); }} />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          selected={value ?? undefined}
          onSelect={(r) => onChange(r ?? null)}
          numberOfMonths={2}
          className={cn('p-3 pointer-events-auto')}
        />
      </PopoverContent>
    </Popover>
  );
}
