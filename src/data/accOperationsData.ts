// Dummy operational journey data — Service Requests, Rent ledger, Inspections.
// Deterministically derived from existing property mock data so every property
// has a believable end-to-end trail.

// ---------- Audit timeline ----------
export interface AuditEvent {
  kind: 'created' | 'status_change' | 'assigned' | 'comment' | 'breach' | 'resolved';
  label: string;
  actor: string;
  role: 'PM' | 'TL' | 'Vendor' | 'System' | 'Tenant' | 'Owner';
  timestamp: string;   // human-readable
  detail?: string;
}

function fmtDate(daysAgo: number, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, (daysAgo * 7) % 60, 0, 0);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
}

function h(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(n);
}

const ACTORS = ['Ravi K.', 'Priya N.', 'Arjun M.', 'Sneha R.', 'Vikram S.'];
const VENDORS_NAMES = ['Cleanify ops', 'FixIt vendor', 'UrbanCare ops'];

export function getAuditTrail(taskId: string): AuditEvent[] {
  const seed = h(taskId);
  const pm = ACTORS[seed % ACTORS.length];
  const tl = ACTORS[(seed + 2) % ACTORS.length];
  const vendor = VENDORS_NAMES[seed % VENDORS_NAMES.length];

  if (taskId.startsWith('sr-')) {
    const raised = 6 + (seed % 8);
    return [
      { kind: 'created', label: 'SR raised by tenant', actor: 'Tenant', role: 'Tenant', timestamp: fmtDate(raised, 9), detail: 'Issue reported via app' },
      { kind: 'assigned', label: `Assigned to ${vendor}`, actor: pm, role: 'PM', timestamp: fmtDate(raised - 1, 11) },
      { kind: 'comment', label: 'Vendor confirmed visit slot', actor: vendor, role: 'Vendor', timestamp: fmtDate(raised - 2, 14), detail: 'ETA: next morning 10am' },
      ...(seed % 3 === 0 ? [{ kind: 'breach' as const, label: 'TAT breached', actor: 'System', role: 'System' as const, timestamp: fmtDate(raised - 3, 10), detail: 'Elapsed > TAT window' }] : []),
      { kind: 'status_change', label: 'Moved to In progress', actor: pm, role: 'PM', timestamp: fmtDate(Math.max(0, raised - 4), 16) },
    ];
  }
  if (taskId.startsWith('rent-')) {
    const due = 4 + (seed % 10);
    return [
      { kind: 'created', label: 'Rent invoice raised', actor: 'System', role: 'System', timestamp: fmtDate(due + 5, 9) },
      { kind: 'comment', label: 'Reminder sent to tenant', actor: pm, role: 'PM', timestamp: fmtDate(due, 11) },
      ...(due > 7 ? [{ kind: 'breach' as const, label: 'Marked overdue', actor: 'System', role: 'System' as const, timestamp: fmtDate(due - 7, 0), detail: '7+ days past due' }] : []),
      ...(seed % 4 === 0 ? [{ kind: 'status_change' as const, label: 'Escalated to TL', actor: pm, role: 'PM' as const, timestamp: fmtDate(2, 15) }] : []),
      { kind: 'comment', label: 'Payment commitment captured', actor: tl, role: 'TL', timestamp: fmtDate(1, 12), detail: 'Tenant promised by month end' },
    ];
  }
  if (taskId.startsWith('insp-')) {
    return [
      { kind: 'created', label: 'Inspection task created', actor: 'System', role: 'System', timestamp: fmtDate(12, 9) },
      { kind: 'comment', label: 'Tenant notified', actor: pm, role: 'PM', timestamp: fmtDate(10, 10) },
      { kind: 'status_change', label: 'Walkthrough scheduled', actor: pm, role: 'PM', timestamp: fmtDate(6, 14) },
      ...(seed % 3 !== 0 ? [{ kind: 'breach' as const, label: 'Overdue — schedule missed', actor: 'System', role: 'System' as const, timestamp: fmtDate(3, 0) }] : [{ kind: 'resolved' as const, label: 'Report uploaded', actor: pm, role: 'PM' as const, timestamp: fmtDate(1, 17) }]),
    ];
  }
  return [
    { kind: 'created', label: 'Task created', actor: 'System', role: 'System', timestamp: fmtDate(3, 10) },
    { kind: 'comment', label: 'PM acknowledged', actor: pm, role: 'PM', timestamp: fmtDate(2, 11) },
  ];
}

import { allProperties } from '@/data/propertyData';
import type { Property } from '@/types/property';

// ---------- Service Requests ----------
export type SrStage =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'on_hold'
  | 'resolved'
  | 'closed';

export const SR_STAGES: SrStage[] = ['open', 'assigned', 'in_progress', 'on_hold', 'resolved', 'closed'];
export const SR_STAGE_LABEL: Record<SrStage, string> = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In progress',
  on_hold: 'On hold',
  resolved: 'Resolved',
  closed: 'Closed',
};
export const SR_NEXT_ACTION: Record<SrStage, string> = {
  open: 'Triage and assign vendor',
  assigned: 'Confirm vendor visit slot',
  in_progress: 'Track vendor visit and update tenant',
  on_hold: 'Resolve blocker (parts / approval)',
  resolved: 'Get tenant confirmation and close',
  closed: 'No action — archive',
};

const SR_CATEGORIES = ['Plumbing', 'Electrical', 'Appliance', 'Carpentry', 'Pest control', 'HVAC', 'Civil'];

export interface ServiceRequest {
  id: string;
  propertyId: string;
  propertyName: string;
  city: string;
  ownerName: string;
  category: string;
  title: string;
  stage: SrStage;
  raisedDaysAgo: number;
  tatHours: number;       // expected
  elapsedHours: number;   // actual
  withinTat: boolean;
  vendor: string;
  tenantContact: string;
  notes: string;
}

const VENDORS = ['Cleanify', 'FixIt Pro', 'UrbanCare', 'Sparkle', 'HomeFix', '—'];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export function getServiceRequests(): ServiceRequest[] {
  const srs: ServiceRequest[] = [];
  allProperties.forEach((p) => {
    const total = Math.max(1, p.operational.totalSRs || 2);
    for (let i = 0; i < Math.min(total, 4); i++) {
      const seed = hash(p.basic.propertyId + i);
      const stageIdx = (seed % 100) < (p.operational.srSLAPercent || 70) ? 5 : seed % 6;
      const stage = SR_STAGES[stageIdx];
      const cat = pick(SR_CATEGORIES, seed);
      const raised = (seed % 28) + (stage === 'closed' ? 10 : 1);
      const tatHours = cat === 'Plumbing' || cat === 'Electrical' ? 24 : 48;
      const elapsed = stage === 'closed' || stage === 'resolved'
        ? Math.round(tatHours * (0.4 + ((seed % 50) / 100)))
        : raised * 24;
      const withinTat = stage === 'closed' || stage === 'resolved'
        ? elapsed <= tatHours
        : elapsed <= tatHours;
      srs.push({
        id: `sr-${p.basic.propertyId}-${i}`,
        propertyId: p.basic.propertyId,
        propertyName: p.basic.propertyName,
        city: p.basic.city,
        ownerName: p.basic.ownerName,
        category: cat,
        title: `${cat} issue reported by tenant`,
        stage,
        raisedDaysAgo: raised,
        tatHours,
        elapsedHours: elapsed,
        withinTat,
        vendor: stage === 'open' ? '—' : pick(VENDORS, seed + 3),
        tenantContact: `+91 9${String(seed).padStart(9, '0').slice(0, 9)}`,
        notes: stage === 'on_hold' ? 'Awaiting owner approval for spare part'
          : stage === 'in_progress' ? 'Vendor scheduled tomorrow morning'
          : stage === 'open' ? 'Pending triage'
          : '',
      });
    }
  });
  return srs;
}

// ---------- Rent Ledger ----------
export type RentStatus = 'paid' | 'due' | 'overdue' | 'critically_overdue' | 'defaulter';
export const RENT_STATUS_LABEL: Record<RentStatus, string> = {
  paid: 'Paid',
  due: 'Due',
  overdue: 'Overdue',
  critically_overdue: 'Critically overdue',
  defaulter: 'Defaulter (chronic)',
};

export interface RentRecord {
  id: string;
  propertyId: string;
  propertyName: string;
  city: string;
  ownerName: string;
  tenantName: string;
  rentAmount: number;
  dueDate: string;
  daysLate: number;
  status: RentStatus;
  monthsLatePast12: number;   // chronic indicator
  lastPaidOn: string;
  nextAction: string;
  contact: string;
}

const RENT_NEXT: Record<RentStatus, string> = {
  paid: 'No action',
  due: 'Send polite reminder to tenant',
  overdue: 'Call tenant + cc owner with timeline',
  critically_overdue: 'Escalate to TL, formal notice draft',
  defaulter: 'Initiate legal recovery + termination review',
};

export function getRentLedger(): RentRecord[] {
  return allProperties
    .filter(p => p.basic.tenantStatus === 'occupied')
    .map((p) => {
      const seed = hash('rent-' + p.basic.propertyId);
      const baseLate = p.financial.lateDays || 0;
      const monthsLate = baseLate > 10 ? 4 + (seed % 4) : baseLate > 5 ? 2 + (seed % 2) : baseLate > 0 ? 1 : 0;
      const status: RentStatus = baseLate === 0 ? 'paid'
        : baseLate <= 3 ? 'due'
        : baseLate <= 7 ? 'overdue'
        : baseLate <= 15 ? 'critically_overdue'
        : 'defaulter';
      const rentAmount = 18000 + (seed % 35) * 1000;
      return {
        id: `rent-${p.basic.propertyId}`,
        propertyId: p.basic.propertyId,
        propertyName: p.basic.propertyName,
        city: p.basic.city,
        ownerName: p.basic.ownerName,
        tenantName: `Tenant ${String.fromCharCode(65 + (seed % 26))}.`,
        rentAmount,
        dueDate: p.financial.rentDueDate,
        daysLate: baseLate,
        status,
        monthsLatePast12: monthsLate,
        lastPaidOn: p.financial.rentPaidDate ?? '—',
        nextAction: RENT_NEXT[status],
        contact: p.basic.ownerName,
      };
    });
}

// ---------- Inspections / Move-in / Move-out ----------
export type InspectionType = 'periodic' | 'move_in' | 'move_out';
export type InspectionStatus = 'scheduled' | 'overdue' | 'completed';

export const INSP_LABEL: Record<InspectionType, string> = {
  periodic: 'Periodic inspection',
  move_in: 'Move-in report',
  move_out: 'Move-out report',
};

export interface InspectionRecord {
  id: string;
  propertyId: string;
  propertyName: string;
  city: string;
  ownerName: string;
  type: InspectionType;
  status: InspectionStatus;
  daysOverdue: number;
  scheduledOn: string;
  completedOn: string | null;
  journey: { step: string; done: boolean; whenDays?: number }[];
  nextAction: string;
}

const PERIODIC_JOURNEY = ['Notify tenant', 'Schedule visit', 'Onsite walkthrough', 'Upload report', 'Share with owner'];
const MOVEIN_JOURNEY = ['Pre-handover checklist', 'Snagging photos', 'Asset inventory', 'Tenant sign-off', 'Upload report'];
const MOVEOUT_JOURNEY = ['Move-out notice received', 'Pre-inspection visit', 'Damage assessment', 'Deposit calculation', 'Final settlement'];

function buildJourney(template: string[], stageReached: number, baseDays: number) {
  return template.map((step, i) => ({
    step,
    done: i < stageReached,
    whenDays: i < stageReached ? baseDays - (template.length - i) : undefined,
  }));
}

export function getInspectionRecords(): InspectionRecord[] {
  const out: InspectionRecord[] = [];
  allProperties.forEach((p) => {
    const seed = hash('insp-' + p.basic.propertyId);

    // Periodic
    const periodicDone = p.operational.inspectionStatus === 'completed';
    const periodicOverdue = periodicDone ? 0 : 5 + (seed % 25);
    out.push({
      id: `insp-per-${p.basic.propertyId}`,
      propertyId: p.basic.propertyId,
      propertyName: p.basic.propertyName,
      city: p.basic.city,
      ownerName: p.basic.ownerName,
      type: 'periodic',
      status: periodicDone ? 'completed' : periodicOverdue > 7 ? 'overdue' : 'scheduled',
      daysOverdue: periodicOverdue,
      scheduledOn: '—',
      completedOn: periodicDone ? p.financial.rentPaidDate ?? '—' : null,
      journey: buildJourney(PERIODIC_JOURNEY, periodicDone ? 5 : (seed % 4), periodicOverdue),
      nextAction: periodicDone ? 'No action' : 'Schedule walkthrough this week',
    });

    // Move-in
    if (p.basic.tenantStatus === 'occupied') {
      const miDone = p.operational.moveInReportCompleted;
      const miOverdue = miDone ? 0 : 4 + (seed % 14);
      out.push({
        id: `insp-mi-${p.basic.propertyId}`,
        propertyId: p.basic.propertyId,
        propertyName: p.basic.propertyName,
        city: p.basic.city,
        ownerName: p.basic.ownerName,
        type: 'move_in',
        status: miDone ? 'completed' : miOverdue > 5 ? 'overdue' : 'scheduled',
        daysOverdue: miOverdue,
        scheduledOn: '—',
        completedOn: miDone ? '—' : null,
        journey: buildJourney(MOVEIN_JOURNEY, miDone ? 5 : (seed % 4), miOverdue),
        nextAction: miDone ? 'No action' : 'Complete snagging and upload report',
      });
    }

    // Move-out
    if (p.basic.tenantStatus === 'vacant' || (seed % 11 === 0)) {
      const moDone = p.operational.moveOutReportCompleted;
      const moOverdue = moDone ? 0 : 3 + (seed % 10);
      out.push({
        id: `insp-mo-${p.basic.propertyId}`,
        propertyId: p.basic.propertyId,
        propertyName: p.basic.propertyName,
        city: p.basic.city,
        ownerName: p.basic.ownerName,
        type: 'move_out',
        status: moDone ? 'completed' : moOverdue > 5 ? 'overdue' : 'scheduled',
        daysOverdue: moOverdue,
        scheduledOn: '—',
        completedOn: moDone ? '—' : null,
        journey: buildJourney(MOVEOUT_JOURNEY, moDone ? 5 : (seed % 4), moOverdue),
        nextAction: moDone ? 'No action' : 'Run pre-inspection and damage list',
      });
    }
  });
  return out;
}

// ---------- Score / incentive impact map ----------
// Aligned with project Property Health Score (0-100) pillars.
export type ImpactCategory =
  | 'renewal' | 'rent' | 'sr' | 'inspection' | 'move_in' | 'move_out' | 'followup' | 'churn';

export interface ScoreImpact {
  pillar: 'Operations' | 'Financial' | 'Customer Experience' | 'Retention' | 'Ecosystem';
  pillarMax: number;
  pointsAtRisk: number;     // approximate deduction if unresolved
  percentImpact: number;    // relative to total 100
  incentive: string;        // narrative
  metric: string;           // specific metric affected
}

export function getScoreImpact(category: ImpactCategory, aging: number = 0): ScoreImpact {
  const escalate = (base: number) => base + Math.min(8, Math.floor(aging / 3));
  switch (category) {
    case 'rent':
      return {
        pillar: 'Financial', pillarMax: 15,
        pointsAtRisk: Math.min(15, escalate(5)),
        percentImpact: Math.min(15, escalate(5)),
        metric: 'On-time rent collection',
        incentive: 'Each late month drops you 1 incentive band; >15d = chronic defaulter flag voids payout for that property.',
      };
    case 'sr':
      return {
        pillar: 'Operations', pillarMax: 40,
        pointsAtRisk: Math.min(10, escalate(3)),
        percentImpact: Math.min(10, escalate(3)),
        metric: 'SR closure within SLA %',
        incentive: 'Operations pillar weighs 40 pts. Sustained <80% SLA blocks top-tier incentive eligibility.',
      };
    case 'inspection':
    case 'move_in':
    case 'move_out':
      return {
        pillar: 'Operations', pillarMax: 40,
        pointsAtRisk: category === 'inspection' ? Math.min(6, escalate(2)) : Math.min(8, escalate(4)),
        percentImpact: category === 'inspection' ? Math.min(6, escalate(2)) : Math.min(8, escalate(4)),
        metric: category === 'inspection' ? 'Periodic inspection compliance'
          : category === 'move_in' ? 'Move-in report completeness'
          : 'Move-out report & deposit closure',
        incentive: 'Missing reports = ops compliance failure. Two misses per quarter disqualify Top-20% trip eligibility.',
      };
    case 'renewal':
    case 'churn':
      return {
        pillar: 'Retention', pillarMax: 25,
        pointsAtRisk: Math.min(25, escalate(10)),
        percentImpact: Math.min(25, escalate(10)),
        metric: 'Renewal completion %',
        incentive: 'Red renewals drop the property score and trigger churn risk — direct hit on quarterly incentive multiplier.',
      };
    case 'followup':
      return {
        pillar: 'Customer Experience', pillarMax: 25,
        pointsAtRisk: Math.min(5, escalate(2)),
        percentImpact: Math.min(5, escalate(2)),
        metric: 'Owner / tenant rating',
        incentive: 'CX dips reduce renewal probability and may reclassify property to high-risk.',
      };
  }
}
