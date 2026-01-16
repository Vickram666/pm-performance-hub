import { PMProfile, EligibilityStatus } from '@/types/dashboard';
import { Building2, MapPin, Layers, Calendar, ChevronDown, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { monthOptions } from '@/data/mockData';

interface HeaderSummaryProps {
  profile: PMProfile;
  adjustedPropertyScore: number;
  revenueScore: number;
  totalScore: number;
  eligibilityStatus: EligibilityStatus;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const StatusBadge = ({ status }: { status: EligibilityStatus }) => {
  const config = {
    eligible: {
      label: 'Eligible',
      icon: CheckCircle2,
      className: 'bg-success-light text-success',
    },
    partial: {
      label: 'Partially Eligible',
      icon: AlertTriangle,
      className: 'bg-warning-light text-warning',
    },
    blocked: {
      label: 'Not Eligible',
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
  maxScore, 
  label, 
  color 
}: { 
  score: number; 
  maxScore: number; 
  label: string;
  color: string;
}) => {
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-secondary"
          />
          <circle
            cx="56"
            cy="56"
            r="40"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{score.toFixed(1)}</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">out of {maxScore}</span>
    </div>
  );
};

export const HeaderSummary = ({
  profile,
  adjustedPropertyScore,
  revenueScore,
  totalScore,
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

        {/* Score Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="col-span-2 md:col-span-1 flex justify-center">
            <ScoreCircle 
              score={adjustedPropertyScore} 
              maxScore={100} 
              label="Property Score"
              color="hsl(var(--pillar-operations))"
            />
          </div>
          <div className="col-span-2 md:col-span-1 flex justify-center">
            <ScoreCircle 
              score={revenueScore} 
              maxScore={100} 
              label="Revenue Score"
              color="hsl(var(--pillar-customer))"
            />
          </div>
          <div className="col-span-2 md:col-span-1 flex justify-center">
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-full bg-gradient-hero flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-foreground">{totalScore.toFixed(0)}</span>
              </div>
              <span className="mt-2 text-sm font-medium text-muted-foreground">Total Score</span>
              <span className="text-xs text-muted-foreground">out of 200</span>
            </div>
          </div>
          <div className="col-span-2 md:col-span-1 flex flex-col items-center justify-center">
            <span className="text-sm font-medium text-muted-foreground mb-2">Incentive Status</span>
            <StatusBadge status={eligibilityStatus} />
          </div>
        </div>
      </div>
    </div>
  );
};
