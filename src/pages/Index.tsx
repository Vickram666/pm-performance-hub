import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderSummary } from '@/components/dashboard/HeaderSummary';
import { PropertyScoreSection } from '@/components/dashboard/PropertyScoreSection';
import { MedianNormalization } from '@/components/dashboard/MedianNormalization';
import { IncentiveSection } from '@/components/dashboard/IncentiveSection';
import { CoachingSection } from '@/components/dashboard/CoachingSection';
import { AwardsSection } from '@/components/dashboard/AwardsSection';
import { HistoricalTrendsSection } from '@/components/dashboard/HistoricalTrendsSection';
import { mockPMData, mockHistoricalTrends } from '@/data/mockData';

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState('January 2025');
  const data = mockPMData;

  return (
    <div className="min-h-screen bg-background">
      {/* Quick Navigation */}
      <div className="bg-card border-b">
        <div className="container py-2 flex items-center justify-end gap-2">
          <Link to="/properties">
            <Button variant="outline" size="sm" className="gap-2">
              <LayoutList className="h-4 w-4" />
              My Properties
            </Button>
          </Link>
          <Link to="/leaderboard">
            <Button variant="default" size="sm" className="gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Sticky Header */}
      <HeaderSummary
        profile={data.profile}
        finalMonthlyScore={data.finalMonthlyScore}
        payoutBand={data.incentiveEligibility.payoutBand}
        eligibilityStatus={data.eligibilityStatus}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      {/* Main Content */}
      <main className="container py-6 space-y-6">
        <PropertyScoreSection propertyScore={data.propertyScore} />
        <MedianNormalization propertyScore={data.propertyScore} />
        
        {/* Incentive Eligibility - No rupee amounts */}
        <IncentiveSection
          incentiveEligibility={data.incentiveEligibility}
          eligibilityStatus={data.eligibilityStatus}
          coachingSuggestions={data.coachingSuggestions}
        />
        
        {/* Historical Trends Section */}
        <HistoricalTrendsSection trends={mockHistoricalTrends} />
        
        <CoachingSection suggestions={data.coachingSuggestions} />
        <AwardsSection awards={data.awards} />
        <footer className="text-center py-8 text-sm text-muted-foreground">
          <p>PM Productivity Dashboard • Data updated monthly by Operations</p>
          <p className="mt-1">Need help? Contact your Zone Manager</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
