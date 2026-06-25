import { DateRangePicker } from './TaskFilters';
import { GlossaryButton } from './Glossary';
import { PERIOD_LABEL, type AccPeriod } from '@/data/accAggregators';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';

const PERIODS: AccPeriod[] = ['today', 'week', 'month', 'quarter'];

interface Props {
  period: AccPeriod;
  onPeriodChange: (p: AccPeriod) => void;
  dateRange: DateRange | null;
  onDateRangeChange: (r: DateRange | null) => void;
}

export function PeriodControls({ period, onPeriodChange, dateRange, onDateRangeChange }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="inline-flex rounded-md border border-border/70 bg-card p-0.5">
        {PERIODS.map(p => (
          <button
            key={p}
            onClick={() => { onPeriodChange(p); onDateRangeChange(null); }}
            className={cn(
              'px-2.5 py-1 text-xs rounded-sm transition-colors',
              period === p && !dateRange ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {PERIOD_LABEL[p]}
          </button>
        ))}
      </div>
      <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
      <GlossaryButton />
    </div>
  );
}
