import { RevenueScore } from '@/types/dashboard';
import { TrendingUp, DollarSign, Target, Award } from 'lucide-react';

interface RevenueSectionProps {
  revenueScore: RevenueScore;
  salary: number;
}

const SlabIndicator = ({ 
  label, 
  multiplier, 
  score, 
  isActive 
}: { 
  label: string; 
  multiplier: string; 
  score: number;
  isActive: boolean;
}) => (
  <div 
    className={`flex items-center justify-between p-3 rounded-lg transition-all ${
      isActive 
        ? 'bg-success-light border-2 border-success' 
        : 'bg-secondary/50 border border-border'
    }`}
  >
    <div className="flex items-center gap-2">
      {isActive && <Award className="w-4 h-4 text-success" />}
      <span className={`font-medium ${isActive ? 'text-success' : 'text-muted-foreground'}`}>
        {multiplier}
      </span>
    </div>
    <span className={`font-bold ${isActive ? 'text-success' : 'text-muted-foreground'}`}>
      {score} pts
    </span>
  </div>
);

export const RevenueSection = ({ revenueScore, salary }: RevenueSectionProps) => {
  const { revenueAchieved, revenueMapped, salaryMultiple, slabAchieved, score } = revenueScore;
  const progressPercent = Math.min((revenueAchieved / (salary * 2)) * 100, 100);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="score-card animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-success-light flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-success" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Revenue Performance</h2>
          <p className="text-sm text-muted-foreground">Based on existing slab model</p>
        </div>
        <div className="ml-auto text-right">
          <span className="text-3xl font-bold text-success">{score}</span>
          <span className="text-lg text-muted-foreground">/100</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue Stats */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">Revenue Mapped</span>
            </div>
            <span className="text-lg font-bold">{formatCurrency(revenueMapped)}</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-success-light rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-success">Revenue Achieved</span>
            </div>
            <span className="text-lg font-bold text-success">{formatCurrency(revenueAchieved)}</span>
          </div>

          <div className="p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Salary Multiple Achieved</span>
              <span className="text-xl font-bold text-primary">{salaryMultiple.toFixed(2)}×</span>
            </div>
            <div className="progress-track h-3">
              <div 
                className="h-full bg-gradient-hero rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>0×</span>
              <span>1×</span>
              <span>1.5×</span>
              <span>2×</span>
            </div>
          </div>
        </div>

        {/* Revenue Slabs */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Revenue Slabs
          </h3>
          <SlabIndicator 
            label="2× Salary" 
            multiplier="≥ 2× Salary" 
            score={100}
            isActive={salaryMultiple >= 2}
          />
          <SlabIndicator 
            label="1.5× Salary" 
            multiplier="≥ 1.5× Salary" 
            score={75}
            isActive={salaryMultiple >= 1.5 && salaryMultiple < 2}
          />
          <SlabIndicator 
            label="1× Salary" 
            multiplier="≥ 1× Salary" 
            score={50}
            isActive={salaryMultiple >= 1 && salaryMultiple < 1.5}
          />
          <SlabIndicator 
            label="Below Target" 
            multiplier="< 1× Salary" 
            score={0}
            isActive={salaryMultiple < 1}
          />
        </div>
      </div>
    </section>
  );
};
