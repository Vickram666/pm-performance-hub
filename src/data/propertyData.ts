import { Property, PropertyAggregates, RiskLevel, PropertyNote, PMPropertySummary, CityPropertyStats, PropertyAnalyticsStats } from '@/types/property';

const propertyNames = [
  'Prestige Ozone', 'Brigade Gateway', 'Embassy Lake Terraces', 'Sobha Dream Acres',
  'Godrej Woodsman', 'DLF Pinnacle', 'Lodha Bellissimo', 'Hiranandani Gardens',
  'Phoenix One', 'Kalpataru Heights', 'Oberoi Realty', 'Lodha Altamount',
  'Raheja Vivarea', 'Indiabulls Sky', 'Piramal Aranya', 'Lodha Trump Tower',
  'Rustomjee Paramount', 'Omkar 1973', 'Sunteck City', 'Lodha Park',
];

const ownerNames = [
  'Ramesh Agarwal', 'Sunita Reddy', 'Vikash Gupta', 'Priya Menon', 'Anil Kumar',
  'Deepa Sharma', 'Rajiv Nair', 'Kavitha Iyer', 'Suresh Patel', 'Lakshmi Rao',
  'Manoj Singh', 'Ritu Kapoor', 'Sanjay Desai', 'Anita Joshi', 'Prakash Mehta',
  'Sneha Verma', 'Vinod Chopra', 'Meena Bhatia', 'Ashok Malhotra', 'Geeta Saxena',
];



function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomBoolean(probability = 0.7): boolean {
  return Math.random() < probability;
}

function getRandomRating(): number {
  return Math.round((Math.random() * 2 + 3) * 10) / 10; // 3.0 to 5.0
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function calculatePropertyScore(property: Omit<Property, 'healthScore' | 'riskLevel' | 'issues' | 'scoreBreakdown'>): {
  scoreBreakdown: Property['scoreBreakdown'];
  healthScore: number;
  riskLevel: RiskLevel;
  issues: Property['issues'];
} {
  const issues: Property['issues'] = [];
  
  // Operations Score (max 40)
  let operationsScore = 0;
  
  // SR SLA (max 10)
  const srScore = Math.round(property.operational.srSLAPercent / 10);
  operationsScore += srScore;
  if (property.operational.srSLAPercent < 80) {
    issues.push({
      id: `issue-sr-${property.basic.propertyId}`,
      category: 'operations',
      issue: `SR SLA at ${property.operational.srSLAPercent}% (Target: 80%+)`,
      impact: 10 - srScore,
      actionRequired: 'Close pending service requests within SLA',
      recoveryPoints: 10 - srScore,
    });
  }
  
  // Move-in report (max 10)
  if (property.operational.moveInReportCompleted) {
    operationsScore += 10;
  } else if (property.basic.tenantStatus === 'occupied') {
    issues.push({
      id: `issue-movein-${property.basic.propertyId}`,
      category: 'operations',
      issue: 'Move-in report not completed',
      impact: 10,
      actionRequired: 'Complete move-in documentation with photos',
      recoveryPoints: 10,
    });
  }
  
  // Move-out report (max 10)
  if (property.operational.moveOutReportCompleted || property.basic.tenantStatus === 'occupied') {
    operationsScore += property.operational.moveOutReportCompleted ? 10 : 5;
  }
  
  // Inspection (max 5)
  if (property.operational.inspectionStatus === 'completed') {
    operationsScore += 5;
  } else {
    issues.push({
      id: `issue-inspection-${property.basic.propertyId}`,
      category: 'operations',
      issue: 'Inspection report pending',
      impact: 5,
      actionRequired: 'Complete quarterly inspection',
      recoveryPoints: 5,
    });
  }
  
  // Utility (max 5)
  if (property.operational.utilitySetupCompleted && !property.operational.utilityBillIssues) {
    operationsScore += 5;
  } else if (property.operational.utilityBillIssues) {
    issues.push({
      id: `issue-utility-${property.basic.propertyId}`,
      category: 'operations',
      issue: 'Utility bill issues detected',
      impact: 3,
      actionRequired: 'Resolve utility billing discrepancies',
      recoveryPoints: 3,
    });
  }
  
  // Financial Score (max 15, can go negative)
  let financialScore = 0;
  
  // Rent on-time (max 10)
  if (property.financial.onTimeRent) {
    financialScore += 10;
  } else {
    const lateDays = property.financial.lateDays;
    if (lateDays <= 5) {
      financialScore += 8; // Grace period
    } else if (lateDays <= 15) {
      financialScore -= 5; // Penalty
      issues.push({
        id: `issue-rent-${property.basic.propertyId}`,
        category: 'financial',
        issue: `Rent ${lateDays} days late`,
        impact: 15,
        actionRequired: 'Follow up with tenant for rent payment',
        recoveryPoints: 0, // Cannot recover past late rent
      });
    } else {
      financialScore -= 10;
      issues.push({
        id: `issue-rent-severe-${property.basic.propertyId}`,
        category: 'financial',
        issue: `Rent critically late (${lateDays} days)`,
        impact: 20,
        actionRequired: 'Escalate to collections/legal',
        recoveryPoints: 0,
      });
    }
  }
  
  // Utility bill closure (max 5)
  if (property.financial.utilityBillClosure) {
    financialScore += 5;
  }
  
  // Customer Experience Score (max 25)
  let cxScore = 0;
  
  // Tenant rating (max 5)
  const tenantRatingScore = Math.round(property.customerExperience.tenantRating);
  cxScore += tenantRatingScore;
  if (property.customerExperience.tenantRating < 4) {
    issues.push({
      id: `issue-tenant-rating-${property.basic.propertyId}`,
      category: 'customer',
      issue: `Low tenant rating: ${property.customerExperience.tenantRating}`,
      impact: 5 - tenantRatingScore,
      actionRequired: 'Schedule tenant feedback call',
      recoveryPoints: 5 - tenantRatingScore,
    });
  }
  
  // Owner rating (max 5)
  const ownerRatingScore = Math.round(property.customerExperience.ownerRating);
  cxScore += ownerRatingScore;
  if (property.customerExperience.ownerRating < 4) {
    issues.push({
      id: `issue-owner-rating-${property.basic.propertyId}`,
      category: 'customer',
      issue: `Low owner rating: ${property.customerExperience.ownerRating}`,
      impact: 5 - ownerRatingScore,
      actionRequired: 'Schedule owner relationship call',
      recoveryPoints: 5 - ownerRatingScore,
    });
  }
  
  // Renewal initiation (max 5) - if within 90 days
  if (property.retention.daysToLeaseEnd <= 90) {
    if (property.retention.renewalInitiated) {
      cxScore += 5;
    } else {
      issues.push({
        id: `issue-renewal-${property.basic.propertyId}`,
        category: 'customer',
        issue: `Renewal not initiated (${property.retention.daysToLeaseEnd} days to lease end)`,
        impact: 5,
        actionRequired: 'Initiate renewal conversation with tenant',
        recoveryPoints: 5,
      });
    }
  } else {
    cxScore += 5;
  }
  
  // Renewal completion (max 10)
  if (property.retention.renewalCompleted) {
    cxScore += 10;
  } else if (property.retention.daysToLeaseEnd <= 30 && property.retention.renewalInitiated) {
    cxScore += 5; // Partial
  }
  
  // Ecosystem Score (max 20)
  let ecosystemScore = 0;
  
  if (property.ecosystem.ownerAppInstalled) {
    ecosystemScore += 5;
  } else {
    issues.push({
      id: `issue-app-${property.basic.propertyId}`,
      category: 'ecosystem',
      issue: 'Owner app not installed',
      impact: 5,
      actionRequired: 'Help owner download and setup the app',
      recoveryPoints: 5,
    });
  }
  
  if (property.ecosystem.insuranceActive) {
    ecosystemScore += 5;
  }
  
  if (property.ecosystem.leaseAgreementUploaded) {
    ecosystemScore += 10;
  } else {
    issues.push({
      id: `issue-lease-${property.basic.propertyId}`,
      category: 'ecosystem',
      issue: 'Lease agreement not uploaded',
      impact: 10,
      actionRequired: 'Upload signed lease agreement to system',
      recoveryPoints: 10,
    });
  }
  
  const total = Math.max(0, Math.min(100, operationsScore + financialScore + cxScore + ecosystemScore));
  
  let riskLevel: RiskLevel;
  if (total >= 70) {
    riskLevel = 'low';
  } else if (total >= 50) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'high';
  }
  
  return {
    scoreBreakdown: {
      operations: Math.max(0, Math.min(40, operationsScore)),
      financial: Math.max(-10, Math.min(15, financialScore)),
      customerExperience: Math.max(0, Math.min(25, cxScore)),
      ecosystem: Math.max(0, Math.min(20, ecosystemScore)),
      total,
    },
    healthScore: total,
    riskLevel,
    issues,
  };
}

const noteTexts = [
  'Spoke with owner regarding maintenance concerns',
  'Tenant requested AC repair - SR created',
  'Rent reminder sent to tenant',
  'Owner acknowledged renewal terms',
  'Inspection scheduled for next week',
  'Utility bill discrepancy resolved',
  'Follow-up call with tenant completed',
  'Owner app installation guided over call',
  'Lease document uploaded after verification',
  'Escalated to TL - owner unresponsive',
];

const noteTypes: PropertyNote['type'][] = ['general', 'escalation', 'follow-up', 'resolution'];

const pmNames = [
  'Priya Sharma', 'Rahul Patel', 'Ananya Singh', 'Vikram Kumar', 'Sneha Reddy',
  'Arjun Nair', 'Kavya Iyer', 'Ravi Rao', 'Meera Gupta', 'Aditya Joshi',
];

const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune'];

function generateNotes(propertyId: string): PropertyNote[] {
  const hasNotes = getRandomBoolean(0.65);
  if (!hasNotes) return [];
  const count = Math.floor(Math.random() * 3) + 1;
  const now = new Date();
  return Array.from({ length: count }, (_, i) => ({
    id: `note-${propertyId}-${i}`,
    text: getRandomElement(noteTexts),
    createdBy: getRandomElement(pmNames),
    createdAt: formatDate(addDays(now, -Math.floor(Math.random() * 30))),
    type: getRandomElement(noteTypes),
  }));
}

function generateProperty(index: number): Property {
  const now = new Date();
  const rentDueDate = new Date(now.getFullYear(), now.getMonth(), 5);
  const isLateRent = getRandomBoolean(0.25);
  const lateDays = isLateRent ? Math.floor(Math.random() * 20) + 1 : 0;
  const rentPaidDate = isLateRent 
    ? formatDate(addDays(rentDueDate, lateDays))
    : formatDate(addDays(rentDueDate, Math.floor(Math.random() * 3) - 1));
  
  const daysToLeaseEnd = Math.floor(Math.random() * 180) - 30;
  const leaseEndDate = formatDate(addDays(now, daysToLeaseEnd));
  
  const tenantStatus = getRandomBoolean(0.92) ? 'occupied' : 'vacant';
  const propertyId = `P${String(index + 1).padStart(3, '0')}`;
  const city = getRandomElement(cities);
  
  const propertyWithoutScores = {
    basic: {
      propertyId,
      propertyName: `${getRandomElement(propertyNames)} ${Math.floor(Math.random() * 20) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
      city,
      ownerName: getRandomElement(ownerNames),
      tenantStatus: tenantStatus as 'occupied' | 'vacant',
    },
    operational: {
      totalSRs: Math.floor(Math.random() * 10) + 1,
      srClosedWithinSLA: 0,
      srSLAPercent: Math.floor(Math.random() * 30) + 70,
      moveInReportCompleted: getRandomBoolean(0.85),
      moveOutReportCompleted: getRandomBoolean(0.8),
      inspectionStatus: getRandomBoolean(0.75) ? 'completed' : 'pending' as 'completed' | 'pending',
      utilitySetupCompleted: getRandomBoolean(0.9),
      utilityBillIssues: getRandomBoolean(0.15),
    },
    financial: {
      rentDueDate: formatDate(rentDueDate),
      rentPaidDate: tenantStatus === 'occupied' ? rentPaidDate : null,
      onTimeRent: tenantStatus === 'occupied' ? !isLateRent : true,
      lateDays: tenantStatus === 'occupied' ? lateDays : 0,
      utilityBillClosure: getRandomBoolean(0.85),
    },
    customerExperience: {
      tenantRating: tenantStatus === 'occupied' ? getRandomRating() : 5,
      ownerRating: getRandomRating(),
    },
    retention: {
      leaseEndDate,
      renewalInitiated: daysToLeaseEnd <= 90 ? getRandomBoolean(0.7) : false,
      renewalCompleted: daysToLeaseEnd <= 30 ? getRandomBoolean(0.5) : false,
      daysToLeaseEnd: Math.max(0, daysToLeaseEnd),
    },
    ecosystem: {
      ownerAppInstalled: getRandomBoolean(0.75),
      insuranceActive: getRandomBoolean(0.6),
      leaseAgreementUploaded: getRandomBoolean(0.85),
    },
    notes: generateNotes(propertyId),
  };
  
  propertyWithoutScores.operational.srClosedWithinSLA = Math.floor(
    propertyWithoutScores.operational.totalSRs * propertyWithoutScores.operational.srSLAPercent / 100
  );
  
  const scores = calculatePropertyScore(propertyWithoutScores);
  
  return {
    ...propertyWithoutScores,
    ...scores,
  };
}

// Generate 127 properties
export const allProperties: Property[] = Array.from({ length: 127 }, (_, i) => generateProperty(i));

export function getPropertyAggregates(properties: Property[]): PropertyAggregates {
  const now = new Date();
  return {
    avgPropertyScore: properties.length > 0 
      ? Math.round(properties.reduce((sum, p) => sum + p.healthScore, 0) / properties.length * 10) / 10 
      : 0,
    highRiskCount: properties.filter(p => p.riskLevel === 'high').length,
    renewalDueCount: properties.filter(p => p.retention.daysToLeaseEnd <= 60 && !p.retention.renewalCompleted).length,
    lateRentCount: properties.filter(p => !p.financial.onTimeRent && p.financial.lateDays > 5).length,
    totalProperties: properties.length,
  };
}

export function filterProperties(
  properties: Property[],
  filters: {
    scoreRange?: [number, number];
    lateRentOnly?: boolean;
    renewalDueDays?: number | null;
    lowOwnerRating?: boolean;
    searchQuery?: string;
  }
): Property[] {
  return properties.filter(property => {
    // Score range filter
    if (filters.scoreRange) {
      if (property.healthScore < filters.scoreRange[0] || property.healthScore > filters.scoreRange[1]) {
        return false;
      }
    }
    
    // Late rent filter
    if (filters.lateRentOnly && property.financial.onTimeRent) {
      return false;
    }
    
    // Renewal due filter
    if (filters.renewalDueDays !== null && filters.renewalDueDays !== undefined) {
      if (property.retention.daysToLeaseEnd > filters.renewalDueDays || property.retention.renewalCompleted) {
        return false;
      }
    }
    
    // Low owner rating filter
    if (filters.lowOwnerRating && property.customerExperience.ownerRating >= 4) {
      return false;
    }
    
    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      if (
        !property.basic.propertyId.toLowerCase().includes(query) &&
        !property.basic.propertyName.toLowerCase().includes(query) &&
        !property.basic.ownerName.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    
    return true;
  });
}

// PM-wise property summaries for TL view
export function getPMPropertySummaries(properties: Property[]): PMPropertySummary[] {
  const pmMap = new Map<string, Property[]>();
  
  // Assign properties to PMs round-robin style
  const pmList = pmNames.map((name, i) => ({ id: `PM${String(i + 1).padStart(3, '0')}`, name, city: cities[i % cities.length] }));
  
  properties.forEach((p, i) => {
    const pm = pmList[i % pmList.length];
    if (!pmMap.has(pm.id)) pmMap.set(pm.id, []);
    pmMap.get(pm.id)!.push(p);
  });

  return pmList.map(pm => {
    const props = pmMap.get(pm.id) || [];
    const highRisk = props.filter(p => p.riskLevel === 'high').length;
    const lateRent = props.filter(p => !p.financial.onTimeRent && p.financial.lateDays > 5).length;
    const renewalDue = props.filter(p => p.retention.daysToLeaseEnd <= 60 && !p.retention.renewalCompleted).length;
    const notesCount = props.reduce((sum, p) => sum + p.notes.length, 0);
    const withoutNotes = props.filter(p => p.notes.length === 0).length;
    
    return {
      pmId: pm.id,
      pmName: pm.name,
      city: pm.city,
      totalProperties: props.length,
      avgScore: props.length > 0 ? Math.round(props.reduce((s, p) => s + p.healthScore, 0) / props.length * 10) / 10 : 0,
      highRiskCount: highRisk,
      lateRentCount: lateRent,
      renewalDueCount: renewalDue,
      notesCount,
      propertiesWithoutNotes: withoutNotes,
      interventionRequired: highRisk >= 3 || lateRent >= 3,
    };
  });
}

// City-wise stats for Leadership view
export function getCityPropertyStats(properties: Property[]): CityPropertyStats[] {
  const cityMap = new Map<string, Property[]>();
  properties.forEach(p => {
    if (!cityMap.has(p.basic.city)) cityMap.set(p.basic.city, []);
    cityMap.get(p.basic.city)!.push(p);
  });

  return Array.from(cityMap.entries()).map(([city, props]) => ({
    city,
    totalProperties: props.length,
    avgScore: Math.round(props.reduce((s, p) => s + p.healthScore, 0) / props.length * 10) / 10,
    highRiskCount: props.filter(p => p.riskLevel === 'high').length,
    lateRentCount: props.filter(p => !p.financial.onTimeRent && p.financial.lateDays > 5).length,
    renewalDueCount: props.filter(p => p.retention.daysToLeaseEnd <= 60 && !p.retention.renewalCompleted).length,
    notesUpdated: props.filter(p => p.notes.length > 0).length,
    notesNotUpdated: props.filter(p => p.notes.length === 0).length,
  })).sort((a, b) => b.totalProperties - a.totalProperties);
}

// Analytics stats
export function getPropertyAnalyticsStats(properties: Property[]): PropertyAnalyticsStats {
  const scoreRanges = ['0-30', '31-50', '51-70', '71-85', '86-100'];
  const scoreDistribution = scoreRanges.map(range => {
    const [min, max] = range.split('-').map(Number);
    return { range, count: properties.filter(p => p.healthScore >= min && p.healthScore <= max).length };
  });

  const riskDistribution = [
    { level: 'Low', count: properties.filter(p => p.riskLevel === 'low').length },
    { level: 'Medium', count: properties.filter(p => p.riskLevel === 'medium').length },
    { level: 'High', count: properties.filter(p => p.riskLevel === 'high').length },
  ];

  const pillarAverages = [
    { pillar: 'Operations', avg: Math.round(properties.reduce((s, p) => s + p.scoreBreakdown.operations, 0) / properties.length * 10) / 10, max: 40 },
    { pillar: 'Financial', avg: Math.round(properties.reduce((s, p) => s + p.scoreBreakdown.financial, 0) / properties.length * 10) / 10, max: 15 },
    { pillar: 'Customer Exp', avg: Math.round(properties.reduce((s, p) => s + p.scoreBreakdown.customerExperience, 0) / properties.length * 10) / 10, max: 25 },
    { pillar: 'Ecosystem', avg: Math.round(properties.reduce((s, p) => s + p.scoreBreakdown.ecosystem, 0) / properties.length * 10) / 10, max: 20 },
  ];

  const cityMap = new Map<string, Property[]>();
  properties.forEach(p => {
    if (!cityMap.has(p.basic.city)) cityMap.set(p.basic.city, []);
    cityMap.get(p.basic.city)!.push(p);
  });
  const cityWiseScores = Array.from(cityMap.entries()).map(([city, props]) => ({
    city,
    avgScore: Math.round(props.reduce((s, p) => s + p.healthScore, 0) / props.length * 10) / 10,
    count: props.length,
  }));

  const withNotes = properties.filter(p => p.notes.length > 0).length;
  const totalNotes = properties.reduce((s, p) => s + p.notes.length, 0);

  const months = ['Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025'];
  const monthlyScoreTrend = months.map((month, i) => ({
    month,
    avgScore: Math.round((62 + i * 2.5 + Math.random() * 3) * 10) / 10,
  }));

  return {
    totalProperties: properties.length,
    avgScore: Math.round(properties.reduce((s, p) => s + p.healthScore, 0) / properties.length * 10) / 10,
    scoreDistribution,
    riskDistribution,
    pillarAverages,
    cityWiseScores,
    notesStats: { withNotes, withoutNotes: properties.length - withNotes, totalNotes },
    monthlyScoreTrend,
  };
}
