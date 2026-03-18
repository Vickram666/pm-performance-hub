import { useState, useMemo } from 'react';
import { Trophy, Users, Building2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeaderboardFilters } from '@/components/leaderboard/LeaderboardFilters';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { CityStatsCard } from '@/components/leaderboard/CityStatsCard';
import { PageTransition } from '@/components/layout/PageTransition';
import { allPMs, cityStats } from '@/data/leaderboardData';
import { LeaderboardFilters as FiltersType } from '@/types/leaderboard';

export default function Leaderboard() {
  const [filters, setFilters] = useState<FiltersType>({
    city: null,
    zone: null,
    scoreType: 'property',
    incentiveStatus: 'all',
    searchQuery: '',
  });

  const [activeTab, setActiveTab] = useState<'all' | 'city'>('all');

  const filteredAndSortedPMs = useMemo(() => {
    let result = [...allPMs];
    if (filters.city) result = result.filter(pm => pm.city === filters.city);
    if (filters.zone) result = result.filter(pm => pm.zone === filters.zone);
    if (filters.incentiveStatus !== 'all') result = result.filter(pm => pm.incentiveStatus === filters.incentiveStatus);
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(pm => pm.name.toLowerCase().includes(query) || pm.id.toLowerCase().includes(query));
    }
    result.sort((a, b) => b.propertyScore - a.propertyScore);
    return result.map((pm, index) => ({
      ...pm,
      rank: index + 1,
      percentile: Math.round((1 - index / result.length) * 100),
    }));
  }, [filters]);

  const selectedCityStats = filters.city ? cityStats.find(c => c.city === filters.city) : null;

  const handleZoneClick = (zone: string) => {
    setFilters(prev => ({ ...prev, zone: prev.zone === zone ? null : zone }));
  };

  const companyStats = useMemo(() => {
    const eligible = allPMs.filter(pm => pm.incentiveStatus === 'eligible').length;
    return {
      totalPMs: allPMs.length,
      avgPropertyScore: Math.round(allPMs.reduce((sum, pm) => sum + pm.propertyScore, 0) / allPMs.length * 10) / 10,
      eligiblePercent: Math.round(eligible / allPMs.length * 100),
    };
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Page Header */}
        <header className="bg-card border-b">
          <div className="container py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  PM Leaderboard
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Company-wide rankings • {allPMs.length} PMs
                </p>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xl font-bold text-primary">{companyStats.avgPropertyScore}</p>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-success">{companyStats.eligiblePercent}%</p>
                  <p className="text-xs text-muted-foreground">100% Payout</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container py-6 space-y-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'city')}>
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="gap-2">
                <Users className="h-4 w-4" />All PMs
              </TabsTrigger>
              <TabsTrigger value="city" className="gap-2">
                <Building2 className="h-4 w-4" />By City
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <LeaderboardFilters filters={filters} onFiltersChange={setFilters} />
              {selectedCityStats && (
                <CityStatsCard stats={selectedCityStats} onZoneClick={handleZoneClick} selectedZone={filters.zone} />
              )}
              <LeaderboardTable entries={filteredAndSortedPMs} cityFilter={filters.city} zoneFilter={filters.zone} />
            </TabsContent>

            <TabsContent value="city" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cityStats.map(city => (
                  <CityStatsCard
                    key={city.city}
                    stats={city}
                    onZoneClick={(zone) => {
                      setFilters(prev => ({ ...prev, city: city.city, zone }));
                      setActiveTab('all');
                    }}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </PageTransition>
  );
}
