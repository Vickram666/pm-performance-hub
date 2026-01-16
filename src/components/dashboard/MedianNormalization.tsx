import { PropertyScore } from '@/types/dashboard';
import { Scale, Info, ArrowRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface MedianNormalizationProps {
  propertyScore: PropertyScore;
}

export const MedianNormalization = ({ propertyScore }: MedianNormalizationProps) => {
  const { rawScore, medianAdjustmentFactor, adjustedScore } = propertyScore;
  
  const isPositiveAdjustment = medianAdjustmentFactor > 1;

  return (
    <section className="score-card animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-info-light flex items-center justify-center">
          <Scale className="w-6 h-6 text-info" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">Median Normalization</h2>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-sm">
                <p>
                  Ensures fairness across large portfolios. PMs managing complex properties 
                  get credit for maintaining median performance across all metrics.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground">Fairness adjustment for portfolio complexity</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 py-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground">{rawScore.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">Raw Score</div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">×</span>
          <div className={`px-4 py-2 rounded-lg ${
            isPositiveAdjustment ? 'bg-success-light' : 'bg-warning-light'
          }`}>
            <span className={`text-xl font-bold ${
              isPositiveAdjustment ? 'text-success' : 'text-warning'
            }`}>
              {medianAdjustmentFactor.toFixed(2)}
            </span>
          </div>
        </div>

        <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block" />
        <div className="text-muted-foreground md:hidden">=</div>

        <div className="text-center">
          <div className="text-4xl font-bold text-primary">{adjustedScore.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">Adjusted Score</div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
        <h4 className="text-sm font-semibold text-muted-foreground mb-2">Metrics Used for Median Calculation:</h4>
        <div className="flex flex-wrap gap-2">
          {['On-time Rent %', 'SR SLA %', 'Renewal Initiation', 'Utility Bill Closure'].map((metric) => (
            <span 
              key={metric}
              className="text-xs px-2 py-1 bg-background rounded-full border border-border"
            >
              {metric}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
