import { MonthlyData, HistoricalTrends, HistoricalDataPoint, EligibilityStatus, PayoutBand, getPayoutBand, getEligibilityFromBand } from '@/types/dashboard';

export const mockPMData: MonthlyData = {
  month: 'January',
  year: 2025,
  profile: {
    id: 'pm-001',
    name: 'Priya Sharma',
    city: 'Bangalore',
    zone: 'South Zone',
    portfolioSize: 127,
  },
  propertyScore: {
    operations: {
      serviceRequestsSLAScore: 8.5,
      reportAccuracyScore: 4.2,
      moveInReportScore: 9.0,
      moveOutScore: 8.5,
      utilityBillHandling: 4.5,
    },
    financial: {
      paidRentOnTimeScore: 12.5,
      latePenalty: -5,
      daysLate: 8,
    },
    customer: {
      tenantAppReviewScore: 4.2,
      ownerAppReviewScore: 4.5,
      ownerAppDownload: 4.0,
      tenantAppDownload: 3.8,
    },
    renewal: {
      timelyRenewalInitiation: 4.0,
      renewalRAUploadTimely: 4.2,
      renewalPercentScore: 8.5,
      homeInsurance: 3.5,
    },
    totalScore: 74, // Sum of all pillar scores
  },
  finalMonthlyScore: 74, // Avg property health score
  eligibilityStatus: 'partial',
  incentiveEligibility: {
    finalMonthlyScore: 74,
    payoutBand: '75%',
    isBlocked: false,
  },
  awards: [
    {
      id: 'award-1',
      name: 'PM of the Month',
      type: 'monthly',
      isEligible: true,
      currentRank: 3,
    },
    {
      id: 'award-2',
      name: 'CX Champion',
      type: 'monthly',
      isEligible: true,
      percentile: 85,
    },
    {
      id: 'award-3',
      name: 'Renewal Star',
      type: 'monthly',
      isEligible: false,
      currentRank: 12,
    },
    {
      id: 'award-4',
      name: 'Financial Discipline',
      type: 'monthly',
      isEligible: false,
    },
    {
      id: 'award-5',
      name: 'Annual Trip',
      type: 'trip',
      isEligible: true,
      percentile: 18,
    },
  ],
  coachingSuggestions: [
    {
      id: 'coach-1',
      metric: 'On-time Rent Collection',
      currentValue: 85,
      targetValue: 95,
      suggestion: 'Fix late rent in 3 properties to improve your score by ~6 points.',
      impact: 'high',
    },
    {
      id: 'coach-2',
      metric: 'Renewal Initiation',
      currentValue: 80,
      targetValue: 90,
      suggestion: 'Initiate renewals on 2 expiring leases to reach 80+ score for 100% payout.',
      impact: 'high',
    },
    {
      id: 'coach-3',
      metric: 'Home Insurance Activation',
      currentValue: 70,
      targetValue: 90,
      suggestion: 'Activate home insurance for 25 more properties to earn full Renewal pillar points.',
      impact: 'medium',
    },
  ],
};

export const monthOptions = [
  'January 2025',
  'December 2024',
  'November 2024',
  'October 2024',
];

// Generate 12 months of historical data
const generateHistoricalData = (): HistoricalDataPoint[] => {
  const months = [
    'Jan 2025', 'Dec 2024', 'Nov 2024', 'Oct 2024', 
    'Sep 2024', 'Aug 2024', 'Jul 2024', 'Jun 2024',
    'May 2024', 'Apr 2024', 'Mar 2024', 'Feb 2024'
  ];
  
  // Base values that gradually improve over time (older to newer)
  const basePropertyScores = [62, 65, 68, 71, 69, 73, 72, 75, 74, 77, 76, 74];
  
  return months.map((month, index) => {
    const reversedIndex = 11 - index; // So newest month uses last values
    const propertyScore = basePropertyScores[reversedIndex] + (Math.random() * 4 - 2);
    const finalScore = Math.round(propertyScore * 10) / 10;
    
    // Calculate pillar scores with variance (new structure)
    const operationsScore = 28 + (Math.random() * 8); // max 40
    const financialScore = 10 + (Math.random() * 4) - (Math.random() > 0.7 ? 5 : 0); // max 15 - penalty
    const customerScore = 14 + (Math.random() * 6); // max 20
    const renewalScore = 16 + (Math.random() * 6); // max 25
    
    const payoutBand = getPayoutBand(finalScore);
    const eligibilityStatus = getEligibilityFromBand(payoutBand, false);
    
    return {
      month,
      propertyScore: finalScore,
      payoutBand,
      eligibilityStatus,
      operationsScore: Math.round(operationsScore * 10) / 10,
      financialScore: Math.round(financialScore * 10) / 10,
      customerScore: Math.round(customerScore * 10) / 10,
      renewalScore: Math.round(renewalScore * 10) / 10,
    };
  }).reverse(); // Oldest first for charts
};

const historicalData = generateHistoricalData();

// Calculate trend based on property score only
const calculateTrend = (data: HistoricalDataPoint[]): 'improving' | 'declining' | 'stable' => {
  const recent = data.slice(-3);
  const older = data.slice(0, 3);
  const recentAvg = recent.reduce((sum, d) => sum + d.propertyScore, 0) / 3;
  const olderAvg = older.reduce((sum, d) => sum + d.propertyScore, 0) / 3;
  
  if (recentAvg > olderAvg + 3) return 'improving';
  if (recentAvg < olderAvg - 3) return 'declining';
  return 'stable';
};

// Find best and worst months based on property score
const findBestMonth = (data: HistoricalDataPoint[]): string => {
  return data.reduce((best, current) => 
    current.propertyScore > best.propertyScore ? current : best
  ).month;
};

const findWorstMonth = (data: HistoricalDataPoint[]): string => {
  return data.reduce((worst, current) => 
    current.propertyScore < worst.propertyScore ? current : worst
  ).month;
};

export const mockHistoricalTrends: HistoricalTrends = {
  dataPoints: historicalData,
  averagePropertyScore: Math.round(
    historicalData.reduce((sum, d) => sum + d.propertyScore, 0) / historicalData.length * 10
  ) / 10,
  bestMonth: findBestMonth(historicalData),
  worstMonth: findWorstMonth(historicalData),
  trend: calculateTrend(historicalData),
};
