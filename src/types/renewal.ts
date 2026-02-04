// Renewal Tracker Data Types - Action-Driven System

// NEW Stage machine - system-driven, read-only for PMs
export type RenewalStage = 
  | 'renewal_not_started'
  | 'negotiation_in_progress'
  | 'proposal_sent'
  | 'owner_acknowledged'
  | 'agreement_sent'
  | 'agreement_signed'
  | 'agreement_uploaded'
  | 'tcf_completed'
  | 'pms_renewed'
  | 'renewal_completed'
  | 'renewal_failed';

export const RENEWAL_STAGE_ORDER: readonly RenewalStage[] = [
  'renewal_not_started',
  'negotiation_in_progress',
  'proposal_sent',
  'owner_acknowledged',
  'agreement_sent',
  'agreement_signed',
  'agreement_uploaded',
  'tcf_completed',
  'pms_renewed',
  'renewal_completed',
] as const;

export const RENEWAL_STAGE_LABELS: Record<RenewalStage, string> = {
  renewal_not_started: 'Renewal Not Started',
  negotiation_in_progress: 'Negotiation In Progress',
  proposal_sent: 'Proposal Sent to Owner',
  owner_acknowledged: 'Owner Acknowledgement Received',
  agreement_sent: 'Agreement Sent for Signature',
  agreement_signed: 'Agreement Signed',
  agreement_uploaded: 'Renewal Agreement Uploaded',
  tcf_completed: 'TCF Completed',
  pms_renewed: 'PMS Subscription Renewed',
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

export function getNextAction(
  stage: RenewalStage, 
  agreementSigned: boolean,
  agreementUploaded: boolean
): NextActionConfig {
  switch (stage) {
    case 'renewal_not_started':
      return { label: 'Start Renewal', actionKey: 'start_renewal' };
    case 'negotiation_in_progress':
      return { label: 'Send Proposal', actionKey: 'send_proposal' };
    case 'proposal_sent':
      return { label: 'Awaiting Owner Acknowledgement', actionKey: 'await_ack', disabled: true, disabledReason: 'Owner must respond via app' };
    case 'owner_acknowledged':
      return { label: 'Send Agreement for Signature', actionKey: 'send_agreement' };
    case 'agreement_sent':
      return { label: 'Awaiting Signature', actionKey: 'await_signature', disabled: true, disabledReason: 'Owner must sign agreement' };
    case 'agreement_signed':
      return { label: 'Upload Signed Agreement', actionKey: 'upload_agreement' };
    case 'agreement_uploaded':
      return { label: 'Punch TCF', actionKey: 'punch_tcf' };
    case 'tcf_completed':
      return { label: 'Renew PMS Subscription', actionKey: 'renew_pms' };
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
  lockDeadline: string; // Must be locked by this date
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
}

// Action Log Entry - tracks who did what when
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
  agreementSigned: boolean;
  agreementUploaded: boolean;
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

// Renewal Score Impact - At-Risk Model
export interface RenewalScoreImpact {
  basePoints: 25; // Every property starts with 25 points
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
  
  // Late initiation: -5 if not started within SLA
  const lateInitiation = daysToExpiry < initiationDeadline && currentStage === 'renewal_not_started';
  deductions.push({
    reason: 'Late initiation',
    points: -5,
    triggered: lateInitiation,
  });
  
  // Owner ack delay: -5 if no ack by deadline
  const ackDelay = daysToExpiry < ackDeadline && !hasOwnerAck && 
    ['renewal_not_started', 'negotiation_in_progress', 'proposal_sent'].includes(currentStage);
  deductions.push({
    reason: 'Owner acknowledgement delay',
    points: -5,
    triggered: ackDelay,
  });
  
  // Agreement signed late: -5 if not signed by lock deadline
  const signedLate = daysToExpiry < lockDeadline && 
    !['agreement_signed', 'agreement_uploaded', 'tcf_completed', 'pms_renewed', 'renewal_completed'].includes(currentStage);
  deductions.push({
    reason: 'Agreement signed late',
    points: -5,
    triggered: signedLate,
  });
  
  // Forced move-out: -15
  const forcedMoveout = currentStage === 'renewal_failed';
  deductions.push({
    reason: 'Forced move-out',
    points: -15,
    triggered: forcedMoveout,
  });
  
  const totalDeduction = deductions.filter(d => d.triggered).reduce((sum, d) => sum + d.points, 0);
  const currentPoints = Math.max(0, base + totalDeduction);
  
  // Generate at-risk message
  let atRiskMessage = '';
  if (currentStage === 'renewal_completed') {
    atRiskMessage = 'No penalty';
  } else if (currentStage === 'renewal_failed') {
    atRiskMessage = 'At risk of −15 pts (Forced move-out)';
  } else if (lateInitiation) {
    atRiskMessage = 'At risk of −5 pts (Late initiation)';
  } else if (ackDelay) {
    atRiskMessage = 'At risk of −10 pts (Ack delay)';
  } else if (signedLate) {
    atRiskMessage = 'At risk of −15 pts (Agreement delay)';
  } else {
    atRiskMessage = 'On track';
  }
  
  return {
    basePoints: 25,
    currentPoints,
    deductions,
    atRiskMessage,
  };
}

export interface RenewalRecord {
  id: string;
  property: RenewalPropertyDetails;
  lease: LeaseDetails;
  status: RenewalStatus;
  ownerAcknowledgement: OwnerAcknowledgement;
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
  owner_acknowledged: ['agreement_sent', 'renewal_failed'],
  agreement_sent: ['agreement_signed', 'renewal_failed'],
  agreement_signed: ['agreement_uploaded', 'renewal_failed'],
  agreement_uploaded: ['tcf_completed', 'renewal_failed'],
  tcf_completed: ['pms_renewed', 'renewal_failed'],
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
  hasSignedAgreement: boolean,
  hasUploadedAgreement: boolean
): SOPValidation {
  const validTransitions = VALID_STAGE_TRANSITIONS[currentStage];
  if (!validTransitions.includes(targetStage)) {
    return {
      canProceed: false,
      blockedReason: `Cannot move from ${RENEWAL_STAGE_LABELS[currentStage]} to ${RENEWAL_STAGE_LABELS[targetStage]}. Follow the renewal process in order.`,
      requiredStep: validTransitions[0],
    };
  }
  
  // Hard Stop: Agreement cannot be sent without owner acknowledgement
  if (targetStage === 'agreement_sent' && !hasOwnerAcknowledgement) {
    return {
      canProceed: false,
      blockedReason: '❌ Agreement cannot be sent without owner acknowledgement.',
      requiredStep: 'owner_acknowledged',
    };
  }
  
  // Hard Stop: Upload requires signed agreement
  if (targetStage === 'agreement_uploaded' && !hasSignedAgreement) {
    return {
      canProceed: false,
      blockedReason: '❌ Cannot upload agreement without signature.',
      requiredStep: 'agreement_signed',
    };
  }
  
  // Hard Stop: TCF requires uploaded agreement
  if (targetStage === 'tcf_completed' && !hasUploadedAgreement) {
    return {
      canProceed: false,
      blockedReason: '❌ TCF cannot be punched without uploaded agreement.',
      requiredStep: 'agreement_uploaded',
    };
  }
  
  return { canProceed: true };
}

// Risk calculation - notice-period aware
export function calculateRiskLevel(
  daysToExpiry: number, 
  currentStage: RenewalStage,
  hasOwnerAcknowledgement: boolean,
  noticePeriod: number = 60
): RiskLevel {
  if (currentStage === 'renewal_failed') return 'red';
  if (currentStage === 'renewal_completed') return 'green';
  
  // Less than 30 days = Red
  if (daysToExpiry < 30) return 'red';
  
  // 30-45 days = Amber
  if (daysToExpiry < 45) return 'amber';
  
  // 45+ days = Green
  return 'green';
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
