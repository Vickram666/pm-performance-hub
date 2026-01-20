import { PMProfile, EligibilityStatus, PayoutBand } from '@/types/dashboard';
import { Building2, MapPin, Layers, Calendar, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { monthOptions } from '@/data/mockData';

interface HeaderSummaryProps {
  profile: PMProfile;
  finalMonthlyScore: number;
  payoutBand: PayoutBand;
  eligibilityStatus: EligibilityStatus;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const StatusBadge = ({ status, payoutBand }: { status: EligibilityStatus; payoutBand: PayoutBand }) => {
  const config = {
    eligible: {
      label: `100% Payout`,
      icon: CheckCircle2,
      className: 'bg-success-light text-success',
    },
    partial: {
      label: `${payoutBand} Payout`,
      icon: AlertTriangle,
      className: 'bg-warning-light text-warning',
    },
    blocked: {
      label: 'No Incentive',
      icon: XCircle,
      className: 'bg-danger-light text-danger',
    },
  };

  const { label, icon: Icon, className } = config[status];

  return (
    <div className={`status-badge ${className}`}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
  );
};

const ScoreCircle = ({ 
  score, 
  label,
  sublabel,
  colorClass 
}: { 
  score: number; 
  label: string;
  sublabel?: string;
  colorClass: string;
}) => {
  const percentage = (score / 100) * 100;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color based on score bands
  const getStrokeColor = (score: number) => {
    if (score >= 80) return 'hsl(142 76% 36%)'; // Green
    if (score >= 70) return 'hsl(38 92% 50%)'; // Amber
    if (score >= 60) return 'hsl(38 92% 50%)'; // Amber
    return 'hsl(0 84% 60%)'; // Red
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-secondary"
          />
          <circle
            cx="64"
            cy="64"
            r="40"
            stroke={getStrokeColor(score)}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{score.toFixed(0)}</span>
          <span className="text-xs text-muted-foreground">out of 100</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-foreground">{label}</span>
      {sublabel && <span className="text-xs text-muted-foreground">{sublabel}</span>}
    </div>
  );
};

export const HeaderSummary = ({
  profile,
  finalMonthlyScore,
  payoutBand,
  eligibilityStatus,
  selectedMonth,
  onMonthChange,
}: HeaderSummaryProps) => {
  return (
    <div className="sticky top-0 z-50 bg-card border-b border-border shadow-card">
      <div className="container py-4">
        {/* Top Row - PM Info & Month Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{profile.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{profile.city}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>{profile.zone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>{profile.portfolioSize} Properties</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={onMonthChange}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month} value={month}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Score Cards Row - Simplified to just Final Monthly Score and Status */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          <ScoreCircle 
            score={finalMonthlyScore} 
            label="Final Monthly Score"
            sublabel="Avg Property Health"
            colorClass="text-primary"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Incentive Eligibility</span>
            <StatusBadge status={eligibilityStatus} payoutBand={payoutBand} />
            <span className="text-xs text-muted-foreground mt-1">
              {payoutBand === '100%' ? 'Score ≥80' : 
               payoutBand === '75%' ? 'Score 70-79' :
               payoutBand === '50%' ? 'Score 60-69' : 'Score <60'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
