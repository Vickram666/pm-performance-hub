// Leaderboard Data Types

export interface PMLeaderboardEntry {
  id: string;
  name: string;
  city: string;
  zone: string;
  propertyScore: number;
  revenueScore: number;
  totalScore: number;
  incentiveStatus: 'eligible' | 'partial' | 'blocked';
  portfolioSize: number;
  rank?: number;
  percentile?: number;
}

export interface CityStats {
  city: string;
  avgPropertyScore: number;
  avgRevenueScore: number;
  avgTotalScore: number;
  pmCount: number;
  eligiblePercent: number;
  zones: ZoneStats[];
}

export interface ZoneStats {
  zone: string;
  avgPropertyScore: number;
  avgRevenueScore: number;
  avgTotalScore: number;
  pmCount: number;
  eligiblePercent: number;
}

export type ScoreType = 'total' | 'property' | 'revenue';
export type IncentiveFilter = 'all' | 'eligible' | 'partial' | 'blocked';

export interface LeaderboardFilters {
  city: string | null;
  zone: string | null;
  scoreType: ScoreType;
  incentiveStatus: IncentiveFilter;
  searchQuery: string;
}
