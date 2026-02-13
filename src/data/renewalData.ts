import { 
  RenewalRecord, 
  RenewalStage, 
  RenewalFunnelStats,
  RenewalFilters,
  PMRenewalSummary,
  LeadershipRenewalStats,
  CityRenewalStats,
  RenewalAnalyticsStats,
  ActionLogEntry,
  calculateRiskLevel,
  calculateRenewalScoreImpact,
  calculateRenewalOpenDate,
  calculateLockDeadline,
  calculateEscalationStatus,
  calculateRenewalHealth,
  RENEWAL_STAGE_ORDER,
  RENEWAL_STAGE_LABELS
} from '@/types/renewal';
import { addDays, differenceInDays, format, subDays } from 'date-fns';

const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'];
const zones = ['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'];
const pmNames = [
  'Priya Sharma', 'Rahul Gupta', 'Anita Patel', 'Vikram Singh', 
  'Deepa Nair', 'Amit Kumar', 'Sneha Reddy', 'Karthik Menon',
  'Pooja Verma', 'Rajesh Iyer', 'Meera Joshi', 'Suresh Rao'
];

const propertyNames = [
  'Prestige Lakeside', 'Brigade Gateway', 'Sobha Dream Acres', 'Godrej United',
  'Embassy Springs', 'Mantri Serenity', 'Purva Westend', 'Salarpuria Sattva',
  'Phoenix One', 'DLF Pinnacle', 'Oberoi Realty', 'Lodha Altamount',
  'Hiranandani Gardens', 'Kalpataru Vista', 'Rustomjee Seasons', 'Shapoorji Pallonji'
];

const configurations = ['1BHK', '2BHK', '3BHK', '4BHK', 'Studio', '1RK'];
const noticePeriods = [30, 60, 90];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateActionLog(currentStage: RenewalStage, pmName: string): ActionLogEntry[] {
  const log: ActionLogEntry[] = [];
  const stageIndex = RENEWAL_STAGE_ORDER.indexOf(currentStage);
  const today = new Date();
  
  const actions: { stage: RenewalStage; action: string; source: 'PM' | 'Owner' | 'System' }[] = [
    { stage: 'renewal_not_started', action: 'Renewal opened automatically', source: 'System' },
    { stage: 'negotiation_in_progress', action: 'Started renewal discussion', source: 'PM' },
    { stage: 'proposal_sent', action: 'Sent renewal proposal to owner', source: 'PM' },
    { stage: 'owner_acknowledged', action: 'Owner acknowledged proposal', source: 'Owner' },
    { stage: 'agreement_uploaded', action: 'Renewal agreement uploaded', source: 'PM' },
    { stage: 'tcf_created', action: 'TCF created successfully', source: 'PM' },
    { stage: 'pms_renewed', action: 'PMS subscription renewed', source: 'PM' },
    { stage: 'renewal_completed', action: 'Renewal marked complete', source: 'System' },
  ];
  
  for (let i = 0; i <= stageIndex && i < actions.length; i++) {
    const daysAgo = (stageIndex - i) * getRandomInt(1, 3);
    log.push({
      id: `LOG${Date.now()}${i}`,
      action: actions[i].action,
      actionBy: actions[i].source === 'PM' ? pmName : actions[i].source === 'Owner' ? 'Property Owner' : 'System',
      source: actions[i].source,
      timestamp: format(subDays(today, daysAgo), 'yyyy-MM-dd HH:mm:ss'),
      stageFrom: i > 0 ? actions[i - 1].stage : undefined,
      stageTo: actions[i].stage,
    });
  }
  
  return log;
}

function generateRenewalRecord(index: number): RenewalRecord {
  const today = new Date();
  const daysToExpiry = getRandomInt(-5, 120);
  const leaseEndDate = addDays(today, daysToExpiry);
  const leaseStartDate = subDays(leaseEndDate, 365);
  
  const noticePeriod = getRandomElement(noticePeriods);
  const renewalOpenDate = calculateRenewalOpenDate(leaseEndDate, noticePeriod);
  const lockDeadline = calculateLockDeadline(leaseEndDate, noticePeriod);
  
  const pmIndex = index % pmNames.length;
  const pmName = pmNames[pmIndex];
  const pmId = `PM${String(pmIndex + 1).padStart(3, '0')}`;
  
  // Determine stage based on days to expiry
  let currentStage: RenewalStage;
  const rand = Math.random();
  
  if (daysToExpiry < 0) {
    currentStage = rand > 0.3 ? 'renewal_completed' : 'renewal_failed';
  } else if (daysToExpiry <= 15) {
    const stages: RenewalStage[] = ['pms_renewed', 'tcf_created', 'agreement_uploaded', 'renewal_completed', 'renewal_failed'];
    currentStage = getRandomElement(stages);
  } else if (daysToExpiry <= 30) {
    const stages: RenewalStage[] = ['agreement_uploaded', 'owner_acknowledged', 'tcf_created'];
    currentStage = getRandomElement(stages);
  } else if (daysToExpiry <= 45) {
    const stages: RenewalStage[] = ['negotiation_in_progress', 'proposal_sent', 'owner_acknowledged', 'renewal_not_started'];
    currentStage = getRandomElement(stages);
  } else {
    const stages: RenewalStage[] = ['renewal_not_started', 'negotiation_in_progress', 'proposal_sent'];
    currentStage = getRandomElement(stages);
  }
  
  const stageIndex = RENEWAL_STAGE_ORDER.indexOf(currentStage);
  const hasOwnerAck = stageIndex >= RENEWAL_STAGE_ORDER.indexOf('owner_acknowledged');
  const hasAgreementUploaded = stageIndex >= RENEWAL_STAGE_ORDER.indexOf('agreement_uploaded');
  
  const riskLevel = calculateRiskLevel(Math.max(0, daysToExpiry), currentStage, hasOwnerAck, noticePeriod);
  const scoreImpact = calculateRenewalScoreImpact(Math.max(0, daysToExpiry), currentStage, hasOwnerAck, noticePeriod);
  
  const currentRent = getRandomInt(15000, 80000);
  const proposedRent = currentRent + getRandomInt(1000, 5000);
  
  const ownerAckStatus = hasOwnerAck ? 'accepted' : 
    (currentStage === 'proposal_sent' ? 'pending' : 'pending');

  const stageEnteredAt = format(subDays(today, getRandomInt(1, 20)), 'yyyy-MM-dd');
  const escalationStatus = calculateEscalationStatus(Math.max(0, daysToExpiry), currentStage, stageEnteredAt, hasAgreementUploaded);
  const renewalHealth = calculateRenewalHealth(Math.max(0, daysToExpiry), currentStage, escalationStatus);
  
  return {
    id: `REN${String(index + 1).padStart(4, '0')}`,
    property: {
      propertyId: `PROP${String(index + 1).padStart(4, '0')}`,
      propertyName: `${getRandomElement(propertyNames)} - ${getRandomInt(101, 999)}`,
      city: getRandomElement(cities),
      zone: getRandomElement(zones),
      assignedPM: pmName,
      pmId: pmId,
      configuration: getRandomElement(configurations),
      maintenanceIncluded: Math.random() > 0.5,
    },
    lease: {
      leaseStartDate: format(leaseStartDate, 'yyyy-MM-dd'),
      leaseEndDate: format(leaseEndDate, 'yyyy-MM-dd'),
      daysToExpiry: Math.max(0, daysToExpiry),
      noticePeriod,
      renewalOpenDate: format(renewalOpenDate, 'yyyy-MM-dd'),
      lockDeadline: format(lockDeadline, 'yyyy-MM-dd'),
      currentRent,
      proposedRent,
      serviceFeePercent: getRandomInt(4, 8),
      pmsFee: Math.round(currentRent * 0.05),
    },
    status: {
      currentStage,
      riskLevel,
      lastActionDate: format(subDays(today, getRandomInt(1, 10)), 'yyyy-MM-dd'),
      nextActionDueDate: format(addDays(today, getRandomInt(1, 7)), 'yyyy-MM-dd'),
      stageHistory: generateStageHistory(currentStage, leaseEndDate, pmName),
      stageEnteredAt,
      escalationStatus,
      renewalHealth,
    },
    ownerAcknowledgement: {
      status: ownerAckStatus,
      timestamp: hasOwnerAck ? format(subDays(today, getRandomInt(5, 15)), 'yyyy-MM-dd HH:mm:ss') : undefined,
      method: hasOwnerAck ? (Math.random() > 0.5 ? 'app' : 'link') : undefined,
      otpVerified: hasOwnerAck,
      consentId: hasOwnerAck ? `CON${Date.now()}${index}` : undefined,
      sentDate: stageIndex >= 2 ? format(subDays(today, getRandomInt(10, 20)), 'yyyy-MM-dd') : undefined,
      viewedDate: stageIndex >= 2 ? format(subDays(today, getRandomInt(8, 15)), 'yyyy-MM-dd') : undefined,
      approvedDate: hasOwnerAck ? format(subDays(today, getRandomInt(5, 12)), 'yyyy-MM-dd') : undefined,
    },
    agreementUpload: {
      uploaded: hasAgreementUploaded,
      fileName: hasAgreementUploaded ? `renewal_agreement_${index + 1}.pdf` : undefined,
      uploadedAt: hasAgreementUploaded ? format(subDays(today, getRandomInt(1, 10)), 'yyyy-MM-dd HH:mm:ss') : undefined,
      effectiveLeaseStartDate: hasAgreementUploaded ? format(addDays(leaseEndDate, 1), 'yyyy-MM-dd') : undefined,
      leaseDurationMonths: hasAgreementUploaded ? getRandomElement([6, 11, 12, 24]) : undefined,
    },
    actionLog: generateActionLog(currentStage, pmName),
    alerts: generateAlerts(Math.max(0, daysToExpiry), currentStage, riskLevel, noticePeriod),
    scoreImpact,
    createdAt: format(subDays(leaseEndDate, noticePeriod + 30), 'yyyy-MM-dd'),
    updatedAt: format(today, 'yyyy-MM-dd'),
  };
}

function generateStageHistory(currentStage: RenewalStage, leaseEndDate: Date, pmName: string) {
  const history = [];
  const stageIndex = RENEWAL_STAGE_ORDER.indexOf(currentStage);
  const today = new Date();
  
  for (let i = 0; i <= stageIndex && i < RENEWAL_STAGE_ORDER.length; i++) {
    const stage = RENEWAL_STAGE_ORDER[i];
    const daysAgo = (stageIndex - i) * getRandomInt(2, 5);
    history.push({
      stage,
      enteredAt: format(subDays(today, daysAgo + getRandomInt(1, 3)), 'yyyy-MM-dd HH:mm:ss'),
      completedAt: i < stageIndex ? format(subDays(today, daysAgo), 'yyyy-MM-dd HH:mm:ss') : undefined,
      actionBy: pmName,
    });
  }
  
  return history;
}

function generateAlerts(daysToExpiry: number, stage: RenewalStage, riskLevel: string, noticePeriod: number) {
  const alerts = [];
  const today = new Date();
  
  // Automated reminder alerts based on days to expiry
  if (daysToExpiry <= 90 && daysToExpiry > 60 && stage === 'renewal_not_started') {
    alerts.push({
      id: `ALT${Date.now()}90`,
      type: 'reminder' as const,
      message: `Renewal auto-opened. ${daysToExpiry} days to lease expiry.`,
      dueDate: format(addDays(today, daysToExpiry), 'yyyy-MM-dd'),
      isRead: true,
      createdAt: format(today, 'yyyy-MM-dd'),
      reminderDays: 90,
    });
  }

  if (daysToExpiry <= 60 && daysToExpiry > 45) {
    alerts.push({
      id: `ALT${Date.now()}60`,
      type: 'reminder' as const,
      message: `Reminder: ${daysToExpiry} days to lease expiry. Please progress renewal.`,
      dueDate: format(addDays(today, daysToExpiry), 'yyyy-MM-dd'),
      isRead: false,
      createdAt: format(today, 'yyyy-MM-dd'),
      reminderDays: 60,
    });
  }

  if (daysToExpiry <= 45 && daysToExpiry > 30) {
    alerts.push({
      id: `ALT${Date.now()}45`,
      type: 'warning' as const,
      message: `Reminder to PM + TL: ${daysToExpiry} days left. Renewal needs attention.`,
      dueDate: format(addDays(today, daysToExpiry), 'yyyy-MM-dd'),
      isRead: false,
      createdAt: format(today, 'yyyy-MM-dd'),
      reminderDays: 45,
    });
  }

  if (daysToExpiry <= 30 && daysToExpiry > 15 && stage !== 'renewal_completed') {
    alerts.push({
      id: `ALT${Date.now()}30`,
      type: 'escalation' as const,
      message: `Escalation: ${daysToExpiry} days remaining. Renewal flagged for escalation.`,
      dueDate: format(addDays(today, daysToExpiry), 'yyyy-MM-dd'),
      isRead: false,
      createdAt: format(today, 'yyyy-MM-dd'),
      reminderDays: 30,
    });
  }
  
  if (daysToExpiry <= 15 && stage !== 'renewal_completed' && stage !== 'pms_renewed') {
    alerts.push({
      id: `ALT${Date.now()}15`,
      type: 'critical' as const,
      message: `Critical: Only ${daysToExpiry} days remaining. Complete renewal immediately.`,
      dueDate: format(addDays(today, daysToExpiry), 'yyyy-MM-dd'),
      isRead: false,
      createdAt: format(today, 'yyyy-MM-dd'),
      reminderDays: 15,
    });
  }
  
  return alerts;
}

// Generate 150 renewal records
export const allRenewals: RenewalRecord[] = Array.from({ length: 150 }, (_, i) => generateRenewalRecord(i));

// Filter renewals
export function filterRenewals(renewals: RenewalRecord[], filters: RenewalFilters): RenewalRecord[] {
  return renewals.filter(renewal => {
    if (filters.city && renewal.property.city !== filters.city) return false;
    if (filters.zone && renewal.property.zone !== filters.zone) return false;
    if (filters.pmId && renewal.property.pmId !== filters.pmId) return false;
    if (filters.riskLevel && renewal.status.riskLevel !== filters.riskLevel) return false;
    if (filters.stage && renewal.status.currentStage !== filters.stage) return false;
    if (filters.noticePeriod && renewal.lease.noticePeriod !== filters.noticePeriod) return false;
    
    if (filters.expiryBucket && filters.expiryBucket !== 'all') {
      const days = renewal.lease.daysToExpiry;
      switch (filters.expiryBucket) {
        case 'critical': if (days > 15) return false; break;
        case 'urgent': if (days <= 15 || days > 30) return false; break;
        case 'upcoming': if (days <= 30 || days > 45) return false; break;
        case 'safe': if (days <= 45) return false; break;
      }
    }
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        renewal.property.propertyName.toLowerCase().includes(query) ||
        renewal.property.propertyId.toLowerCase().includes(query) ||
        renewal.property.assignedPM.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
}

// Calculate funnel stats
export function calculateFunnelStats(renewals: RenewalRecord[]): RenewalFunnelStats {
  const stats: RenewalFunnelStats = {
    total: renewals.length,
    byStage: {} as Record<RenewalStage, number>,
    byRisk: { green: 0, amber: 0, red: 0 },
    byExpiryBucket: { critical: 0, urgent: 0, upcoming: 0, safe: 0 },
    conversionRate: 0,
    avgDaysLeft: 0,
  };
  
  RENEWAL_STAGE_ORDER.forEach(stage => {
    stats.byStage[stage] = 0;
  });
  stats.byStage['renewal_failed'] = 0;
  
  let completed = 0;
  let failed = 0;
  let totalDays = 0;
  
  renewals.forEach(renewal => {
    stats.byStage[renewal.status.currentStage]++;
    stats.byRisk[renewal.status.riskLevel]++;
    totalDays += renewal.lease.daysToExpiry;
    
    const days = renewal.lease.daysToExpiry;
    if (days <= 15) stats.byExpiryBucket.critical++;
    else if (days <= 30) stats.byExpiryBucket.urgent++;
    else if (days <= 45) stats.byExpiryBucket.upcoming++;
    else stats.byExpiryBucket.safe++;
    
    if (renewal.status.currentStage === 'renewal_completed') completed++;
    if (renewal.status.currentStage === 'renewal_failed') failed++;
  });
  
  const totalClosed = completed + failed;
  stats.conversionRate = totalClosed > 0 ? Math.round((completed / totalClosed) * 100) : 0;
  stats.avgDaysLeft = renewals.length > 0 ? Math.round(totalDays / renewals.length) : 0;
  
  return stats;
}

// Get PM renewal summaries
export function getPMRenewalSummaries(renewals: RenewalRecord[]): PMRenewalSummary[] {
  const pmMap = new Map<string, PMRenewalSummary>();
  
  renewals.forEach(renewal => {
    const { pmId, assignedPM } = renewal.property;
    
    if (!pmMap.has(pmId)) {
      pmMap.set(pmId, {
        pmId,
        pmName: assignedPM,
        totalRenewals: 0,
        greenCount: 0,
        amberCount: 0,
        redCount: 0,
        completedCount: 0,
        failedCount: 0,
        avgDaysToAction: 0,
        interventionRequired: false,
      });
    }
    
    const pm = pmMap.get(pmId)!;
    pm.totalRenewals++;
    
    switch (renewal.status.riskLevel) {
      case 'green': pm.greenCount++; break;
      case 'amber': pm.amberCount++; break;
      case 'red': pm.redCount++; break;
    }
    
    if (renewal.status.currentStage === 'renewal_completed') pm.completedCount++;
    if (renewal.status.currentStage === 'renewal_failed') pm.failedCount++;
  });
  
  pmMap.forEach(pm => {
    pm.avgDaysToAction = Math.round(Math.random() * 5 + 2);
    pm.interventionRequired = pm.redCount >= 2 || (pm.redCount + pm.amberCount) / pm.totalRenewals > 0.4;
  });
  
  return Array.from(pmMap.values()).sort((a, b) => b.redCount - a.redCount);
}

// Get leadership stats
export function getLeadershipStats(renewals: RenewalRecord[]): LeadershipRenewalStats {
  const cityMap = new Map<string, CityRenewalStats>();
  
  let totalCompleted = 0;
  let totalFailed = 0;
  
  renewals.forEach(renewal => {
    const { city } = renewal.property;
    
    if (!cityMap.has(city)) {
      cityMap.set(city, {
        city,
        totalRenewals: 0,
        completedCount: 0,
        failedCount: 0,
        renewalRate: 0,
        churnDueToRenewal: 0,
        redCases: 0,
      });
    }
    
    const stats = cityMap.get(city)!;
    stats.totalRenewals++;
    
    if (renewal.status.currentStage === 'renewal_completed') {
      stats.completedCount++;
      totalCompleted++;
    }
    if (renewal.status.currentStage === 'renewal_failed') {
      stats.failedCount++;
      totalFailed++;
    }
    if (renewal.status.riskLevel === 'red') {
      stats.redCases++;
    }
  });
  
  cityMap.forEach(stats => {
    const closed = stats.completedCount + stats.failedCount;
    stats.renewalRate = closed > 0 ? Math.round((stats.completedCount / closed) * 100) : 0;
    stats.churnDueToRenewal = stats.failedCount;
  });
  
  const totalClosed = totalCompleted + totalFailed;
  
  return {
    panIndiaRenewalRate: totalClosed > 0 ? Math.round((totalCompleted / totalClosed) * 100) : 0,
    totalActiveRenewals: renewals.filter(r => 
      r.status.currentStage !== 'renewal_completed' && 
      r.status.currentStage !== 'renewal_failed'
    ).length,
    totalCompleted,
    totalFailed,
    churnRate: totalClosed > 0 ? Math.round((totalFailed / totalClosed) * 100) : 0,
    cityStats: Array.from(cityMap.values()).sort((a, b) => b.totalRenewals - a.totalRenewals),
    monthlyTrend: [
      { month: 'Aug 2024', rate: 78 },
      { month: 'Sep 2024', rate: 81 },
      { month: 'Oct 2024', rate: 79 },
      { month: 'Nov 2024', rate: 83 },
      { month: 'Dec 2024', rate: 85 },
      { month: 'Jan 2025', rate: 87 },
    ],
  };
}

// Get action items for a PM
export function getPMActionItems(renewals: RenewalRecord[], pmId: string) {
  const pmRenewals = renewals.filter(r => r.property.pmId === pmId);
  
  return {
    needsActionToday: pmRenewals.filter(r => 
      r.status.riskLevel !== 'green' && 
      r.status.currentStage !== 'renewal_completed' &&
      r.status.currentStage !== 'renewal_failed'
    ).slice(0, 5),
    critical: pmRenewals.filter(r => r.lease.daysToExpiry <= 15 && r.status.currentStage !== 'renewal_completed'),
    urgent: pmRenewals.filter(r => r.lease.daysToExpiry > 15 && r.lease.daysToExpiry <= 30),
    upcoming: pmRenewals.filter(r => r.lease.daysToExpiry > 30 && r.lease.daysToExpiry <= 45),
  };
}

// Get analytics stats
export function getAnalyticsStats(renewals: RenewalRecord[], filters?: { month?: string; city?: string; pmId?: string }): RenewalAnalyticsStats {
  let filtered = renewals;
  if (filters?.city) filtered = filtered.filter(r => r.property.city === filters.city);
  if (filters?.pmId) filtered = filtered.filter(r => r.property.pmId === filters.pmId);

  const total = filtered.length;
  const completed = filtered.filter(r => r.status.currentStage === 'renewal_completed').length;
  const failed = filtered.filter(r => r.status.currentStage === 'renewal_failed').length;
  const eligible = total; // exclude force-terminated for real calc
  const renewalPercent = eligible > 0 ? Math.round((completed / eligible) * 100) : 0;

  // On-time: completed renewals that were done with >15 days left (simulated)
  const onTimeCount = Math.round(completed * 0.72);
  const onTimeRenewalPercent = completed > 0 ? Math.round((onTimeCount / completed) * 100) : 0;

  const avgDaysToClose = completed > 0 ? getRandomInt(18, 45) : 0;
  const renewalsInRiskZone = filtered.filter(r => r.status.riskLevel === 'red' || r.status.riskLevel === 'amber').length;
  const failedRenewalsPercent = total > 0 ? Math.round((failed / total) * 100) : 0;

  // Stage distribution
  const stageDistribution = RENEWAL_STAGE_ORDER.map(stage => ({
    stage: RENEWAL_STAGE_LABELS[stage].replace('Renewal ', '').replace(' (Move-out)', ''),
    count: filtered.filter(r => r.status.currentStage === stage).length,
  }));
  stageDistribution.push({
    stage: 'Failed',
    count: filtered.filter(r => r.status.currentStage === 'renewal_failed').length,
  });

  // Monthly renewal %
  const monthlyRenewalPercent = [
    { month: 'Sep 2024', percent: 72 },
    { month: 'Oct 2024', percent: 75 },
    { month: 'Nov 2024', percent: 78 },
    { month: 'Dec 2024', percent: 80 },
    { month: 'Jan 2025', percent: 83 },
    { month: 'Feb 2025', percent: renewalPercent || 85 },
  ];

  // PM-wise renewal %
  const pmMap = new Map<string, { name: string; total: number; completed: number }>();
  filtered.forEach(r => {
    if (!pmMap.has(r.property.pmId)) {
      pmMap.set(r.property.pmId, { name: r.property.assignedPM, total: 0, completed: 0 });
    }
    const pm = pmMap.get(r.property.pmId)!;
    pm.total++;
    if (r.status.currentStage === 'renewal_completed') pm.completed++;
  });

  const pmWiseRenewalPercent = Array.from(pmMap.entries()).map(([, pm]) => ({
    pmName: pm.name,
    total: pm.total,
    completed: pm.completed,
    percent: pm.total > 0 ? Math.round((pm.completed / pm.total) * 100) : 0,
  })).sort((a, b) => b.percent - a.percent);

  return {
    totalRenewalsDue: total,
    renewalPercent,
    onTimeRenewalPercent,
    avgDaysToClose,
    renewalsInRiskZone,
    failedRenewalsPercent,
    stageDistribution,
    monthlyRenewalPercent,
    pmWiseRenewalPercent,
  };
}

function getRandomIntLocal(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
