import { useState } from 'react';
import { HeaderSummary } from '@/components/dashboard/HeaderSummary';
import { PropertyScoreSection } from '@/components/dashboard/PropertyScoreSection';
import { MedianNormalization } from '@/components/dashboard/MedianNormalization';
import { RevenueSection } from '@/components/dashboard/RevenueSection';
import { IncentiveSection } from '@/components/dashboard/IncentiveSection';
import { CoachingSection } from '@/components/dashboard/CoachingSection';
import { AwardsSection } from '@/components/dashboard/AwardsSection';
import { mockPMData } from '@/data/mockData';

const Index = () => {
  const [selectedMonth, setSelectedMonth] = useState('January 2025');
  const data = mockPMData;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <HeaderSummary
        profile={data.profile}
        adjustedPropertyScore={data.propertyScore.adjustedScore}
        revenueScore={data.revenueScore.score}
        totalScore={data.totalScore}
        eligibilityStatus={data.eligibilityStatus}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      {/* Main Content */}
      <main className="container py-6 space-y-6">
        {/* Property Score Section */}
        <PropertyScoreSection propertyScore={data.propertyScore} />

        {/* Median Normalization */}
        <MedianNormalization propertyScore={data.propertyScore} />

        {/* Revenue Section */}
        <RevenueSection 
          revenueScore={data.revenueScore} 
          salary={data.profile.salary} 
        />

        {/* Incentive Calculation */}
        <IncentiveSection
          incentive={data.incentive}
          adjustedPropertyScore={data.propertyScore.adjustedScore}
          mappedRevenue={data.profile.mappedRevenue}
          eligibilityStatus={data.eligibilityStatus}
        />

        {/* Coaching Suggestions */}
        <CoachingSection suggestions={data.coachingSuggestions} />

        {/* Awards Section */}
        <AwardsSection awards={data.awards} />

        {/* Footer */}
        <footer className="text-center py-8 text-sm text-muted-foreground">
          <p>PM Productivity Dashboard • Data updated monthly by Operations</p>
          <p className="mt-1">Need help? Contact your Zone Manager</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
