import { useState } from 'react';
import { HeaderSummary } from '@/components/dashboard/HeaderSummary';
import { PropertyScoreSection } from '@/components/dashboard/PropertyScoreSection';
import { ScoreImpactPanel, generateScoreImpacts, generateQuickWins } from '@/components/dashboard/ScoreImpactPanel';
import { IncentiveSection } from '@/components/dashboard/IncentiveSection';
import { CoachingSection } from '@/components/dashboard/CoachingSection';
import { AwardsSection } from '@/components/dashboard/AwardsSection';
import { HistoricalTrendsSection } from '@/components/dashboard/HistoricalTrendsSection';
import { MyDayActionFeed } from '@/components/dashboard/MyDayActionFeed';
import { ScoreSimulator } from '@/components/dashboard/ScoreSimulator';
import { StreakIndicator } from '@/components/dashboard/StreakIndicator';
import { SmartNotifications } from '@/components/renewal/SmartNotifications';
import { PageTransition } from '@/components/layout/PageTransition';
import { mockPMData, mockHistoricalTrends } from '@/data/mockData';
import { allProperties } from '@/data/propertyData';
import { allRenewals } from '@/data/renewalData';

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState('January 2025');
  const data = mockPMData;
  const scoreImpacts = generateScoreImpacts(data.propertyScore);
  const quickWins = generateQuickWins(scoreImpacts);
  const previousScore = mockHistoricalTrends.dataPoints.length > 1 
    ? mockHistoricalTrends.dataPoints[mockHistoricalTrends.dataPoints.length - 2].propertyScore 
    : data.finalMonthlyScore;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
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
          {/* Streak & Momentum Indicators */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <StreakIndicator
              dataPoints={mockHistoricalTrends.dataPoints}
              trend={mockHistoricalTrends.trend}
            />
          </div>

          {/* Smart Nudges */}
          <SmartNotifications
            renewals={allRenewals}
            properties={allProperties}
            currentScore={data.finalMonthlyScore}
          />

          {/* My Day — Priority Actions */}
          <MyDayActionFeed 
            properties={allProperties} 
            renewals={allRenewals} 
          />

          <PropertyScoreSection propertyScore={data.propertyScore} />

          {/* Score Simulator */}
          <ScoreSimulator
            properties={allProperties}
            currentScore={data.finalMonthlyScore}
            currentPayoutBand={data.incentiveEligibility.payoutBand}
          />

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
          <HistoricalTrendsSection trends={mockHistoricalTrends} />
          <CoachingSection suggestions={data.coachingSuggestions} />
          <AwardsSection awards={data.awards} />
          <footer className="text-center py-8 text-sm text-muted-foreground">
            <p>PM Productivity Dashboard • Data updated monthly by Operations</p>
            <p className="mt-1">Need help? Contact your manager</p>
          </footer>
        </main>
      </div>
    </PageTransition>
  );
};

export default Index;
