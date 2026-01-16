import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
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
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      searchQuery: value,
    });
  };

  const handleScoreRangeChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      scoreRange: [value[0], value[1]],
    });
  };

  const handleLateRentChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      lateRentOnly: checked,
    });
  };

  const handleRenewalDueChange = (days: number | null) => {
    onFiltersChange({
      ...filters,
      renewalDueDays: filters.renewalDueDays === days ? null : days,
    });
  };

  const handleLowOwnerRatingChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      lowOwnerRating: checked,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      scoreRange: [0, 100],
      lateRentOnly: false,
      renewalDueDays: null,
      lowOwnerRating: false,
      searchQuery: '',
    });
  };

  return (
    <div className="flex flex-wrap gap-3 p-4 bg-card rounded-lg border">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search property ID or name..."
          value={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Badge 
          variant={filters.lateRentOnly ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/80 transition-colors"
          onClick={() => handleLateRentChange(!filters.lateRentOnly)}
        >
          Late Rent
        </Badge>
        <Badge 
          variant={filters.renewalDueDays === 30 ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/80 transition-colors"
          onClick={() => handleRenewalDueChange(30)}
        >
          Renewal ≤30d
        </Badge>
        <Badge 
          variant={filters.renewalDueDays === 60 ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/80 transition-colors"
          onClick={() => handleRenewalDueChange(60)}
        >
          Renewal ≤60d
        </Badge>
        <Badge 
          variant={filters.lowOwnerRating ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/80 transition-colors"
          onClick={() => handleLowOwnerRatingChange(!filters.lowOwnerRating)}
        >
          Low Rating (&lt;4)
        </Badge>
      </div>

      {/* Advanced Filters */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Score Range: {filters.scoreRange[0]} - {filters.scoreRange[1]}</Label>
              <Slider
                min={0}
                max={100}
                step={5}
                value={filters.scoreRange}
                onValueChange={handleScoreRangeChange}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="lateRent" 
                  checked={filters.lateRentOnly}
                  onCheckedChange={(checked) => handleLateRentChange(!!checked)}
                />
                <Label htmlFor="lateRent">Late Rent Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="lowRating" 
                  checked={filters.lowOwnerRating}
                  onCheckedChange={(checked) => handleLowOwnerRatingChange(!!checked)}
                />
                <Label htmlFor="lowRating">Low Owner Rating (&lt;4)</Label>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
              Clear All Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
