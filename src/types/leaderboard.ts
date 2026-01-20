// Leaderboard Data Types

import { PayoutBand } from './dashboard';

export interface PMLeaderboardEntry {
  id: string;
  name: string;
  city: string;
  zone: string;
  propertyScore: number; // Final Monthly Score (avg property health, 0-100)
  payoutBand: PayoutBand;
  incentiveStatus: 'eligible' | 'partial' | 'blocked';
  portfolioSize: number;
  rank?: number;
  percentile?: number;
}

export interface CityStats {
  city: string;
  avgPropertyScore: number;
  pmCount: number;
  eligiblePercent: number;
  zones: ZoneStats[];
}

export interface ZoneStats {
  zone: string;
  avgPropertyScore: number;
  pmCount: number;
  eligiblePercent: number;
}

export type ScoreType = 'property'; // Only property score now
export type IncentiveFilter = 'all' | 'eligible' | 'partial' | 'blocked';

export interface LeaderboardFilters {
  city: string | null;
  zone: string | null;
  scoreType: ScoreType;
  incentiveStatus: IncentiveFilter;
  searchQuery: string;
}
