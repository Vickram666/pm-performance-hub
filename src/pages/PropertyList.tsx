import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Home, User } from 'lucide-react';
import { PropertyFilters } from '@/components/property/PropertyFilters';
import { PropertyTable } from '@/components/property/PropertyTable';
import { PropertyAggregatesBar } from '@/components/property/PropertyAggregatesBar';
import { PropertyDetailModal } from '@/components/property/PropertyDetailModal';
import { PageTransition } from '@/components/layout/PageTransition';
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

  const filteredProperties = useMemo(() => filterProperties(allProperties, filters), [filters]);
  const aggregates = useMemo(() => getPropertyAggregates(filteredProperties), [filteredProperties]);
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.scoreRange[0] > 0 || filters.scoreRange[1] < 100) count++;
    if (filters.lateRentOnly) count++;
    if (filters.renewalDueDays !== null) count++;
    if (filters.lowOwnerRating) count++;
    return count;
  }, [filters]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Page Header */}
        <header className="bg-card border-b">
          <div className="container py-5">
            <div className="flex items-center gap-4">
              {pmId && (
                <Link to={`/pm/${pmId}`} className="text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              )}
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Home className="h-6 w-6 text-primary" />
                  Property Portfolio
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <User className="h-3 w-3" />
                  {mockPMData.profile.name} • {allProperties.length} Properties
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="container py-6 space-y-6">
          <PropertyAggregatesBar aggregates={aggregates} />
          <PropertyFilters filters={filters} onFiltersChange={setFilters} activeFilterCount={activeFilterCount} />
          <PropertyTable properties={filteredProperties} onPropertyClick={setSelectedProperty} />
          <PropertyDetailModal
            property={selectedProperty}
            open={!!selectedProperty}
            onClose={() => setSelectedProperty(null)}
          />
        </main>
      </div>
    </PageTransition>
  );
}
