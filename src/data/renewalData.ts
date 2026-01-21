import { 
  RenewalRecord, 
  RenewalStage, 
  RenewalFunnelStats,
  RenewalFilters,
  PMRenewalSummary,
  LeadershipRenewalStats,
  CityRenewalStats,
  calculateRiskLevel,
  calculateScoreImpact,
  RENEWAL_STAGE_ORDER
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

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRenewalRecord(index: number): RenewalRecord {
  const today = new Date();
  const daysToExpiry = getRandomInt(-5, 90); // Some already expired
  const leaseEndDate = addDays(today, daysToExpiry);
  const leaseStartDate = subDays(leaseEndDate, 365);
  
  const pmIndex = index % pmNames.length;
  const pmName = pmNames[pmIndex];
  const pmId = `PM${String(pmIndex + 1).padStart(3, '0')}`;
  
  // Determine stage based on days to expiry
  let currentStage: RenewalStage;
  const rand = Math.random();
  
  if (daysToExpiry < 0) {
    currentStage = rand > 0.3 ? 'renewal_completed' : 'renewal_failed';
  } else if (daysToExpiry <= 15) {
    const stages: RenewalStage[] = ['pms_renewed', 'tcf_completed', 'agreement_signed', 'renewal_completed', 'renewal_failed'];
    currentStage = getRandomElement(stages);
  } else if (daysToExpiry <= 30) {
    const stages: RenewalStage[] = ['agreement_sent', 'agreement_signed', 'owner_acknowledgement_pending', 'negotiation_in_progress'];
    currentStage = getRandomElement(stages);
  } else if (daysToExpiry <= 45) {
    const stages: RenewalStage[] = ['renewal_initiated', 'negotiation_in_progress', 'owner_acknowledgement_pending', 'not_started'];
    currentStage = getRandomElement(stages);
  } else {
    const stages: RenewalStage[] = ['not_started', 'renewal_initiated', 'negotiation_in_progress'];
    currentStage = getRandomElement(stages);
  }
  
  const hasOwnerAck = RENEWAL_STAGE_ORDER.indexOf(currentStage) >= RENEWAL_STAGE_ORDER.indexOf('agreement_sent');
  const riskLevel = calculateRiskLevel(daysToExpiry, currentStage, hasOwnerAck);
  const scoreImpact = calculateScoreImpact(daysToExpiry, currentStage, riskLevel);
  
  const currentRent = getRandomInt(15000, 80000);
  const proposedRent = currentRent + getRandomInt(1000, 5000);
  
  const ownerAckStatus = hasOwnerAck ? 'accepted' : 
    (currentStage === 'owner_acknowledgement_pending' ? 'pending' : 'pending');
  
  return {
    id: `REN${String(index + 1).padStart(4, '0')}`,
    property: {
      propertyId: `PROP${String(index + 1).padStart(4, '0')}`,
      propertyName: `${getRandomElement(propertyNames)} - ${getRandomInt(101, 999)}`,
      city: getRandomElement(cities),
      zone: getRandomElement(zones),
      assignedPM: pmName,
      pmId: pmId,
    },
    lease: {
      leaseStartDate: format(leaseStartDate, 'yyyy-MM-dd'),
      leaseEndDate: format(leaseEndDate, 'yyyy-MM-dd'),
      daysToExpiry: Math.max(0, daysToExpiry),
      currentRent,
      proposedRent,
      pmsFee: Math.round(currentRent * 0.05),
    },
    status: {
      currentStage,
      riskLevel,
      lastActionDate: format(subDays(today, getRandomInt(1, 10)), 'yyyy-MM-dd'),
      nextActionDueDate: format(addDays(today, getRandomInt(1, 7)), 'yyyy-MM-dd'),
      stageHistory: generateStageHistory(currentStage, leaseEndDate),
    },
    ownerAcknowledgement: {
      status: ownerAckStatus,
      timestamp: hasOwnerAck ? format(subDays(today, getRandomInt(5, 15)), 'yyyy-MM-dd HH:mm:ss') : undefined,
      method: hasOwnerAck ? (Math.random() > 0.5 ? 'app' : 'link') : undefined,
      otpVerified: hasOwnerAck,
      consentId: hasOwnerAck ? `CON${Date.now()}${index}` : undefined,
    },
    alerts: generateAlerts(daysToExpiry, currentStage, riskLevel),
    scoreImpact,
    createdAt: format(subDays(leaseEndDate, 60), 'yyyy-MM-dd'),
    updatedAt: format(today, 'yyyy-MM-dd'),
  };
}

function generateStageHistory(currentStage: RenewalStage, leaseEndDate: Date) {
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
      actionBy: getRandomElement(pmNames),
    });
  }
  
  return history;
}

function generateAlerts(daysToExpiry: number, stage: RenewalStage, riskLevel: string) {
  const alerts = [];
  const today = new Date();
  
  if (daysToExpiry <= 15 && stage !== 'renewal_completed' && stage !== 'pms_renewed') {
    alerts.push({
      id: `ALT${Date.now()}1`,
      type: 'critical' as const,
      message: 'Red-risk escalation: Renewal not locked with 15 days remaining',
      dueDate: format(addDays(today, daysToExpiry), 'yyyy-MM-dd'),
      isRead: false,
      createdAt: format(today, 'yyyy-MM-dd'),
    });
  }
  
  if (daysToExpiry <= 30 && stage === 'not_started') {
    alerts.push({
      id: `ALT${Date.now()}2`,
      type: 'escalation' as const,
      message: 'Escalation: Renewal not started with 30 days remaining',
      dueDate: format(addDays(today, daysToExpiry), 'yyyy-MM-dd'),
      isRead: false,
      createdAt: format(today, 'yyyy-MM-dd'),
    });
  }
  
  if (daysToExpiry <= 45 && daysToExpiry > 30 && stage === 'not_started') {
    alerts.push({
      id: `ALT${Date.now()}3`,
      type: 'warning' as const,
      message: 'Start renewal process - 45 days to expiry',
      dueDate: format(addDays(today, daysToExpiry - 45), 'yyyy-MM-dd'),
      isRead: true,
      createdAt: format(subDays(today, 5), 'yyyy-MM-dd'),
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
  };
  
  // Initialize stage counts
  RENEWAL_STAGE_ORDER.forEach(stage => {
    stats.byStage[stage] = 0;
  });
  stats.byStage['renewal_failed'] = 0;
  
  let completed = 0;
  let failed = 0;
  
  renewals.forEach(renewal => {
    stats.byStage[renewal.status.currentStage]++;
    stats.byRisk[renewal.status.riskLevel]++;
    
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
  
  // Calculate intervention required
  pmMap.forEach(pm => {
    pm.avgDaysToAction = Math.round(Math.random() * 5 + 2); // Mock
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
  
  // Calculate rates
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
