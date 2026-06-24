// ACC — derived aggregators over existing mock data.
// Pure functions; no side effects. All ACC dashboards read from here.

import { allProperties } from '@/data/propertyData';
import { allRenewals } from '@/data/renewalData';
import { allPMs, cityStats as leaderCityStats } from '@/data/leaderboardData';
import { Property } from '@/types/property';
import { RenewalRecord } from '@/types/renewal';

export type AccPeriod = 'today' | 'week' | 'month' | 'quarter';

export const PERIOD_LABEL: Record<AccPeriod, string> = {
  today: 'Today',
  week: 'This week',
  month: 'This month',
  quarter: 'This quarter',
};

const PERIOD_DAYS: Record<AccPeriod, number> = {
  today: 1,
  week: 7,
  month: 30,
  quarter: 90,
};

export interface CriticalAction {
  id: string;
  urgency: 'critical' | 'high' | 'medium';
  category: 'renewal' | 'rent' | 'sr' | 'inspection' | 'followup' | 'churn';
  /** expected = routine PM job (inspections, move-in/out, follow-ups);
   *  flagged = system-detected exception (late rent, red renewal, SLA breach) */
  kind: 'expected' | 'flagged';
  title: string;
  subtitle: string;
  nextStep: string;
  contact: string;
  agingDays: number;
  hoursLeft: number;
  link: string;
  propertyId?: string;
}

export interface Escalation {
  id: string;
  propertyId?: string;
  property: string;
  city: string;
  owner: string;
  reason: string;
  severity: 'critical' | 'high' | 'medium';
  agingDays: number;
  rootCause: string;
}

export interface FollowUp {
  id: string;
  propertyId?: string;
  with: string;
  topic: string;
  due: string;
  agingDays: number;
  channel: 'call' | 'message' | 'meet';
}

export interface OperationalSummary {
  tasks: number;
  escalations: number;
  renewalsPending: number;
  reRentingPending: number;
  slaBreaches: number;
  followUps: number;
  highRisk: number;
}

const NOW = new Date();

function daysBetween(a: Date, b: Date) {
  return Math.max(0, Math.round((a.getTime() - b.getTime()) / 86400000));
}

export function getOperationalSummary(scope?: { city?: string; pm?: string }): OperationalSummary {
  const props = filterProps(scope);
  const ren = filterRenewals(scope);

  const slaBreaches = props.filter(p => p.operational.srSLAPercent < 80).length;
  const renewalsPending = ren.filter(r =>
    r.status.currentStage !== 'renewal_completed' && r.status.currentStage !== 'renewal_failed'
  ).length;
  const escalations = props.filter(p =>
    p.riskLevel === 'high' || (!p.financial.onTimeRent && p.financial.lateDays > 7)
  ).length;
  const reRenting = props.filter(p => p.basic.tenantStatus === 'vacant').length
    + ren.filter(r => r.status.currentStage === 'renewal_failed').length;
  const followUps = props.filter(p => p.customerExperience.ownerRating < 4.0).length;
  const highRisk = props.filter(p => p.riskLevel === 'high').length;

  const lateRent = props.filter(p => !p.financial.onTimeRent && p.basic.tenantStatus === 'occupied').length;
  const redRen = ren.filter(r => r.status.riskLevel === 'red'
    && r.status.currentStage !== 'renewal_completed'
    && r.status.currentStage !== 'renewal_failed').length;
  const pendingReports = props.filter(p =>
    !p.operational.moveInReportCompleted || !p.operational.moveOutReportCompleted
  ).length;

  return {
    tasks: lateRent + redRen + pendingReports,
    escalations,
    renewalsPending,
    reRentingPending: reRenting,
    slaBreaches,
    followUps,
    highRisk,
  };
}

function filterProps(scope?: { city?: string; pm?: string }): Property[] {
  if (!scope) return allProperties;
  return allProperties.filter(p =>
    (!scope.city || p.basic.city === scope.city)
  );
}

function filterRenewals(scope?: { city?: string; pm?: string }): RenewalRecord[] {
  if (!scope) return allRenewals;
  return allRenewals.filter(r =>
    (!scope.city || r.property.city === scope.city)
    && (!scope.pm || r.property.assignedPM === scope.pm)
  );
}

export function getCriticalActions(scope?: { city?: string; pm?: string }, period: AccPeriod = 'today'): CriticalAction[] {
  const props = filterProps(scope);
  const ren = filterRenewals(scope);
  const actions: CriticalAction[] = [];
  const windowDays = PERIOD_DAYS[period];
  // For renewals, expand window to roughly match (renewal cycle = ~90d before expiry)
  const renewalWindow = period === 'today' ? 30 : period === 'week' ? 45 : period === 'month' ? 75 : 120;

  // Red renewals (flagged) — within renewal window
  ren.filter(r => r.status.riskLevel === 'red'
    && r.status.currentStage !== 'renewal_completed'
    && r.status.currentStage !== 'renewal_failed'
    && r.lease.daysToExpiry <= renewalWindow
  ).forEach(r => {
    actions.push({
      id: `ren-${r.id}`,
      urgency: 'critical',
      category: 'renewal',
      kind: 'flagged',
      title: `Renewal at risk — ${r.property.propertyName}`,
      subtitle: `${r.property.city} • ${r.lease.daysToExpiry}d to expiry`,
      nextStep: 'Reach out to owner immediately and document response',
      contact: 'Owner',
      agingDays: Math.max(0, 90 - r.lease.daysToExpiry),
      hoursLeft: Math.max(-48, r.lease.daysToExpiry * 24),
      link: '/renewals',
    });
  });

  // Late rent (flagged)
  props.filter(p => !p.financial.onTimeRent && p.basic.tenantStatus === 'occupied'
    && (period === 'quarter' || p.financial.lateDays <= windowDays * 4 + 7)
  ).forEach(p => {
    actions.push({
      id: `rent-${p.basic.propertyId}`,
      urgency: p.financial.lateDays > 10 ? 'critical' : p.financial.lateDays > 5 ? 'high' : 'medium',
      category: 'rent',
      kind: 'flagged',
      title: `Rent ${p.financial.lateDays}d late — ${p.basic.propertyName}`,
      subtitle: `${p.basic.city} • Owner ${p.basic.ownerName}`,
      nextStep: 'Confirm tenant payment commitment and update note',
      contact: p.basic.ownerName,
      agingDays: p.financial.lateDays,
      hoursLeft: -p.financial.lateDays * 24,
      link: '/properties',
      propertyId: p.basic.propertyId,
    });
  });

  // SR SLA breaches (flagged)
  props.filter(p => p.operational.srSLAPercent < 75 && p.operational.totalSRs >= 3).forEach(p => {
    actions.push({
      id: `sr-${p.basic.propertyId}`,
      urgency: p.operational.srSLAPercent < 60 ? 'high' : 'medium',
      category: 'sr',
      kind: 'flagged',
      title: `SR SLA at ${p.operational.srSLAPercent}% — ${p.basic.propertyName}`,
      subtitle: `${p.operational.totalSRs} requests • ${p.operational.totalSRs - p.operational.srClosedWithinSLA} breached`,
      nextStep: 'Close open service requests and update tenant',
      contact: p.basic.ownerName,
      agingDays: Math.round((100 - p.operational.srSLAPercent) / 5),
      hoursLeft: 8,
      link: '/properties',
      propertyId: p.basic.propertyId,
    });
  });

  // Pending move-in reports (expected PM job)
  props.filter(p => p.basic.tenantStatus === 'occupied' && !p.operational.moveInReportCompleted).forEach(p => {
    actions.push({
      id: `mi-${p.basic.propertyId}`,
      urgency: 'medium',
      category: 'inspection',
      kind: 'expected',
      title: `Move-in report pending — ${p.basic.propertyName}`,
      subtitle: `${p.basic.city} • Tenant occupied`,
      nextStep: 'Complete walkthrough with photos and upload',
      contact: p.basic.ownerName,
      agingDays: 5,
      hoursLeft: 48,
      link: '/properties',
      propertyId: p.basic.propertyId,
    });
  });

  // Pending inspections (expected)
  props.filter(p => p.operational.inspectionStatus === 'pending').slice(0, 20).forEach(p => {
    actions.push({
      id: `insp-${p.basic.propertyId}`,
      urgency: 'medium',
      category: 'inspection',
      kind: 'expected',
      title: `Quarterly inspection due — ${p.basic.propertyName}`,
      subtitle: `${p.basic.city} • Routine PM walkthrough`,
      nextStep: 'Schedule visit and submit inspection report',
      contact: p.basic.ownerName,
      agingDays: 3,
      hoursLeft: 72,
      link: '/properties',
      propertyId: p.basic.propertyId,
    });
  });

  const order = { critical: 0, high: 1, medium: 2 } as const;
  return actions
    .sort((a, b) => order[a.urgency] - order[b.urgency] || b.agingDays - a.agingDays)
    .slice(0, 60);
}

export function getEscalations(scope?: { city?: string; pm?: string }): Escalation[] {
  const props = filterProps(scope);
  return props
    .filter(p => p.riskLevel === 'high' || p.customerExperience.ownerRating < 3.5 || p.financial.lateDays > 7)
    .map(p => {
      const reasons: string[] = [];
      if (p.financial.lateDays > 7) reasons.push(`rent ${p.financial.lateDays}d late`);
      if (p.customerExperience.ownerRating < 3.5) reasons.push(`owner rating ${p.customerExperience.ownerRating.toFixed(1)}`);
      if (p.operational.srSLAPercent < 70) reasons.push(`SLA ${p.operational.srSLAPercent}%`);
      if (reasons.length === 0) reasons.push('high risk');
      return {
        id: `esc-${p.basic.propertyId}`,
        property: p.basic.propertyName,
        city: p.basic.city,
        owner: p.basic.ownerName,
        reason: reasons.join(' · '),
        severity: (p.financial.lateDays > 15 || p.customerExperience.ownerRating < 3 ? 'critical'
          : p.financial.lateDays > 7 || p.customerExperience.ownerRating < 3.5 ? 'high'
          : 'medium') as Escalation['severity'],
        agingDays: Math.max(p.financial.lateDays, p.operational.totalSRs * 2, 3),
        rootCause: p.financial.lateDays > 7 ? 'Payment dispute'
          : p.customerExperience.ownerRating < 3.5 ? 'Communication gap'
          : p.operational.srSLAPercent < 70 ? 'Vendor delay'
          : 'Recurring SR',
      };
    })
    .sort((a, b) => b.agingDays - a.agingDays)
    .slice(0, 25);
}

export interface PipelineCounts {
  renewal: { upcoming: number; negotiation: number; ownerAligned: number; tenantAligned: number; highRisk: number; churnRisk: number; closed: number };
  reRenting: { moveOut: number; vacant: number; brokerAssigned: number; ownerSelfRent: number; lost: number };
}

export function getPipelineCounts(scope?: { city?: string; pm?: string }): PipelineCounts {
  const ren = filterRenewals(scope);
  const props = filterProps(scope);
  const stage = (s: string) => ren.filter(r => r.status.currentStage === s).length;
  const vacant = props.filter(p => p.basic.tenantStatus === 'vacant');
  return {
    renewal: {
      upcoming: stage('renewal_not_started'),
      negotiation: stage('negotiation_in_progress'),
      ownerAligned: stage('owner_acknowledged') + stage('proposal_sent'),
      tenantAligned: stage('agreement_uploaded'),
      highRisk: ren.filter(r => r.status.riskLevel === 'red' && r.status.currentStage !== 'renewal_completed' && r.status.currentStage !== 'renewal_failed').length,
      churnRisk: ren.filter(r => r.status.currentStage === 'renewal_failed').length,
      closed: stage('renewal_completed'),
    },
    reRenting: {
      moveOut: ren.filter(r => r.status.currentStage === 'renewal_failed').length,
      vacant: vacant.length,
      brokerAssigned: Math.round(vacant.length * 0.6),
      ownerSelfRent: Math.round(vacant.length * 0.2),
      lost: Math.round(vacant.length * 0.15),
    },
  };
}

export function getFollowUps(scope?: { city?: string; pm?: string }): FollowUp[] {
  const props = filterProps(scope);
  return props
    .filter(p => p.customerExperience.ownerRating < 4.2 || !p.financial.onTimeRent)
    .slice(0, 12)
    .map((p, i) => ({
      id: `fu-${p.basic.propertyId}`,
      with: p.basic.ownerName,
      topic: !p.financial.onTimeRent
        ? `Rent confirmation — ${p.basic.propertyName}`
        : `Service review — ${p.basic.propertyName}`,
      due: i % 3 === 0 ? 'Today' : i % 3 === 1 ? 'Tomorrow' : 'This week',
      agingDays: (i % 5),
      channel: (i % 3 === 0 ? 'call' : i % 3 === 1 ? 'message' : 'meet') as FollowUp['channel'],
    }));
}

// TL — PM performance matrix
export interface PMMatrixRow {
  pmId: string;
  name: string;
  city: string;
  portfolio: number;
  pendingTasks: number;
  escalations: number;
  slaPercent: number;
  renewalsPending: number;
  churnRisk: number;
  csat: number;
  overdueActions: number;
  load: 'overloaded' | 'normal' | 'light';
  performance: 'top' | 'mid' | 'underperforming';
}

export function getPMMatrix(city?: string): PMMatrixRow[] {
  const pms = (city ? allPMs.filter(p => p.city === city) : allPMs).slice(0, 30);
  return pms.map((pm, i) => {
    const portfolio = pm.portfolioSize;
    const pendingTasks = Math.max(2, Math.round((100 - pm.propertyScore) * 0.4) + (i % 5));
    const escalations = Math.max(0, Math.round((100 - pm.propertyScore) / 12));
    const slaPercent = Math.max(55, Math.min(98, Math.round(pm.propertyScore + (i % 7) - 3)));
    const renewalsPending = 3 + (i % 6);
    const churnRisk = Math.max(0, Math.round((100 - pm.propertyScore) / 18));
    const csat = Math.round((pm.propertyScore / 20) * 10) / 10;
    const overdueActions = Math.max(0, pendingTasks - 4);
    return {
      pmId: pm.id,
      name: pm.name,
      city: pm.city,
      portfolio,
      pendingTasks,
      escalations,
      slaPercent,
      renewalsPending,
      churnRisk,
      csat,
      overdueActions,
      load: (portfolio > 130 ? 'overloaded' : portfolio < 115 ? 'light' : 'normal') as PMMatrixRow['load'],
      performance: (pm.propertyScore >= 85 ? 'top'
        : pm.propertyScore < 65 ? 'underperforming'
        : 'mid') as PMMatrixRow['performance'],
    };
  });
}

// City + Leadership
export interface CityHealth {
  city: string;
  portfolio: number;
  occupancy: number;
  churn: number;
  renewalsPending: number;
  escalations: number;
  csat: number;
  slaPercent: number;
  pmCount: number;
  avgScore: number;
  vacantCount: number;
  highRiskCount: number;
}

export function getCityHealth(): CityHealth[] {
  return leaderCityStats.map(cs => {
    const props = allProperties.filter(p => p.basic.city === cs.city);
    const ren = allRenewals.filter(r => r.property.city === cs.city);
    const vacant = props.filter(p => p.basic.tenantStatus === 'vacant').length;
    const occupied = props.length - vacant;
    return {
      city: cs.city,
      portfolio: props.length,
      occupancy: props.length ? Math.round((occupied / props.length) * 100) : 0,
      churn: Math.max(2, Math.round((100 - cs.avgPropertyScore) / 6)),
      renewalsPending: ren.filter(r => r.status.currentStage !== 'renewal_completed' && r.status.currentStage !== 'renewal_failed').length,
      escalations: props.filter(p => p.riskLevel === 'high').length,
      csat: Math.round((cs.avgPropertyScore / 20) * 10) / 10,
      slaPercent: props.length
        ? Math.round(props.reduce((s, p) => s + p.operational.srSLAPercent, 0) / props.length)
        : 0,
      pmCount: cs.pmCount,
      avgScore: cs.avgPropertyScore,
      vacantCount: vacant,
      highRiskCount: props.filter(p => p.riskLevel === 'high').length,
    };
  });
}

export interface ChurnIntelligence {
  renewalChurn: {
    total: number;
    causes: { label: string; count: number }[];
  };
  reRentChurn: {
    total: number;
    causes: { label: string; count: number }[];
  };
  cityChurn: { city: string; rate: number }[];
}

export function getChurnIntelligence(): ChurnIntelligence {
  const failed = allRenewals.filter(r => r.status.currentStage === 'renewal_failed');
  const vacant = allProperties.filter(p => p.basic.tenantStatus === 'vacant');
  const cities = getCityHealth();
  return {
    renewalChurn: {
      total: failed.length,
      causes: [
        { label: 'Rent negotiation failed', count: Math.round(failed.length * 0.38) },
        { label: 'Owner non-aligned', count: Math.round(failed.length * 0.27) },
        { label: 'Affordability exit', count: Math.round(failed.length * 0.20) },
        { label: 'Delayed follow-up', count: Math.round(failed.length * 0.15) },
      ],
    },
    reRentChurn: {
      total: vacant.length,
      causes: [
        { label: 'Owner self-rented', count: Math.round(vacant.length * 0.30) },
        { label: 'Broker rented', count: Math.round(vacant.length * 0.28) },
        { label: 'Inventory lost', count: Math.round(vacant.length * 0.17) },
        { label: 'Vacant aging > 30d', count: Math.round(vacant.length * 0.25) },
      ],
    },
    cityChurn: cities.map(c => ({ city: c.city, rate: c.churn })).sort((a, b) => b.rate - a.rate),
  };
}

export function getCityRanking() {
  return getCityHealth()
    .map(c => ({
      city: c.city,
      retention: 100 - c.churn,
      sla: c.slaPercent,
      renewals: Math.max(0, 100 - Math.round((c.renewalsPending / Math.max(c.portfolio, 1)) * 100)),
      cx: Math.round(c.csat * 20),
      escalationRate: Math.round((c.escalations / Math.max(c.portfolio, 1)) * 100),
      churn: c.churn,
      avgScore: c.avgScore,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);
}

export const ACC_CITIES = leaderCityStats.map(c => c.city);
