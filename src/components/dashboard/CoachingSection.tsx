import { CoachingSuggestion } from '@/types/dashboard';
import { Lightbulb, ArrowUpRight, TrendingUp, Target } from 'lucide-react';

interface CoachingSectionProps {
  suggestions: CoachingSuggestion[];
}

const ImpactBadge = ({ impact }: { impact: 'high' | 'medium' | 'low' }) => {
  const config = {
    high: { label: 'High Impact', className: 'bg-success-light text-success' },
    medium: { label: 'Medium Impact', className: 'bg-warning-light text-warning' },
    low: { label: 'Low Impact', className: 'bg-secondary text-muted-foreground' },
  };

  const { label, className } = config[impact];

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
};

export const CoachingSection = ({ suggestions }: CoachingSectionProps) => {
  return (
    <section className="score-card animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-warning-light flex items-center justify-center">
          <Lightbulb className="w-6 h-6 text-warning" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">What To Do Next</h2>
          <p className="text-sm text-muted-foreground">Actionable steps to improve your score</p>
        </div>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div 
            key={suggestion.id}
            className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-foreground">{suggestion.metric}</h3>
              </div>
              <ImpactBadge impact={suggestion.impact} />
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 pl-10">
              {suggestion.suggestion}
            </p>

            <div className="flex items-center gap-4 pl-10">
              <div className="flex items-center gap-1.5 text-sm">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Current:</span>
                <span className="font-semibold">{suggestion.currentValue}%</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-success" />
              <div className="flex items-center gap-1.5 text-sm">
                <TrendingUp className="w-4 h-4 text-success" />
                <span className="text-muted-foreground">Target:</span>
                <span className="font-semibold text-success">{suggestion.targetValue}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
