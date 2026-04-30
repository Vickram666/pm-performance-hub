import { Search, Filter, RotateCcw, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { PropertyFilters as FiltersType } from '@/types/property';

interface PropertyFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  activeFilterCount: number;
}

export function PropertyFilters({ filters, onFiltersChange, activeFilterCount }: PropertyFiltersProps) {
  const update = (patch: Partial<FiltersType>) => onFiltersChange({ ...filters, ...patch });

  const clearAll = () => onFiltersChange({
    scoreRange: [0, 100],
    lateRentOnly: false,
    renewalDueDays: null,
    lowOwnerRating: false,
    searchQuery: '',
  });

  const QuickChip = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        active
          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
          : 'bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
      }`}
    >
      {children}
      {active && <X className="h-3 w-3" />}
    </button>
  );

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        {/* Top row: search + filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search property ID or name..."
              value={filters.searchQuery}
              onChange={(e) => update({ searchQuery: e.target.value })}
              className="pl-9"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-10">
                <Filter className="h-4 w-4" />
                Advanced
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                    Score Range: {filters.scoreRange[0]} – {filters.scoreRange[1]}
                  </Label>
                  <Slider
                    min={0} max={100} step={5}
                    value={filters.scoreRange}
                    onValueChange={(v) => update({ scoreRange: [v[0], v[1]] })}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="lateRent" checked={filters.lateRentOnly}
                      onCheckedChange={(c) => update({ lateRentOnly: !!c })} />
                    <Label htmlFor="lateRent" className="text-sm">Late Rent Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="lowRating" checked={filters.lowOwnerRating}
                      onCheckedChange={(c) => update({ lowOwnerRating: !!c })} />
                    <Label htmlFor="lowRating" className="text-sm">Low Owner Rating (&lt;4)</Label>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={clearAll} className="w-full">
                  Clear all filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1 h-10">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>

        {/* Quick chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="text-xs text-muted-foreground self-center mr-1">Quick filters:</span>
          <QuickChip active={filters.lateRentOnly} onClick={() => update({ lateRentOnly: !filters.lateRentOnly })}>
            Late Rent
          </QuickChip>
          <QuickChip active={filters.renewalDueDays === 30}
            onClick={() => update({ renewalDueDays: filters.renewalDueDays === 30 ? null : 30 })}>
            Renewal ≤ 30d
          </QuickChip>
          <QuickChip active={filters.renewalDueDays === 60}
            onClick={() => update({ renewalDueDays: filters.renewalDueDays === 60 ? null : 60 })}>
            Renewal ≤ 60d
          </QuickChip>
          <QuickChip active={filters.lowOwnerRating}
            onClick={() => update({ lowOwnerRating: !filters.lowOwnerRating })}>
            Low Owner Rating
          </QuickChip>
        </div>
      </CardContent>
    </Card>
  );
}
