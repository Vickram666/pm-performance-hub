// Property-Level Data Types

export interface PropertyBasicDetails {
  propertyId: string;
  propertyName: string;
  city: string;
  zone: string;
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
