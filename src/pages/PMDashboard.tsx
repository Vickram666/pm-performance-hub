import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, LayoutList, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderSummary } from '@/components/dashboard/HeaderSummary';
import { PropertyScoreSection } from '@/components/dashboard/PropertyScoreSection';
import { ScoreImpactPanel, generateScoreImpacts, generateQuickWins } from '@/components/dashboard/ScoreImpactPanel';
import { IncentiveSection } from '@/components/dashboard/IncentiveSection';
import { CoachingSection } from '@/components/dashboard/CoachingSection';
import { AwardsSection } from '@/components/dashboard/AwardsSection';
import { HistoricalTrendsSection } from '@/components/dashboard/HistoricalTrendsSection';
import { mockPMData, mockHistoricalTrends } from '@/data/mockData';

export default function PMDashboard() {
  const { pmId } = useParams();
  const [searchParams] = useSearchParams();
  const cityFilter = searchParams.get('city');
  const zoneFilter = searchParams.get('zone');
  
  const [selectedMonth, setSelectedMonth] = useState('January 2025');
  const data = mockPMData;

  // Generate score impacts and quick wins from property score data
  const scoreImpacts = generateScoreImpacts(data.propertyScore);
  const quickWins = generateQuickWins(scoreImpacts);
  
  // Get previous month score from historical data
  const previousScore = mockHistoricalTrends.dataPoints.length > 1 
    ? mockHistoricalTrends.dataPoints[mockHistoricalTrends.dataPoints.length - 2].propertyScore 
    : data.finalMonthlyScore;

  // Build back link with preserved filters
  const backLink = cityFilter || zoneFilter 
    ? `/leaderboard?city=${cityFilter || ''}&zone=${zoneFilter || ''}`
    : '/leaderboard';

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <div className="bg-card border-b">
        <div className="container py-2 flex items-center justify-between">
          <Link to={backLink}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Leaderboard
              {cityFilter && (
                <span className="text-muted-foreground">
                  ({cityFilter}{zoneFilter && ` - ${zoneFilter}`})
                </span>
              )}
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link to={`/properties?pmId=${pmId}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <LayoutList className="h-4 w-4" />
                View Properties
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button variant="outline" size="sm" className="gap-2">
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Button>
            </Link>
          </div>
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
        {/* Property Score Section */}
        <PropertyScoreSection propertyScore={data.propertyScore} />

        {/* Score Impact Panel - Replaces Median Normalization */}
        <ScoreImpactPanel
          currentScore={data.finalMonthlyScore}
          previousScore={previousScore}
          payoutBand={data.incentiveEligibility.payoutBand}
          scoreImpacts={scoreImpacts}
          quickWins={quickWins}
        />

        {/* Incentive Eligibility */}
        <IncentiveSection
          incentiveEligibility={data.incentiveEligibility}
          eligibilityStatus={data.eligibilityStatus}
          coachingSuggestions={data.coachingSuggestions}
        />

        {/* Coaching Suggestions */}
        <CoachingSection suggestions={data.coachingSuggestions} />

        {/* Awards Section */}
        <AwardsSection awards={data.awards} />

        {/* Historical Trends */}
        <HistoricalTrendsSection trends={mockHistoricalTrends} />

        {/* Footer */}
        <footer className="text-center py-8 text-sm text-muted-foreground">
          <p>PM Productivity Dashboard • Data updated monthly by Operations</p>
          <p className="mt-1">Need help? Contact your Zone Manager</p>
        </footer>
      </main>
    </div>
  );
}
