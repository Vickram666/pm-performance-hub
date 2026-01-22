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
  noticePeriod: number; // 30, 60, or 90 days
  renewalOpenDate: string; // Calculated: leaseEndDate - (noticePeriod + 30 buffer)
  lockDeadline: string; // Must be locked by this date (noticePeriod-specific SLA)
  currentRent: number;
  proposedRent?: number;
  pmsFee?: number;
}

// Calculate renewal open date based on notice period
export function calculateRenewalOpenDate(leaseEndDate: Date, noticePeriod: number): Date {
  const buffer = 30; // 30-day buffer
  const daysBeforeExpiry = noticePeriod + buffer;
  return new Date(leaseEndDate.getTime() - daysBeforeExpiry * 24 * 60 * 60 * 1000);
}

// Calculate lock deadline based on notice period
export function calculateLockDeadline(leaseEndDate: Date, noticePeriod: number): Date {
  // 60-day notice → lock 30 days before
  // 30-day notice → lock 15 days before
  const lockDaysBefore = noticePeriod >= 60 ? 30 : 15;
  return new Date(leaseEndDate.getTime() - lockDaysBefore * 24 * 60 * 60 * 1000);
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

// State machine - valid transitions with SOP LOCKS
export const VALID_STAGE_TRANSITIONS: Record<RenewalStage, RenewalStage[]> = {
  not_started: ['renewal_initiated', 'renewal_failed'],
  renewal_initiated: ['negotiation_in_progress', 'renewal_failed'],
  negotiation_in_progress: ['owner_acknowledgement_pending', 'renewal_failed'],
  owner_acknowledgement_pending: ['agreement_sent', 'renewal_failed'], // ❌ Cannot skip to agreement without ack
  agreement_sent: ['agreement_signed', 'renewal_failed'],
  agreement_signed: ['tcf_completed', 'renewal_failed'], // ❌ TCF needs signed agreement
  tcf_completed: ['pms_renewed', 'renewal_failed'], // ❌ PMS renewal needs TCF
  pms_renewed: ['renewal_completed', 'renewal_failed'], // ❌ Completion needs all steps
  renewal_completed: [],
  renewal_failed: [],
};

// SOP Lock Rules - Hard stops that cannot be bypassed
export interface SOPValidation {
  canProceed: boolean;
  blockedReason?: string;
  requiredStep?: RenewalStage;
}

export function validateStageTransition(
  currentStage: RenewalStage,
  targetStage: RenewalStage,
  hasOwnerAcknowledgement: boolean,
  hasSignedAgreement: boolean,
  hasTCFCompleted: boolean
): SOPValidation {
  // Check if transition is valid
  const validTransitions = VALID_STAGE_TRANSITIONS[currentStage];
  if (!validTransitions.includes(targetStage)) {
    return {
      canProceed: false,
      blockedReason: `Cannot move from ${currentStage} to ${targetStage}. Follow the renewal process in order.`,
      requiredStep: validTransitions[0],
    };
  }
  
  // Hard Stop: Agreement cannot be sent without owner acknowledgement
  if (targetStage === 'agreement_sent' && !hasOwnerAcknowledgement) {
    return {
      canProceed: false,
      blockedReason: '❌ Agreement cannot be sent without owner acknowledgement. Get owner approval first.',
      requiredStep: 'owner_acknowledgement_pending',
    };
  }
  
  // Hard Stop: TCF cannot be punched without signed agreement
  if (targetStage === 'tcf_completed' && !hasSignedAgreement) {
    return {
      canProceed: false,
      blockedReason: '❌ TCF cannot be completed without a signed agreement. Upload signed agreement first.',
      requiredStep: 'agreement_signed',
    };
  }
  
  // Hard Stop: PMS renewal cannot happen without TCF
  if (targetStage === 'pms_renewed' && !hasTCFCompleted) {
    return {
      canProceed: false,
      blockedReason: '❌ PMS renewal requires TCF completion. Complete TCF first.',
      requiredStep: 'tcf_completed',
    };
  }
  
  // Hard Stop: Completion requires all steps
  if (targetStage === 'renewal_completed') {
    if (!hasOwnerAcknowledgement || !hasSignedAgreement || !hasTCFCompleted) {
      return {
        canProceed: false,
        blockedReason: '❌ Renewal cannot be marked complete without all steps finished.',
        requiredStep: 'pms_renewed',
      };
    }
  }
  
  return { canProceed: true };
}

// Risk calculation rules - Now notice-period aware
export function calculateRiskLevel(
  daysToExpiry: number, 
  currentStage: RenewalStage,
  hasOwnerAcknowledgement: boolean,
  noticePeriod: number = 60 // Default 60-day notice
): RiskLevel {
  // Renewal failed is always red
  if (currentStage === 'renewal_failed') return 'red';
  
  // Completed is always green
  if (currentStage === 'renewal_completed') return 'green';
  
  // Calculate SLA-specific thresholds based on notice period
  const lockDeadlineDays = noticePeriod >= 60 ? 30 : 15;
  const ackDeadlineDays = noticePeriod >= 60 ? 45 : 30;
  const initiationDeadlineDays = noticePeriod + 30; // noticePeriod + buffer
  
  // Red: Not locked by deadline (notice-period specific)
  if (daysToExpiry <= lockDeadlineDays && currentStage !== 'pms_renewed') {
    return 'red';
  }
  
  // Amber: No acknowledgement by notice-period-specific deadline
  if (daysToExpiry <= ackDeadlineDays && !hasOwnerAcknowledgement) {
    return 'amber';
  }
  
  // Green: Initiated within proper timeline
  if (daysToExpiry >= initiationDeadlineDays && currentStage !== 'not_started') {
    return 'green';
  }
  
  // Not started with less than initiation deadline is amber/red
  if (currentStage === 'not_started' && daysToExpiry < initiationDeadlineDays) {
    return daysToExpiry <= ackDeadlineDays ? 'red' : 'amber';
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
