// Renewal Tracker Data Types - Action-Driven System

// Simplified Stage machine - system-driven, read-only for PMs
export type RenewalStage = 
  | 'renewal_not_started'
  | 'negotiation_in_progress'
  | 'proposal_sent'
  | 'owner_acknowledged'
  | 'agreement_uploaded'  // Single combined stage (replaces agreement_sent/signed/uploaded)
  | 'tcf_created'
  | 'pms_renewed'
  | 'renewal_completed'
  | 'renewal_failed';

export const RENEWAL_STAGE_ORDER: readonly RenewalStage[] = [
  'renewal_not_started',
  'negotiation_in_progress',
  'proposal_sent',
  'owner_acknowledged',
  'agreement_uploaded',
  'tcf_created',
  'pms_renewed',
  'renewal_completed',
] as const;

export const RENEWAL_STAGE_LABELS: Record<RenewalStage, string> = {
  renewal_not_started: 'Renewal Not Started',
  negotiation_in_progress: 'Negotiation In Progress',
  proposal_sent: 'Proposal Sent',
  owner_acknowledged: 'Owner Acknowledged',
  agreement_uploaded: 'Renewal Agreement Uploaded',
  tcf_created: 'TCF Created',
  pms_renewed: 'PMS Renewed',
  renewal_completed: 'Renewal Completed',
  renewal_failed: 'Renewal Failed (Move-out)',
};

// Next Action mapping - what PM sees as their CTA
export interface NextActionConfig {
  label: string;
  actionKey: string;
  disabled?: boolean;
  disabledReason?: string;
}

export function getNextAction(stage: RenewalStage): NextActionConfig {
  switch (stage) {
    case 'renewal_not_started':
      return { label: 'Start Renewal', actionKey: 'start_renewal' };
    case 'negotiation_in_progress':
      return { label: 'Send Proposal', actionKey: 'send_proposal' };
    case 'proposal_sent':
      return { label: 'Send Owner Acknowledgement', actionKey: 'send_owner_ack' };
    case 'owner_acknowledged':
      return { label: 'Upload Agreement', actionKey: 'upload_agreement' };
    case 'agreement_uploaded':
      return { label: 'Punch TCF', actionKey: 'punch_tcf' };
    case 'tcf_created':
      return { label: 'Renew PMS', actionKey: 'renew_pms' };
    case 'pms_renewed':
      return { label: 'Close Renewal', actionKey: 'close_renewal' };
    case 'renewal_completed':
      return { label: 'Completed', actionKey: 'none', disabled: true };
    case 'renewal_failed':
      return { label: 'Failed - Initiate Move-out', actionKey: 'none', disabled: true };
    default:
      return { label: 'Review', actionKey: 'review' };
  }
}

export type RiskLevel = 'green' | 'amber' | 'red';

// Escalation status
export type EscalationStatus = 'none' | 'yellow' | 'red' | 'critical';
export type EscalationReason = 
  | 'owner_not_responding' 
  | 'tenant_negotiation_delay' 
  | 'internal_delay' 
  | 'market_issue';

export const ESCALATION_REASON_LABELS: Record<EscalationReason, string> = {
  owner_not_responding: 'Owner not responding',
  tenant_negotiation_delay: 'Tenant negotiation delay',
  internal_delay: 'Internal delay',
  market_issue: 'Market issue',
};

// Renewal Health
export type RenewalHealth = 'green' | 'yellow' | 'red';

export interface RenewalPropertyDetails {
  propertyId: string;
  propertyName: string;
  city: string;
  zone: string;
  assignedPM: string;
  pmId: string;
  configuration?: string; // e.g. "2BHK"
  maintenanceIncluded?: boolean;
}

export interface LeaseDetails {
  leaseStartDate: string;
  leaseEndDate: string;
  daysToExpiry: number;
  noticePeriod: number;
  renewalOpenDate: string;
  lockDeadline: string;
  currentRent: number;
  proposedRent?: number;
  revisedRent?: number;
  serviceFeePercent?: number;
  pmsFee?: number;
  newLeaseStartDate?: string;
  leaseDuration?: number; // months
}

// Calculate renewal open date based on notice period
export function calculateRenewalOpenDate(leaseEndDate: Date, noticePeriod: number): Date {
  const buffer = 30;
  const daysBeforeExpiry = noticePeriod + buffer;
  return new Date(leaseEndDate.getTime() - daysBeforeExpiry * 24 * 60 * 60 * 1000);
}

// Calculate lock deadline based on notice period
export function calculateLockDeadline(leaseEndDate: Date, noticePeriod: number): Date {
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
  ownerEmail?: string;
  rejectionReason?: string;
  sentDate?: string;
  viewedDate?: string;
  approvedDate?: string;
  // Proposal details captured at send time
  proposalDetails?: {
    revisedRent: number;
    newLeaseStartDate: string;
    serviceFeePercent: number;
    maintenanceIncluded: boolean;
    specialRemarks?: string;
  };
}

// Agreement Upload details
export interface AgreementUpload {
  uploaded: boolean;
  fileName?: string;
  uploadedAt?: string;
  effectiveLeaseStartDate?: string;
  leaseDurationMonths?: number;
}

// Action Log Entry
export interface ActionLogEntry {
  id: string;
  action: string;
  actionBy: string;
  source: 'PM' | 'Owner' | 'System';
  timestamp: string;
  details?: string;
  stageFrom?: RenewalStage;
  stageTo?: RenewalStage;
}

export interface RenewalStatus {
  currentStage: RenewalStage;
  riskLevel: RiskLevel;
  lastActionDate: string;
  nextActionDueDate: string;
  stageHistory: StageHistoryEntry[];
  stageEnteredAt?: string; // When current stage was entered (for escalation calc)
  escalationStatus: EscalationStatus;
  escalationReason?: EscalationReason;
  renewalHealth: RenewalHealth;
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
  type: 'warning' | 'escalation' | 'critical' | 'reminder';
  message: string;
  dueDate: string;
  isRead: boolean;
  createdAt: string;
  reminderDays?: number; // 90, 60, 45, 30, 15
}

// Renewal Score Impact - At-Risk Model
export interface RenewalScoreImpact {
  basePoints: 25;
  currentPoints: number;
  deductions: RenewalDeduction[];
  atRiskMessage: string;
}

export interface RenewalDeduction {
  reason: string;
  points: number;
  triggered: boolean;
}

export function calculateRenewalScoreImpact(
  daysToExpiry: number,
  currentStage: RenewalStage,
  hasOwnerAck: boolean,
  noticePeriod: number
): RenewalScoreImpact {
  const base = 25;
  const deductions: RenewalDeduction[] = [];
  
  const initiationDeadline = noticePeriod + 30;
  const ackDeadline = noticePeriod >= 60 ? 45 : 30;
  const lockDeadline = noticePeriod >= 60 ? 30 : 15;
  
  const lateInitiation = daysToExpiry < initiationDeadline && currentStage === 'renewal_not_started';
  deductions.push({ reason: 'Late initiation', points: -5, triggered: lateInitiation });
  
  const ackDelay = daysToExpiry < ackDeadline && !hasOwnerAck && 
    ['renewal_not_started', 'negotiation_in_progress', 'proposal_sent'].includes(currentStage);
  deductions.push({ reason: 'Owner acknowledgement delay', points: -5, triggered: ackDelay });
  
  const agreementLate = daysToExpiry < lockDeadline && 
    !['agreement_uploaded', 'tcf_created', 'pms_renewed', 'renewal_completed'].includes(currentStage);
  deductions.push({ reason: 'Agreement delay', points: -5, triggered: agreementLate });
  
  const forcedMoveout = currentStage === 'renewal_failed';
  deductions.push({ reason: 'Forced move-out', points: -15, triggered: forcedMoveout });
  
  const totalDeduction = deductions.filter(d => d.triggered).reduce((sum, d) => sum + d.points, 0);
  const currentPoints = Math.max(0, base + totalDeduction);
  
  let atRiskMessage = '';
  if (currentStage === 'renewal_completed') {
    atRiskMessage = 'No penalty';
  } else if (currentStage === 'renewal_failed') {
    atRiskMessage = 'At risk of −15 pts (Forced move-out)';
  } else if (lateInitiation) {
    atRiskMessage = 'At risk of −5 pts (Late initiation)';
  } else if (ackDelay) {
    atRiskMessage = 'At risk of −10 pts (Ack delay)';
  } else if (agreementLate) {
    atRiskMessage = 'At risk of −15 pts (Agreement delay)';
  } else {
    atRiskMessage = 'On track';
  }
  
  return { basePoints: 25, currentPoints, deductions, atRiskMessage };
}

// Calculate escalation status
export function calculateEscalationStatus(
  daysToExpiry: number,
  currentStage: RenewalStage,
  stageEnteredAt: string | undefined,
  hasAgreementUploaded: boolean
): EscalationStatus {
  if (currentStage === 'renewal_completed' || currentStage === 'renewal_failed') return 'none';
  
  // Critical: <15 days without agreement
  if (daysToExpiry < 15 && !hasAgreementUploaded) return 'critical';
  
  // Red: <30 days without agreement uploaded
  if (daysToExpiry < 30 && !hasAgreementUploaded) return 'red';
  
  // Yellow: 15+ days stuck in one stage
  if (stageEnteredAt) {
    const enteredDate = new Date(stageEnteredAt);
    const daysSinceEntry = Math.floor((Date.now() - enteredDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceEntry >= 15) return 'yellow';
  }
  
  return 'none';
}

// Calculate renewal health
export function calculateRenewalHealth(
  daysToExpiry: number,
  currentStage: RenewalStage,
  escalationStatus: EscalationStatus
): RenewalHealth {
  if (currentStage === 'renewal_completed') return 'green';
  if (currentStage === 'renewal_failed') return 'red';
  if (escalationStatus === 'critical' || escalationStatus === 'red') return 'red';
  if (escalationStatus === 'yellow' || daysToExpiry < 30) return 'yellow';
  return 'green';
}

export interface RenewalRecord {
  id: string;
  property: RenewalPropertyDetails;
  lease: LeaseDetails;
  status: RenewalStatus;
  ownerAcknowledgement: OwnerAcknowledgement;
  agreementUpload: AgreementUpload;
  actionLog: ActionLogEntry[];
  alerts: RenewalAlert[];
  scoreImpact: RenewalScoreImpact;
  createdAt: string;
  updatedAt: string;
}

// State machine - valid transitions (system-enforced)
export const VALID_STAGE_TRANSITIONS: Record<RenewalStage, RenewalStage[]> = {
  renewal_not_started: ['negotiation_in_progress', 'renewal_failed'],
  negotiation_in_progress: ['proposal_sent', 'renewal_failed'],
  proposal_sent: ['owner_acknowledged', 'renewal_failed'],
  owner_acknowledged: ['agreement_uploaded', 'renewal_failed'],
  agreement_uploaded: ['tcf_created', 'renewal_failed'],
  tcf_created: ['pms_renewed', 'renewal_failed'],
  pms_renewed: ['renewal_completed', 'renewal_failed'],
  renewal_completed: [],
  renewal_failed: [],
};

// SOP Lock Rules
export interface SOPValidation {
  canProceed: boolean;
  blockedReason?: string;
  requiredStep?: RenewalStage;
}

export function validateStageTransition(
  currentStage: RenewalStage,
  targetStage: RenewalStage,
  hasOwnerAcknowledgement: boolean,
  hasAgreementUploaded: boolean
): SOPValidation {
  const validTransitions = VALID_STAGE_TRANSITIONS[currentStage];
  if (!validTransitions.includes(targetStage)) {
    return {
      canProceed: false,
      blockedReason: `Cannot move from ${RENEWAL_STAGE_LABELS[currentStage]} to ${RENEWAL_STAGE_LABELS[targetStage]}. Follow the renewal process in order.`,
      requiredStep: validTransitions[0],
    };
  }
  
  if (targetStage === 'agreement_uploaded' && !hasOwnerAcknowledgement) {
    return {
      canProceed: false,
      blockedReason: '❌ Agreement cannot be uploaded without owner acknowledgement.',
      requiredStep: 'owner_acknowledged',
    };
  }
  
  if (targetStage === 'tcf_created' && !hasAgreementUploaded) {
    return {
      canProceed: false,
      blockedReason: '❌ TCF cannot be created without uploaded agreement.',
      requiredStep: 'agreement_uploaded',
    };
  }
  
  return { canProceed: true };
}

// Risk calculation
export function calculateRiskLevel(
  daysToExpiry: number, 
  currentStage: RenewalStage,
  hasOwnerAcknowledgement: boolean,
  noticePeriod: number = 60
): RiskLevel {
  if (currentStage === 'renewal_failed') return 'red';
  if (currentStage === 'renewal_completed') return 'green';
  if (daysToExpiry < 30) return 'red';
  if (daysToExpiry < 45) return 'amber';
  return 'green';
}

// Funnel stats
export interface RenewalFunnelStats {
  total: number;
  byStage: Record<RenewalStage, number>;
  byRisk: Record<RiskLevel, number>;
  byExpiryBucket: {
    critical: number;
    urgent: number;
    upcoming: number;
    safe: number;
  };
  conversionRate: number;
  avgDaysLeft: number;
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
  noticePeriod?: number;
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

// Renewal Analytics types
export interface RenewalAnalyticsStats {
  totalRenewalsDue: number;
  renewalPercent: number;
  onTimeRenewalPercent: number;
  avgDaysToClose: number;
  renewalsInRiskZone: number;
  failedRenewalsPercent: number;
  stageDistribution: { stage: string; count: number }[];
  monthlyRenewalPercent: { month: string; percent: number }[];
  pmWiseRenewalPercent: { pmName: string; total: number; completed: number; percent: number }[];
}
