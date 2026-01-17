// PM Dashboard Data Types

export interface PMProfile {
  id: string;
  name: string;
  city: string;
  zone: string;
  portfolioSize: number;
  salary: number;
  mappedRevenue: number;
}

export interface OperationsMetrics {
  serviceRequestsScore: number; // max 10
  reportWorkScore: number; // max 5
  moveInReportScore: number; // max 10
  moveOutScore: number; // max 10
  utilityBillHandling: number; // max 5
}

export interface FinancialMetrics {
  paidRentPaymentScore: number; // max 10
  utilityBillClosureAccuracy: number; // max 5
  latePenalty: number; // negative value
  daysLate: number;
}

export interface CustomerMetrics {
  tenantAppReviewScore: number; // max 5
  ownerAppReviewScore: number; // max 5
  timelyRenewalInitiation: number; // max 5
  renewalPercentScore: number; // max 10
}

export interface EcosystemMetrics {
  ownerAppDownload: number; // max 5
  homeInsuranceActivation: number; // max 5
  leaseAgreement: number; // max 5
  utilityEnablement: number; // max 5
}

export interface PropertyScore {
  operations: OperationsMetrics;
  financial: FinancialMetrics;
  customer: CustomerMetrics;
  ecosystem: EcosystemMetrics;
  rawScore: number;
  medianAdjustmentFactor: number;
  adjustedScore: number;
}

export interface RevenueScore {
  revenueAchieved: number;
  revenueMapped: number;
  salaryMultiple: number;
  slabAchieved: string;
  score: number; // max 100
}

export interface IncentiveCalculation {
  baseIncentivePercent: number;
  baseIncentiveAmount: number;
  releasePercent: number;
  finalPayableAmount: number;
  isBlocked: boolean;
  blockReason?: string;
}

export type EligibilityStatus = 'eligible' | 'partial' | 'blocked';

export interface Award {
  id: string;
  name: string;
  type: 'monthly' | 'annual' | 'trip';
  isEligible: boolean;
  currentRank?: number;
  percentile?: number;
}

export interface CoachingSuggestion {
  id: string;
  metric: string;
  currentValue: number;
  targetValue: number;
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
}

export interface MonthlyData {
  month: string;
  year: number;
  profile: PMProfile;
  propertyScore: PropertyScore;
  revenueScore: RevenueScore;
  totalScore: number;
  eligibilityStatus: EligibilityStatus;
  incentive: IncentiveCalculation;
  awards: Award[];
  coachingSuggestions: CoachingSuggestion[];
}

// Historical Trend Types
export interface HistoricalDataPoint {
  month: string;
  propertyScore: number;
  revenueScore: number;
  totalScore: number;
  incentiveAmount: number;
  eligibilityStatus: EligibilityStatus;
  operationsScore: number;
  financialScore: number;
  customerScore: number;
  ecosystemScore: number;
}

export interface HistoricalTrends {
  dataPoints: HistoricalDataPoint[];
  averagePropertyScore: number;
  averageRevenueScore: number;
  averageTotalScore: number;
  totalIncentiveEarned: number;
  bestMonth: string;
  worstMonth: string;
  trend: 'improving' | 'declining' | 'stable';
}
