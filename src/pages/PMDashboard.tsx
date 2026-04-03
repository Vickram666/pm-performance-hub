import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, LayoutList, Trophy, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeaderSummary } from '@/components/dashboard/HeaderSummary';
import { PropertyScoreSection } from '@/components/dashboard/PropertyScoreSection';
import { ScoreImpactPanel, generateScoreImpacts, generateQuickWins } from '@/components/dashboard/ScoreImpactPanel';
import { IncentiveSection } from '@/components/dashboard/IncentiveSection';
import { CoachingSection } from '@/components/dashboard/CoachingSection';
import { AwardsSection } from '@/components/dashboard/AwardsSection';
import { HistoricalTrendsSection } from '@/components/dashboard/HistoricalTrendsSection';
import { PageTransition } from '@/components/layout/PageTransition';
import { mockPMData, mockHistoricalTrends } from '@/data/mockData';

export default function PMDashboard() {
  const { pmId } = useParams();
  const [searchParams] = useSearchParams();
  const cityFilter = searchParams.get('city');
  const [selectedMonth, setSelectedMonth] = useState('January 2025');
  const data = mockPMData;
  const scoreImpacts = generateScoreImpacts(data.propertyScore);
  const quickWins = generateQuickWins(scoreImpacts);
  const previousScore = mockHistoricalTrends.dataPoints.length > 1 
    ? mockHistoricalTrends.dataPoints[mockHistoricalTrends.dataPoints.length - 2].propertyScore 
    : data.finalMonthlyScore;

  const backLink = cityFilter 
    ? `/leaderboard?city=${cityFilter}`
    : '/leaderboard';

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b">
          <div className="container py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Link to={backLink} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Leaderboard
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {data.profile.name}
              </span>
              {cityFilter && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({cityFilter})
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Link to={`/properties?pmId=${pmId}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <LayoutList className="h-4 w-4" />
                  Properties
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <HeaderSummary
          profile={data.profile}
          finalMonthlyScore={data.finalMonthlyScore}
          payoutBand={data.incentiveEligibility.payoutBand}
          eligibilityStatus={data.eligibilityStatus}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />

        <main className="container py-6 space-y-6">
          <PropertyScoreSection propertyScore={data.propertyScore} />
          <ScoreImpactPanel
            currentScore={data.finalMonthlyScore}
            previousScore={previousScore}
            payoutBand={data.incentiveEligibility.payoutBand}
            scoreImpacts={scoreImpacts}
            quickWins={quickWins}
          />
          <IncentiveSection
            incentiveEligibility={data.incentiveEligibility}
            eligibilityStatus={data.eligibilityStatus}
            coachingSuggestions={data.coachingSuggestions}
          />
          <CoachingSection suggestions={data.coachingSuggestions} />
          <AwardsSection awards={data.awards} />
          <HistoricalTrendsSection trends={mockHistoricalTrends} />
          <footer className="text-center py-8 text-sm text-muted-foreground">
            <p>PM Productivity Dashboard • Data updated monthly by Operations</p>
          </footer>
        </main>
      </div>
    </PageTransition>
  );
}
