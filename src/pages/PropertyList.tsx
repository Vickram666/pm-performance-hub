import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Home, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PropertyFilters } from '@/components/property/PropertyFilters';
import { PropertyTable } from '@/components/property/PropertyTable';
import { PropertyAggregatesBar } from '@/components/property/PropertyAggregatesBar';
import { PropertyDetailModal } from '@/components/property/PropertyDetailModal';
import { allProperties, getPropertyAggregates, filterProperties } from '@/data/propertyData';
import { Property, PropertyFilters as FiltersType } from '@/types/property';
import { mockPMData } from '@/data/mockData';

export default function PropertyList() {
  const [searchParams] = useSearchParams();
  const pmId = searchParams.get('pmId');
  
  const [filters, setFilters] = useState<FiltersType>({
    scoreRange: [0, 100],
    lateRentOnly: false,
    renewalDueDays: null,
    lowOwnerRating: false,
    searchQuery: '',
  });

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const filteredProperties = useMemo(() => {
    return filterProperties(allProperties, filters);
  }, [filters]);

  const aggregates = useMemo(() => {
    return getPropertyAggregates(filteredProperties);
  }, [filteredProperties]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.scoreRange[0] > 0 || filters.scoreRange[1] < 100) count++;
    if (filters.lateRentOnly) count++;
    if (filters.renewalDueDays !== null) count++;
    if (filters.lowOwnerRating) count++;
    return count;
  }, [filters]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={pmId ? `/pm/${pmId}` : '/'}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Home className="h-6 w-6 text-primary" />
                  Property Portfolio
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-3 w-3" />
                  {mockPMData.profile.name} • {allProperties.length} Properties
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 space-y-6">
        {/* Aggregates Bar */}
        <PropertyAggregatesBar aggregates={aggregates} />

        {/* Filters */}
        <PropertyFilters 
          filters={filters} 
          onFiltersChange={setFilters}
          activeFilterCount={activeFilterCount}
        />

        {/* Property Table */}
        <PropertyTable 
          properties={filteredProperties}
          onPropertyClick={setSelectedProperty}
        />

        {/* Property Detail Modal */}
        <PropertyDetailModal
          property={selectedProperty}
          open={!!selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      </main>
    </div>
  );
}
