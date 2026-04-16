// Property-Level Data Types

export interface PropertyBasicDetails {
  propertyId: string;
  propertyName: string;
  city: string;
  ownerName: string;
  tenantStatus: 'occupied' | 'vacant';
}

export interface PropertyOperationalMetrics {
  totalSRs: number;
  srClosedWithinSLA: number;
  srSLAPercent: number;
  moveInReportCompleted: boolean;
  moveOutReportCompleted: boolean;
  inspectionStatus: 'completed' | 'pending';
  utilitySetupCompleted: boolean;
  utilityBillIssues: boolean;
}

export interface PropertyFinancialMetrics {
  rentDueDate: string;
  rentPaidDate: string | null;
  onTimeRent: boolean;
  lateDays: number;
  utilityBillClosure: boolean;
}

export interface PropertyCustomerExperience {
  tenantRating: number;
  ownerRating: number;
}

export interface PropertyRetention {
  leaseEndDate: string;
  renewalInitiated: boolean;
  renewalCompleted: boolean;
  daysToLeaseEnd: number;
}

export interface PropertyEcosystem {
  ownerAppInstalled: boolean;
  insuranceActive: boolean;
  leaseAgreementUploaded: boolean;
}

export interface PropertyScoreBreakdown {
  operations: number; // max 40
  financial: number; // max 15 (can go negative)
  customerExperience: number; // max 25
  ecosystem: number; // max 20
  total: number;
}

export interface PropertyIssue {
  id: string;
  category: 'operations' | 'financial' | 'customer' | 'ecosystem';
  issue: string;
  impact: number;
  actionRequired: string;
  recoveryPoints: number;
}

export interface PropertyNote {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
  type: 'general' | 'escalation' | 'follow-up' | 'resolution';
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Property {
  basic: PropertyBasicDetails;
  operational: PropertyOperationalMetrics;
  financial: PropertyFinancialMetrics;
  customerExperience: PropertyCustomerExperience;
  retention: PropertyRetention;
  ecosystem: PropertyEcosystem;
  scoreBreakdown: PropertyScoreBreakdown;
  healthScore: number;
  riskLevel: RiskLevel;
  issues: PropertyIssue[];
  notes: PropertyNote[];
}

export interface PMPropertySummary {
  pmId: string;
  pmName: string;
  city: string;
  totalProperties: number;
  avgScore: number;
  highRiskCount: number;
  lateRentCount: number;
  renewalDueCount: number;
  notesCount: number;
  propertiesWithoutNotes: number;
  interventionRequired: boolean;
}

export interface CityPropertyStats {
  city: string;
  totalProperties: number;
  avgScore: number;
  highRiskCount: number;
  lateRentCount: number;
  renewalDueCount: number;
  notesUpdated: number;
  notesNotUpdated: number;
}

export interface PropertyAnalyticsStats {
  totalProperties: number;
  avgScore: number;
  scoreDistribution: { range: string; count: number }[];
  riskDistribution: { level: string; count: number }[];
  pillarAverages: { pillar: string; avg: number; max: number }[];
  cityWiseScores: { city: string; avgScore: number; count: number }[];
  notesStats: { withNotes: number; withoutNotes: number; totalNotes: number };
  monthlyScoreTrend: { month: string; avgScore: number }[];
}

export interface PropertyFilters {
  scoreRange: [number, number];
  lateRentOnly: boolean;
  renewalDueDays: number | null;
  lowOwnerRating: boolean;
  searchQuery: string;
}

export interface PropertyAggregates {
  avgPropertyScore: number;
  highRiskCount: number;
  renewalDueCount: number;
  lateRentCount: number;
  totalProperties: number;
}
