import { Award } from '@/types/dashboard';
import { Trophy, Star, Medal, Plane, CheckCircle2, XCircle } from 'lucide-react';

interface AwardsSectionProps {
  awards: Award[];
}

const AwardCard = ({ award }: { award: Award }) => {
  const iconMap: Record<string, React.ElementType> = {
    'PM of the Month': Trophy,
    'CX Champion': Star,
    'Renewal Star': Medal,
    'Financial Discipline': Medal,
    'Annual Trip': Plane,
  };

  const Icon = iconMap[award.name] || Trophy;

  return (
    <div 
      className={`p-4 rounded-lg border transition-all ${
        award.isEligible 
          ? 'bg-success-light border-success/30' 
          : 'bg-secondary/30 border-border'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${award.isEligible ? 'text-success' : 'text-muted-foreground'}`} />
          <span className={`font-semibold ${award.isEligible ? 'text-success' : 'text-muted-foreground'}`}>
            {award.name}
          </span>
        </div>
        {award.isEligible ? (
          <CheckCircle2 className="w-5 h-5 text-success" />
        ) : (
          <XCircle className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      
      <div className="flex items-center gap-2 text-sm">
        {award.currentRank && (
          <span className={award.isEligible ? 'text-success' : 'text-muted-foreground'}>
            Rank #{award.currentRank}
          </span>
        )}
        {award.percentile && (
          <span className={award.isEligible ? 'text-success' : 'text-muted-foreground'}>
            Top {award.percentile}%
          </span>
        )}
        {!award.currentRank && !award.percentile && (
          <span className="text-muted-foreground text-xs">
            {award.isEligible ? 'Eligible' : 'Not Eligible'}
          </span>
        )}
      </div>

      <div className="mt-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          award.type === 'monthly' ? 'bg-primary/10 text-primary' :
          award.type === 'annual' ? 'bg-warning/10 text-warning' :
          'bg-info/10 text-info'
        }`}>
          {award.type === 'monthly' ? 'Monthly' : award.type === 'annual' ? 'Annual' : 'Trip'}
        </span>
      </div>
    </div>
  );
};

export const AwardsSection = ({ awards }: AwardsSectionProps) => {
  const eligibleCount = awards.filter(a => a.isEligible).length;

  return (
    <section className="score-card animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-warning" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Awards & Recognition</h2>
            <p className="text-sm text-muted-foreground">Monthly, Annual & Trip eligibility</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-success">{eligibleCount}</span>
          <span className="text-lg text-muted-foreground">/{awards.length}</span>
          <p className="text-xs text-muted-foreground">Eligible</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {awards.map((award) => (
          <AwardCard key={award.id} award={award} />
        ))}
      </div>
    </section>
  );
};
