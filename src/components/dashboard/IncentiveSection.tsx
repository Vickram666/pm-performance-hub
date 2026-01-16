import { IncentiveCalculation, EligibilityStatus } from '@/types/dashboard';
import { Wallet, TrendingUp, Percent, Ban, CheckCircle2, AlertTriangle } from 'lucide-react';

interface IncentiveSectionProps {
  incentive: IncentiveCalculation;
  adjustedPropertyScore: number;
  mappedRevenue: number;
  eligibilityStatus: EligibilityStatus;
}

const QualifierBar = ({ score, releasePercent }: { score: number; releasePercent: number }) => {
  const tiers = [
    { min: 80, max: 100, release: 100, label: '80+' },
    { min: 65, max: 79, release: 75, label: '65-79' },
    { min: 50, max: 64, release: 50, label: '50-64' },
    { min: 0, max: 49, release: 0, label: '<50' },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Property Score Qualifier
      </h4>
      <div className="grid grid-cols-4 gap-2">
        {tiers.map((tier) => {
          const isActive = score >= tier.min && score <= tier.max;
          return (
            <div 
              key={tier.label}
              className={`p-3 rounded-lg text-center transition-all ${
                isActive 
                  ? tier.release === 100 ? 'bg-success-light border-2 border-success' :
                    tier.release === 75 ? 'bg-warning-light border-2 border-warning' :
                    tier.release === 50 ? 'bg-warning-light border-2 border-warning' :
                    'bg-danger-light border-2 border-danger'
                  : 'bg-secondary/50'
              }`}
            >
              <div className={`text-xs font-medium ${isActive ? '' : 'text-muted-foreground'}`}>
                {tier.label}
              </div>
              <div className={`text-lg font-bold ${
                isActive 
                  ? tier.release === 100 ? 'text-success' :
                    tier.release > 0 ? 'text-warning' : 'text-danger'
                  : 'text-muted-foreground'
              }`}>
                {tier.release}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const IncentiveSection = ({ 
  incentive, 
  adjustedPropertyScore, 
  mappedRevenue,
  eligibilityStatus 
}: IncentiveSectionProps) => {
  const { baseIncentivePercent, baseIncentiveAmount, releasePercent, finalPayableAmount, isBlocked, blockReason } = incentive;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isBlocked) {
    return (
      <section className="score-card border-2 border-danger animate-slide-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-danger-light flex items-center justify-center">
            <Ban className="w-6 h-6 text-danger" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-danger">Incentive Blocked</h2>
            <p className="text-sm text-danger/80">{blockReason}</p>
          </div>
        </div>
        <div className="p-4 bg-danger-light rounded-lg">
          <p className="text-sm text-danger">
            Your incentive has been blocked due to compliance issues. Please contact your manager for resolution.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="score-card animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Wallet className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Incentive Calculation</h2>
          <p className="text-sm text-muted-foreground">Monthly payout breakdown</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calculation Flow */}
        <div className="space-y-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Base Rate (Revenue-driven)</span>
              <span className="font-semibold text-primary">{baseIncentivePercent}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">of Mapped Revenue</span>
              <span className="text-sm">{formatCurrency(mappedRevenue)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Base Incentive Amount</span>
              <span className="font-bold text-lg">{formatCurrency(baseIncentiveAmount)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Percent className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className={`p-4 rounded-lg ${
            releasePercent === 100 ? 'bg-success-light' :
            releasePercent >= 50 ? 'bg-warning-light' : 'bg-danger-light'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">Release Percentage</span>
              <span className={`font-bold text-lg ${
                releasePercent === 100 ? 'text-success' :
                releasePercent >= 50 ? 'text-warning' : 'text-danger'
              }`}>
                {releasePercent}%
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Based on Property Score: {adjustedPropertyScore.toFixed(1)}
            </div>
          </div>

          <div className="p-4 bg-gradient-hero rounded-lg text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Final Payable</span>
              </div>
              <span className="text-2xl font-bold">{formatCurrency(finalPayableAmount)}</span>
            </div>
          </div>
        </div>

        {/* Qualifier Section */}
        <div className="space-y-6">
          <QualifierBar score={adjustedPropertyScore} releasePercent={releasePercent} />
          
          <div className="p-4 bg-info-light rounded-lg">
            <h4 className="text-sm font-semibold text-info mb-2">How it works</h4>
            <ul className="text-sm text-info/80 space-y-1">
              <li>• Base incentive = {baseIncentivePercent}% of mapped revenue</li>
              <li>• Property Score determines release %</li>
              <li>• Score ≥80 = 100% release</li>
              <li>• Score 65-79 = 75% release</li>
              <li>• Score 50-64 = 50% release</li>
              <li>• Score &lt;50 = 0% release</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
