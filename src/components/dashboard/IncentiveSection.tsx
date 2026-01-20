import { IncentiveEligibility, EligibilityStatus, PayoutBand, CoachingSuggestion } from '@/types/dashboard';
import { Wallet, Ban, CheckCircle2, Target, ArrowRight, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface IncentiveSectionProps {
  incentiveEligibility: IncentiveEligibility;
  eligibilityStatus: EligibilityStatus;
  coachingSuggestions: CoachingSuggestion[];
}

const PayoutBandBar = ({ currentScore, currentBand }: { currentScore: number; currentBand: PayoutBand }) => {
  const bands = [
    { min: 80, max: 100, payout: '100%', label: '80+' },
    { min: 70, max: 79, payout: '75%', label: '70-79' },
    { min: 60, max: 69, payout: '50%', label: '60-69' },
    { min: 0, max: 59, payout: 'Nil', label: '<60' },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Incentive Payout Matrix
      </h4>
      <div className="grid grid-cols-4 gap-2">
        {bands.map((band) => {
          const isActive = currentScore >= band.min && currentScore <= band.max;
          return (
            <div 
              key={band.label}
              className={`p-3 rounded-lg text-center transition-all ${
                isActive 
                  ? band.payout === '100%' ? 'bg-success-light border-2 border-success' :
                    band.payout === '75%' ? 'bg-warning-light border-2 border-warning' :
                    band.payout === '50%' ? 'bg-warning-light border-2 border-warning' :
                    'bg-danger-light border-2 border-danger'
                  : 'bg-secondary/50'
              }`}
            >
              <div className={`text-xs font-medium ${isActive ? '' : 'text-muted-foreground'}`}>
                {band.label}
              </div>
              <div className={`text-lg font-bold ${
                isActive 
                  ? band.payout === '100%' ? 'text-success' :
                    band.payout !== 'Nil' ? 'text-warning' : 'text-danger'
                  : 'text-muted-foreground'
              }`}>
                {band.payout}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const IncentiveSection = ({ 
  incentiveEligibility, 
  eligibilityStatus,
  coachingSuggestions 
}: IncentiveSectionProps) => {
  const { finalMonthlyScore, payoutBand, isBlocked, blockReason } = incentiveEligibility;
  
  // Get high impact suggestions
  const highImpactSuggestions = coachingSuggestions.filter(s => s.impact === 'high').slice(0, 3);

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
            Your incentive has been blocked due to compliance issues. Even with a high score, incentives cannot be released until resolved.
          </p>
          <ul className="mt-3 text-sm text-danger/80 space-y-1">
            <li>• Fraudulent or fake closures</li>
            <li>• Unresolved owner escalation</li>
            <li>• Missed security deposit settlement</li>
            <li>• Repeated late rent cases across properties</li>
          </ul>
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
          <h2 className="text-xl font-bold text-foreground">Incentive Eligibility</h2>
          <p className="text-sm text-muted-foreground">Based on your Final Monthly Score</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Current Status */}
        <div className="space-y-4">
          {/* PM-Friendly Summary Box */}
          <div className={`p-5 rounded-lg ${
            payoutBand === '100%' ? 'bg-success-light border border-success' :
            payoutBand !== 'nil' ? 'bg-warning-light border border-warning' :
            'bg-danger-light border border-danger'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Final Monthly Score</span>
                <span className="text-2xl font-bold">{finalMonthlyScore}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Incentive Eligibility</span>
                <Badge className={`text-base px-3 py-1 ${
                  payoutBand === '100%' ? 'bg-success text-success-foreground' :
                  payoutBand !== 'nil' ? 'bg-warning text-warning-foreground' :
                  'bg-danger text-danger-foreground'
                }`}>
                  {payoutBand === 'nil' ? 'No Incentive' : `${payoutBand} payout`}
                </Badge>
              </div>
            </div>
          </div>

          {/* What to improve to reach 100% */}
          {payoutBand !== '100%' && highImpactSuggestions.length > 0 && (
            <div className="p-4 bg-info-light rounded-lg">
              <h4 className="text-sm font-semibold text-info mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                What to improve to reach 100% payout:
              </h4>
              <ul className="text-sm text-info/90 space-y-2">
                {highImpactSuggestions.map((suggestion) => (
                  <li key={suggestion.id} className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{suggestion.suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {payoutBand === '100%' && (
            <div className="p-4 bg-success-light rounded-lg flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-success" />
              <div>
                <p className="font-medium text-success">Congratulations!</p>
                <p className="text-sm text-success/80">You've qualified for 100% incentive payout.</p>
              </div>
            </div>
          )}
        </div>

        {/* Payout Matrix */}
        <div className="space-y-6">
          <PayoutBandBar currentScore={finalMonthlyScore} currentBand={payoutBand} />
          
          <div className="p-4 bg-secondary/30 rounded-lg">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">How it works</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Final Monthly Score = Avg Health Score of all your properties</li>
              <li>• Score ≥80 → <span className="text-success font-medium">100% payout</span></li>
              <li>• Score 70-79 → <span className="text-warning font-medium">75% payout</span></li>
              <li>• Score 60-69 → <span className="text-warning font-medium">50% payout</span></li>
              <li>• Score &lt;60 → <span className="text-danger font-medium">No incentive</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
