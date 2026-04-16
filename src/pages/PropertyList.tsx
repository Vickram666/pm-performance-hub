import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Home, User, Calendar, Users, BarChart3, PieChart } from 'lucide-react';
import { PropertyFilters } from '@/components/property/PropertyFilters';
import { PropertyTable } from '@/components/property/PropertyTable';
import { PropertyAggregatesBar } from '@/components/property/PropertyAggregatesBar';
import { PropertyDetailModal } from '@/components/property/PropertyDetailModal';
import { PropertyTLDashboard } from '@/components/property/PropertyTLDashboard';
import { PropertyLeadershipDashboard } from '@/components/property/PropertyLeadershipDashboard';
import { PropertyAnalyticsDashboard } from '@/components/property/PropertyAnalyticsDashboard';
import { PageTransition } from '@/components/layout/PageTransition';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { allProperties, getPropertyAggregates, filterProperties, getPMPropertySummaries, getCityPropertyStats, getPropertyAnalyticsStats } from '@/data/propertyData';
import { Property, PropertyFilters as FiltersType } from '@/types/property';
import { mockPMData } from '@/data/mockData';

type ViewMode = 'pm' | 'tl' | 'leadership' | 'analytics';

export default function PropertyList() {
  const [searchParams] = useSearchParams();
  const pmId = searchParams.get('pmId');
  const [viewMode, setViewMode] = useState<ViewMode>('pm');
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
  const pmSummaries = useMemo(() => getPMPropertySummaries(allProperties), []);
  const cityStats = useMemo(() => getCityPropertyStats(allProperties), []);
  const analyticsStats = useMemo(() => getPropertyAnalyticsStats(allProperties), []);
  const overallAvgScore = useMemo(() => 
    Math.round(allProperties.reduce((s, p) => s + p.healthScore, 0) / allProperties.length * 10) / 10,
  []);

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
        <header className="bg-card border-b">
          <div className="container py-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
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
                  <p className="text-sm text-muted-foreground">
                    Score-driven • Action-oriented • Notes-tracked
                  </p>
                </div>
              </div>

              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="pm" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    PM View
                  </TabsTrigger>
                  <TabsTrigger value="tl" className="gap-2">
                    <Users className="h-4 w-4" />
                    TL View
                  </TabsTrigger>
                  <TabsTrigger value="leadership" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Leadership
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="gap-2">
                    <PieChart className="h-4 w-4" />
                    Analytics
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </header>

        <main className="container py-6 space-y-6">
          {viewMode === 'pm' && (
            <>
              <PropertyAggregatesBar aggregates={aggregates} />
              <PropertyFilters filters={filters} onFiltersChange={setFilters} activeFilterCount={activeFilterCount} />
              <PropertyTable properties={filteredProperties} onPropertyClick={setSelectedProperty} />
              <PropertyDetailModal
                property={selectedProperty}
                open={!!selectedProperty}
                onClose={() => setSelectedProperty(null)}
              />
            </>
          )}

          {viewMode === 'tl' && (
            <PropertyTLDashboard pmSummaries={pmSummaries} />
          )}

          {viewMode === 'leadership' && (
            <PropertyLeadershipDashboard 
              cityStats={cityStats}
              totalProperties={allProperties.length}
              overallAvgScore={overallAvgScore}
            />
          )}

          {viewMode === 'analytics' && (
            <PropertyAnalyticsDashboard stats={analyticsStats} />
          )}
        </main>
      </div>
    </PageTransition>
  );
}
