import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LeaderboardFilters as FiltersType, IncentiveFilter } from '@/types/leaderboard';
import { getCitiesWithPMs, getZonesForCity } from '@/data/leaderboardData';

interface LeaderboardFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
}

export function LeaderboardFilters({ filters, onFiltersChange }: LeaderboardFiltersProps) {
  const cities = getCitiesWithPMs();
  const zones = filters.city ? getZonesForCity(filters.city) : [];

  const handleCityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      city: value === 'all' ? null : value,
      zone: null, // Reset zone when city changes
    });
  };

  const handleZoneChange = (value: string) => {
    onFiltersChange({
      ...filters,
      zone: value === 'all' ? null : value,
    });
  };

  const handleIncentiveChange = (value: IncentiveFilter) => {
    onFiltersChange({
      ...filters,
      incentiveStatus: value,
    });
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      searchQuery: value,
    });
  };

  return (
    <div className="flex flex-wrap gap-3 p-4 bg-card rounded-lg border">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search PM name..."
          value={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* City Filter */}
      <Select value={filters.city || 'all'} onValueChange={handleCityChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All Cities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cities</SelectItem>
          {cities.map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Zone Filter */}
      <Select 
        value={filters.zone || 'all'} 
        onValueChange={handleZoneChange}
        disabled={!filters.city}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="All Zones" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Zones</SelectItem>
          {zones.map((zone) => (
            <SelectItem key={zone} value={zone}>
              {zone}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Payout Status Filter */}
      <Select value={filters.incentiveStatus} onValueChange={handleIncentiveChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payout Status</SelectItem>
          <SelectItem value="eligible">100% Payout</SelectItem>
          <SelectItem value="partial">75% / 50% Payout</SelectItem>
          <SelectItem value="blocked">No Incentive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
