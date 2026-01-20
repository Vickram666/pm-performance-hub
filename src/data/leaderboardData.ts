import { PMLeaderboardEntry, CityStats } from '@/types/leaderboard';
import { getPayoutBand, getEligibilityFromBand, PayoutBand } from '@/types/dashboard';

const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune'];
const zones = ['North', 'South', 'East', 'West'];

const firstNames = [
  'Priya', 'Rahul', 'Ananya', 'Vikram', 'Sneha', 'Arjun', 'Kavya', 'Ravi',
  'Meera', 'Aditya', 'Pooja', 'Sanjay', 'Divya', 'Karthik', 'Nisha', 'Amit',
  'Lakshmi', 'Suresh', 'Anjali', 'Deepak', 'Swati', 'Rajesh', 'Shruti', 'Gaurav',
  'Pallavi', 'Manish', 'Isha', 'Vivek', 'Neha', 'Rohan', 'Preeti', 'Ashish',
  'Nikita', 'Varun', 'Komal', 'Sachin', 'Bhavna', 'Mohit', 'Rashmi', 'Prakash'
];

const lastNames = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Reddy', 'Nair', 'Iyer', 'Rao',
  'Gupta', 'Joshi', 'Menon', 'Pillai', 'Agarwal', 'Desai', 'Verma', 'Mehta',
  'Kapoor', 'Chopra', 'Malhotra', 'Bansal', 'Saxena', 'Bhatia', 'Khanna', 'Sethi'
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomNumber(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

function generatePMData(index: number): PMLeaderboardEntry {
  // Property score is the Final Monthly Score (0-100)
  const propertyScore = getRandomNumber(45, 95);
  const payoutBand = getPayoutBand(propertyScore);
  const eligibilityStatus = getEligibilityFromBand(payoutBand, false);

  // Map eligibility status to incentive status
  let incentiveStatus: 'eligible' | 'partial' | 'blocked';
  if (payoutBand === '100%') {
    incentiveStatus = 'eligible';
  } else if (payoutBand === '75%' || payoutBand === '50%') {
    incentiveStatus = 'partial';
  } else {
    incentiveStatus = 'blocked';
  }

  return {
    id: `pm-${String(index + 1).padStart(3, '0')}`,
    name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
    city: getRandomElement(cities),
    zone: getRandomElement(zones),
    propertyScore,
    payoutBand,
    incentiveStatus,
    portfolioSize: Math.floor(Math.random() * 30) + 110, // 110-140 properties
  };
}

// Generate 120 PMs sorted by property score
export const allPMs: PMLeaderboardEntry[] = Array.from({ length: 120 }, (_, i) => 
  generatePMData(i)
).sort((a, b) => b.propertyScore - a.propertyScore).map((pm, index) => ({
  ...pm,
  rank: index + 1,
  percentile: Math.round((1 - index / 120) * 100),
}));

// Calculate city stats
export const cityStats: CityStats[] = cities.map(city => {
  const cityPMs = allPMs.filter(pm => pm.city === city);
  
  const zoneStats = zones.map(zone => {
    const zonePMs = cityPMs.filter(pm => pm.zone === zone);
    if (zonePMs.length === 0) {
      return {
        zone,
        avgPropertyScore: 0,
        pmCount: 0,
        eligiblePercent: 0,
      };
    }
    return {
      zone,
      avgPropertyScore: Math.round(zonePMs.reduce((sum, pm) => sum + pm.propertyScore, 0) / zonePMs.length * 10) / 10,
      pmCount: zonePMs.length,
      eligiblePercent: Math.round(zonePMs.filter(pm => pm.incentiveStatus === 'eligible').length / zonePMs.length * 100),
    };
  }).filter(z => z.pmCount > 0);

  return {
    city,
    avgPropertyScore: cityPMs.length > 0 ? Math.round(cityPMs.reduce((sum, pm) => sum + pm.propertyScore, 0) / cityPMs.length * 10) / 10 : 0,
    pmCount: cityPMs.length,
    eligiblePercent: cityPMs.length > 0 ? Math.round(cityPMs.filter(pm => pm.incentiveStatus === 'eligible').length / cityPMs.length * 100) : 0,
    zones: zoneStats,
  };
});

export const getCitiesWithPMs = () => [...new Set(allPMs.map(pm => pm.city))];
export const getZonesForCity = (city: string) => [...new Set(allPMs.filter(pm => pm.city === city).map(pm => pm.zone))];
