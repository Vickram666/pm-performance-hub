import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, RefreshCw, Home, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

const quickLinks = [
  {
    to: '/renewals',
    icon: RefreshCw,
    label: 'Renewal Tracker',
    description: 'Track lease renewals & stages',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    to: '/properties',
    icon: Home,
    label: 'My Properties',
    description: 'View portfolio health scores',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    to: '/leaderboard',
    icon: Trophy,
    label: 'Leaderboard',
    description: 'Company-wide PM rankings',
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
];

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
        {/* Quick Access Strip */}
        <div className="bg-card border-b">
          <div className="container py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {quickLinks.map(({ to, icon: Icon, label, description, color, bg }) => (
                <Link key={to} to={to}>
                  <Card className="hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group border-transparent hover:border-primary/20">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${bg} transition-transform group-hover:scale-110`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{label}</div>
                        <div className="text-xs text-muted-foreground truncate">{description}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
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
