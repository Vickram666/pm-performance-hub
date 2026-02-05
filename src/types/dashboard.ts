// PM Dashboard Data Types

export interface PMProfile {
  id: string;
  name: string;
  city: string;
  zone: string;
  portfolioSize: number;
}

export interface OperationsMetrics {
  serviceRequestsSLAScore: number; // max 10
  reportAccuracyScore: number; // max 5
  moveInReportScore: number; // max 10
  moveOutScore: number; // max 10
  utilityBillHandling: number; // max 5
}

export interface FinancialMetrics {
  paidRentOnTimeScore: number; // max 15
  latePenalty: number; // 0 / -5 / -10
  daysLate: number;
}

export interface CustomerMetrics {
  tenantAppReviewScore: number; // max 5
  ownerAppReviewScore: number; // max 5
  ownerAppDownload: number; // max 5
  tenantAppDownload: number; // max 5
}

export interface RenewalMetrics {
  timelyRenewalInitiation: number; // max 5
  renewalRAUploadTimely: number; // max 5
  renewalPercentScore: number; // max 10
  homeInsurance: number; // max 5
}

export interface PropertyScore {
  operations: OperationsMetrics;
  financial: FinancialMetrics;
  customer: CustomerMetrics;
  renewal: RenewalMetrics;
  totalScore: number; // Sum of all pillars (0-100)
}

// Payout band based on Final Monthly Score (Avg Property Health Score)
export type PayoutBand = '100%' | '75%' | '50%' | 'nil';

export interface IncentiveEligibility {
  finalMonthlyScore: number; // 0-100 (avg property health score)
  payoutBand: PayoutBand;
  isBlocked: boolean;
  blockReason?: string;
}

// Get payout band from score
export function getPayoutBand(score: number): PayoutBand {
  if (score >= 80) return '100%';
  if (score >= 70) return '75%';
  if (score >= 60) return '50%';
  return 'nil';
}

// Get eligibility status from payout band
export function getEligibilityFromBand(band: PayoutBand, isBlocked: boolean): EligibilityStatus {
  if (isBlocked) return 'blocked';
  if (band === '100%') return 'eligible';
  if (band === '75%' || band === '50%') return 'partial';
  return 'blocked';
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
  finalMonthlyScore: number; // Avg property health score (0-100)
  eligibilityStatus: EligibilityStatus;
  incentiveEligibility: IncentiveEligibility;
  awards: Award[];
  coachingSuggestions: CoachingSuggestion[];
}

// Historical Trend Types
export interface HistoricalDataPoint {
  month: string;
  propertyScore: number; // Final Monthly Score (0-100)
  payoutBand: PayoutBand;
  eligibilityStatus: EligibilityStatus;
  operationsScore: number;
  financialScore: number;
  customerScore: number;
  renewalScore: number;
}

export interface HistoricalTrends {
  dataPoints: HistoricalDataPoint[];
  averagePropertyScore: number;
  bestMonth: string;
  worstMonth: string;
  trend: 'improving' | 'declining' | 'stable';
}
