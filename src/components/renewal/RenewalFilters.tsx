import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, RotateCcw } from 'lucide-react';
import { RenewalFilters as FiltersType, RenewalStage, RiskLevel, RENEWAL_STAGE_LABELS } from '@/types/renewal';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface RenewalFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  cities: string[];
  zones: string[];
  activeFilterCount: number;
}

export function RenewalFilters({ 
  filters, 
  onFiltersChange, 
  cities, 
  zones,
  activeFilterCount 
}: RenewalFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const resetFilters = () => {
    onFiltersChange({
      searchQuery: '',
      expiryBucket: 'all',
    });
  };

  const stages: RenewalStage[] = [
    'not_started', 'renewal_initiated', 'negotiation_in_progress',
    'owner_acknowledgement_pending', 'agreement_sent', 'agreement_signed',
    'tcf_completed', 'pms_renewed', 'renewal_completed', 'renewal_failed'
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Search and Filter Toggle */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by property, ID, or PM name..."
                value={filters.searchQuery || ''}
                onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
                className="pl-10"
              />
            </div>
            
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>

          {/* Expandable Filters */}
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t">
                {/* City */}
                <Select
                  value={filters.city || 'all'}
                  onValueChange={(v) => onFiltersChange({ ...filters, city: v === 'all' ? undefined : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="City" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Zone */}
                <Select
                  value={filters.zone || 'all'}
                  onValueChange={(v) => onFiltersChange({ ...filters, zone: v === 'all' ? undefined : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Zones</SelectItem>
                    {zones.map(zone => (
                      <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Risk Level */}
                <Select
                  value={filters.riskLevel || 'all'}
                  onValueChange={(v) => onFiltersChange({ ...filters, riskLevel: v === 'all' ? undefined : v as RiskLevel })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risk Levels</SelectItem>
                    <SelectItem value="green">🟢 Green</SelectItem>
                    <SelectItem value="amber">🟡 Amber</SelectItem>
                    <SelectItem value="red">🔴 Red</SelectItem>
                  </SelectContent>
                </Select>

                {/* Stage */}
                <Select
                  value={filters.stage || 'all'}
                  onValueChange={(v) => onFiltersChange({ ...filters, stage: v === 'all' ? undefined : v as RenewalStage })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {stages.map(stage => (
                      <SelectItem key={stage} value={stage}>
                        {RENEWAL_STAGE_LABELS[stage]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Expiry Bucket */}
                <Select
                  value={filters.expiryBucket || 'all'}
                  onValueChange={(v) => onFiltersChange({ ...filters, expiryBucket: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Expiry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Expiry</SelectItem>
                    <SelectItem value="critical">🔴 0-15 Days</SelectItem>
                    <SelectItem value="urgent">🟡 16-30 Days</SelectItem>
                    <SelectItem value="upcoming">🔵 31-45 Days</SelectItem>
                    <SelectItem value="safe">🟢 45+ Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}
