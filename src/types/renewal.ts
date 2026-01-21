// Renewal Tracker Data Types

export type RenewalStage = 
  | 'not_started'
  | 'renewal_initiated'
  | 'negotiation_in_progress'
  | 'owner_acknowledgement_pending'
  | 'agreement_sent'
  | 'agreement_signed'
  | 'tcf_completed'
  | 'pms_renewed'
  | 'renewal_completed'
  | 'renewal_failed';

export const RENEWAL_STAGE_ORDER: readonly RenewalStage[] = [
  'not_started',
  'renewal_initiated',
  'negotiation_in_progress',
  'owner_acknowledgement_pending',
  'agreement_sent',
  'agreement_signed',
  'tcf_completed',
  'pms_renewed',
  'renewal_completed',
] as const;

export const RENEWAL_STAGE_LABELS: Record<RenewalStage, string> = {
  not_started: 'Not Started',
  renewal_initiated: 'Renewal Initiated',
  negotiation_in_progress: 'Negotiation in Progress',
  owner_acknowledgement_pending: 'Owner Acknowledgement Pending',
  agreement_sent: 'Agreement Sent',
  agreement_signed: 'Agreement Signed',
  tcf_completed: 'TCF Completed',
  pms_renewed: 'PMS Renewed',
  renewal_completed: 'Renewal Completed',
  renewal_failed: 'Renewal Failed (Move-out)',
};

export type RiskLevel = 'green' | 'amber' | 'red';

export interface RenewalPropertyDetails {
  propertyId: string;
  propertyName: string;
  city: string;
  zone: string;
  assignedPM: string;
  pmId: string;
}

export interface LeaseDetails {
  leaseStartDate: string;
  leaseEndDate: string;
  daysToExpiry: number;
  currentRent: number;
  proposedRent?: number;
  pmsFee?: number;
}

export interface OwnerAcknowledgement {
  status: 'pending' | 'accepted' | 'rejected' | 'changes_requested';
  timestamp?: string;
  method?: 'app' | 'link';
  deviceInfo?: string;
  ipAddress?: string;
  consentId?: string;
  otpVerified?: boolean;
  changeRequests?: string;
}

export interface RenewalStatus {
  currentStage: RenewalStage;
  riskLevel: RiskLevel;
  lastActionDate: string;
  nextActionDueDate: string;
  stageHistory: StageHistoryEntry[];
}

export interface StageHistoryEntry {
  stage: RenewalStage;
  enteredAt: string;
  completedAt?: string;
  actionBy: string;
  notes?: string;
}

export interface RenewalAlert {
  id: string;
  type: 'warning' | 'escalation' | 'critical';
  message: string;
  dueDate: string;
  isRead: boolean;
  createdAt: string;
}

export interface RenewalRecord {
  id: string;
  property: RenewalPropertyDetails;
  lease: LeaseDetails;
  status: RenewalStatus;
  ownerAcknowledgement: OwnerAcknowledgement;
  alerts: RenewalAlert[];
  scoreImpact: number; // negative points affecting property health
  createdAt: string;
  updatedAt: string;
}

// State machine - valid transitions
export const VALID_STAGE_TRANSITIONS: Record<RenewalStage, RenewalStage[]> = {
  not_started: ['renewal_initiated', 'renewal_failed'],
  renewal_initiated: ['negotiation_in_progress', 'renewal_failed'],
  negotiation_in_progress: ['owner_acknowledgement_pending', 'renewal_failed'],
  owner_acknowledgement_pending: ['agreement_sent', 'renewal_failed'],
  agreement_sent: ['agreement_signed', 'renewal_failed'],
  agreement_signed: ['tcf_completed', 'renewal_failed'],
  tcf_completed: ['pms_renewed', 'renewal_failed'],
  pms_renewed: ['renewal_completed', 'renewal_failed'],
  renewal_completed: [],
  renewal_failed: [],
};

// Risk calculation rules
export function calculateRiskLevel(
  daysToExpiry: number, 
  currentStage: RenewalStage,
  hasOwnerAcknowledgement: boolean
): RiskLevel {
  // Renewal failed is always red
  if (currentStage === 'renewal_failed') return 'red';
  
  // Completed is always green
  if (currentStage === 'renewal_completed') return 'green';
  
  // Red: Not locked by T-15
  if (daysToExpiry <= 15 && currentStage !== 'pms_renewed') {
    return 'red';
  }
  
  // Amber: No acknowledgement by T-30
  if (daysToExpiry <= 30 && !hasOwnerAcknowledgement) {
    return 'amber';
  }
  
  // Green: Initiated ≥45 days
  if (daysToExpiry >= 45 && currentStage !== 'not_started') {
    return 'green';
  }
  
  // Not started with less than 45 days is amber
  if (currentStage === 'not_started' && daysToExpiry < 45) {
    return daysToExpiry <= 30 ? 'red' : 'amber';
  }
  
  return 'green';
}

// Score impact calculation
export function calculateScoreImpact(
  daysToExpiry: number,
  currentStage: RenewalStage,
  riskLevel: RiskLevel
): number {
  if (riskLevel === 'green' || currentStage === 'renewal_completed') return 0;
  
  if (currentStage === 'renewal_failed') return -10;
  
  if (riskLevel === 'red') {
    return daysToExpiry <= 0 ? -10 : -5;
  }
  
  if (riskLevel === 'amber') {
    return -2;
  }
  
  return 0;
}

// Funnel stats
export interface RenewalFunnelStats {
  total: number;
  byStage: Record<RenewalStage, number>;
  byRisk: Record<RiskLevel, number>;
  byExpiryBucket: {
    critical: number; // 0-15 days
    urgent: number; // 16-30 days
    upcoming: number; // 31-45 days
    safe: number; // 45+ days
  };
  conversionRate: number;
}

// Filters
export interface RenewalFilters {
  city?: string;
  zone?: string;
  pmId?: string;
  riskLevel?: RiskLevel;
  stage?: RenewalStage;
  expiryBucket?: 'critical' | 'urgent' | 'upcoming' | 'safe' | 'all';
  searchQuery?: string;
}

// TL Dashboard types
export interface PMRenewalSummary {
  pmId: string;
  pmName: string;
  totalRenewals: number;
  greenCount: number;
  amberCount: number;
  redCount: number;
  completedCount: number;
  failedCount: number;
  avgDaysToAction: number;
  interventionRequired: boolean;
}

// Leadership Dashboard types
export interface CityRenewalStats {
  city: string;
  totalRenewals: number;
  completedCount: number;
  failedCount: number;
  renewalRate: number;
  churnDueToRenewal: number;
  redCases: number;
}

export interface LeadershipRenewalStats {
  panIndiaRenewalRate: number;
  totalActiveRenewals: number;
  totalCompleted: number;
  totalFailed: number;
  churnRate: number;
  cityStats: CityRenewalStats[];
  monthlyTrend: { month: string; rate: number }[];
}
