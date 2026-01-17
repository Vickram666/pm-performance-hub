import { MonthlyData, HistoricalTrends, HistoricalDataPoint, EligibilityStatus } from '@/types/dashboard';

export const mockPMData: MonthlyData = {
  month: 'January',
  year: 2025,
  profile: {
    id: 'pm-001',
    name: 'Priya Sharma',
    city: 'Bangalore',
    zone: 'South Zone',
    portfolioSize: 127,
    salary: 45000,
    mappedRevenue: 180000,
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
    rawScore: 75.4,
    medianAdjustmentFactor: 1.05,
    adjustedScore: 79.2,
  },
  revenueScore: {
    revenueAchieved: 270000,
    revenueMapped: 180000,
    salaryMultiple: 1.5,
    slabAchieved: '1.5× Salary',
    score: 75,
  },
  totalScore: 154.2,
  eligibilityStatus: 'eligible',
  incentive: {
    baseIncentivePercent: 7.5,
    baseIncentiveAmount: 13500,
    releasePercent: 100,
    finalPayableAmount: 13500,
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
      suggestion: 'Improve on-time rent by 10% to avoid late penalties and boost Financial Discipline score.',
      impact: 'high',
    },
    {
      id: 'coach-2',
      metric: 'Renewal Initiation',
      currentValue: 80,
      targetValue: 90,
      suggestion: 'Start 3 more renewal conversations 60-90 days before expiry to maximize retention.',
      impact: 'medium',
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
  const basePropertyScores = [68, 70, 72, 71, 74, 73, 76, 75, 78, 77, 79, 79.2];
  const baseRevenueScores = [50, 50, 50, 75, 75, 50, 75, 75, 50, 75, 75, 75];
  
  return months.map((month, index) => {
    const reversedIndex = 11 - index; // So newest month uses last values
    const propertyScore = basePropertyScores[reversedIndex] + (Math.random() * 2 - 1);
    const revenueScore = baseRevenueScores[reversedIndex];
    const totalScore = propertyScore + revenueScore;
    
    // Calculate pillar scores with variance (new structure)
    const operationsScore = 28 + (Math.random() * 8); // max 40
    const financialScore = 10 + (Math.random() * 4) - (Math.random() > 0.7 ? 5 : 0); // max 15 - penalty
    const customerScore = 20 + (Math.random() * 8); // max 30
    const renewalScore = 16 + (Math.random() * 6); // max 25
    
    let eligibilityStatus: EligibilityStatus = 'eligible';
    if (propertyScore < 50) {
      eligibilityStatus = 'blocked';
    } else if (propertyScore < 65) {
      eligibilityStatus = 'partial';
    }
    
    // Calculate incentive based on scores
    let incentivePercent = 5;
    if (revenueScore >= 75) incentivePercent = 7.5;
    if (revenueScore >= 100) incentivePercent = 10;
    
    let releasePercent = 100;
    if (propertyScore < 50) releasePercent = 0;
    else if (propertyScore < 65) releasePercent = 50;
    else if (propertyScore < 80) releasePercent = 75;
    
    const baseIncentive = 180000 * (incentivePercent / 100);
    const incentiveAmount = baseIncentive * (releasePercent / 100);
    
    return {
      month,
      propertyScore: Math.round(propertyScore * 10) / 10,
      revenueScore,
      totalScore: Math.round(totalScore * 10) / 10,
      incentiveAmount: Math.round(incentiveAmount),
      eligibilityStatus,
      operationsScore: Math.round(operationsScore * 10) / 10,
      financialScore: Math.round(financialScore * 10) / 10,
      customerScore: Math.round(customerScore * 10) / 10,
      renewalScore: Math.round(renewalScore * 10) / 10,
    };
  }).reverse(); // Oldest first for charts
};

const historicalData = generateHistoricalData();

// Calculate trend
const calculateTrend = (data: HistoricalDataPoint[]): 'improving' | 'declining' | 'stable' => {
  const recent = data.slice(-3);
  const older = data.slice(0, 3);
  const recentAvg = recent.reduce((sum, d) => sum + d.totalScore, 0) / 3;
  const olderAvg = older.reduce((sum, d) => sum + d.totalScore, 0) / 3;
  
  if (recentAvg > olderAvg + 5) return 'improving';
  if (recentAvg < olderAvg - 5) return 'declining';
  return 'stable';
};

// Find best and worst months
const findBestMonth = (data: HistoricalDataPoint[]): string => {
  return data.reduce((best, current) => 
    current.totalScore > best.totalScore ? current : best
  ).month;
};

const findWorstMonth = (data: HistoricalDataPoint[]): string => {
  return data.reduce((worst, current) => 
    current.totalScore < worst.totalScore ? current : worst
  ).month;
};

export const mockHistoricalTrends: HistoricalTrends = {
  dataPoints: historicalData,
  averagePropertyScore: Math.round(
    historicalData.reduce((sum, d) => sum + d.propertyScore, 0) / historicalData.length * 10
  ) / 10,
  averageRevenueScore: Math.round(
    historicalData.reduce((sum, d) => sum + d.revenueScore, 0) / historicalData.length * 10
  ) / 10,
  averageTotalScore: Math.round(
    historicalData.reduce((sum, d) => sum + d.totalScore, 0) / historicalData.length * 10
  ) / 10,
  totalIncentiveEarned: historicalData.reduce((sum, d) => sum + d.incentiveAmount, 0),
  bestMonth: findBestMonth(historicalData),
  worstMonth: findWorstMonth(historicalData),
  trend: calculateTrend(historicalData),
};
