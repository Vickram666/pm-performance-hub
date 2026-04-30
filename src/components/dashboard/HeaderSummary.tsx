import { PMProfile, EligibilityStatus, PayoutBand } from '@/types/dashboard';
import { Building2, MapPin, Calendar, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
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

const getScoreColor = (score: number) => {
  if (score >= 80) return 'hsl(var(--success))';
  if (score >= 60) return 'hsl(var(--warning))';
  return 'hsl(var(--destructive))';
};

const ScoreRing = ({ score }: { score: number }) => {
  const r = 36;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} stroke="hsl(var(--muted))" strokeWidth="7" fill="none" />
        <circle
          cx="44" cy="44" r={r}
          stroke={getScoreColor(score)}
          strokeWidth="7" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold leading-none">{score.toFixed(0)}</span>
        <span className="text-[10px] text-muted-foreground mt-0.5">/ 100</span>
      </div>
    </div>
  );
};

const StatusPill = ({ status, payoutBand }: { status: EligibilityStatus; payoutBand: PayoutBand }) => {
  const config = {
    eligible: { label: '100% Payout', icon: CheckCircle2, cls: 'bg-success/10 text-success border-success/20' },
    partial:  { label: `${payoutBand} Payout`, icon: AlertTriangle, cls: 'bg-warning/10 text-warning border-warning/20' },
    blocked:  { label: 'No Incentive', icon: XCircle, cls: 'bg-destructive/10 text-destructive border-destructive/20' },
  }[status];
  const Icon = config.icon;
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold ${config.cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  );
};

export const HeaderSummary = ({
  profile, finalMonthlyScore, payoutBand, eligibilityStatus, selectedMonth, onMonthChange,
}: HeaderSummaryProps) => {
  const bandHint =
    payoutBand === '100%' ? 'Score ≥ 80'
    : payoutBand === '75%' ? 'Score 70 – 79'
    : payoutBand === '50%' ? 'Score 60 – 69'
    : 'Score < 60';

  return (
    <div className="sticky top-14 z-40 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container py-4">
        <div className="flex items-center gap-5 flex-wrap">
          {/* Score ring */}
          <ScoreRing score={finalMonthlyScore} />

          {/* Identity */}
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-xl md:text-2xl font-bold leading-tight">{profile.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {profile.city}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> {profile.portfolioSize} Properties
              </span>
              <span className="text-xs">Avg Property Health</span>
            </div>
          </div>

          {/* Incentive */}
          <div className="flex flex-col items-start gap-1">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Incentive</span>
            <StatusPill status={eligibilityStatus} payoutBand={payoutBand} />
            <span className="text-[11px] text-muted-foreground">{bandHint}</span>
          </div>

          {/* Month selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedMonth} onValueChange={onMonthChange}>
              <SelectTrigger className="w-[150px] bg-background h-9">
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
      </div>
    </div>
  );
};
