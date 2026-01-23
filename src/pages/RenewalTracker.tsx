import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Users, BarChart3, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RenewalFunnel } from '@/components/renewal/RenewalFunnel';
import { RenewalFilters } from '@/components/renewal/RenewalFilters';
import { RenewalTable } from '@/components/renewal/RenewalTable';
import { RenewalDetailModal } from '@/components/renewal/RenewalDetailModal';
import { PMActionList } from '@/components/renewal/PMActionList';
import { TLDashboard } from '@/components/renewal/TLDashboard';
import { LeadershipDashboard } from '@/components/renewal/LeadershipDashboard';
import { 
  allRenewals, 
  filterRenewals, 
  calculateFunnelStats,
  getPMRenewalSummaries,
  getLeadershipStats,
  getPMActionItems
} from '@/data/renewalData';
import { RenewalRecord, RenewalFilters as FiltersType } from '@/types/renewal';

type ViewMode = 'pm' | 'tl' | 'leadership';

export default function RenewalTracker() {
  const [searchParams] = useSearchParams();
  const pmId = searchParams.get('pmId') || 'PM001';
  
  const [viewMode, setViewMode] = useState<ViewMode>('pm');
  const [renewals, setRenewals] = useState<RenewalRecord[]>(() => allRenewals);
  const [filters, setFilters] = useState<FiltersType>({
    expiryBucket: 'all',
    searchQuery: '',
  });
  const [selectedRenewal, setSelectedRenewal] = useState<RenewalRecord | null>(null);

  // Get unique cities and zones
  const cities = useMemo(() => 
    [...new Set(renewals.map(r => r.property.city))].sort(),
    [renewals]
  );
  const zones = useMemo(() => 
    [...new Set(renewals.map(r => r.property.zone))].sort(),
    [renewals]
  );

  // Filter renewals based on view mode
  const filteredRenewals = useMemo(() => {
    let baseFilters = { ...filters };
    if (viewMode === 'pm') {
      baseFilters.pmId = pmId;
    }
    return filterRenewals(renewals, baseFilters);
  }, [filters, viewMode, pmId, renewals]);

  // Calculate stats
  const funnelStats = useMemo(() => 
    calculateFunnelStats(filteredRenewals),
    [filteredRenewals]
  );

  const pmSummaries = useMemo(() => 
    getPMRenewalSummaries(renewals),
    [renewals]
  );

  const leadershipStats = useMemo(() => 
    getLeadershipStats(renewals),
    [renewals]
  );

  const pmActionItems = useMemo(() => 
    getPMActionItems(renewals, pmId),
    [renewals, pmId]
  );

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.city) count++;
    if (filters.zone) count++;
    if (filters.riskLevel) count++;
    if (filters.stage) count++;
    if (filters.expiryBucket && filters.expiryBucket !== 'all') count++;
    if (filters.searchQuery) count++;
    return count;
  }, [filters]);

  const handleBucketClick = (bucket: string) => {
    setFilters(prev => ({ 
      ...prev, 
      expiryBucket: bucket as FiltersType['expiryBucket'] 
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <RefreshCw className="h-6 w-6 text-primary" />
                  Renewal Tracker
                </h1>
                <p className="text-sm text-muted-foreground">
                  Proactive renewal management • SOP-driven • Audit-proof
                </p>
              </div>
            </div>
            
            {/* View Mode Tabs */}
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
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 space-y-6">
        {viewMode === 'pm' && (
          <>
            {/* Action List */}
            <PMActionList 
              needsActionToday={pmActionItems.needsActionToday}
              onRenewalClick={setSelectedRenewal}
            />

            {/* Funnel Stats */}
            <RenewalFunnel 
              stats={funnelStats} 
              onBucketClick={handleBucketClick}
            />

            {/* Filters */}
            <RenewalFilters
              filters={filters}
              onFiltersChange={setFilters}
              cities={cities}
              zones={zones}
              activeFilterCount={activeFilterCount}
            />

            {/* Renewal Table */}
            <RenewalTable
              renewals={filteredRenewals}
              onRenewalClick={setSelectedRenewal}
            />
          </>
        )}

        {viewMode === 'tl' && (
          <TLDashboard pmSummaries={pmSummaries} />
        )}

        {viewMode === 'leadership' && (
          <LeadershipDashboard stats={leadershipStats} />
        )}

        {/* Detail Modal */}
        <RenewalDetailModal
          renewal={selectedRenewal}
          open={!!selectedRenewal}
          onClose={() => setSelectedRenewal(null)}
          onRenewalUpdate={(updated) => {
            setRenewals((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            setSelectedRenewal(updated);
          }}
        />
      </main>
    </div>
  );
}
