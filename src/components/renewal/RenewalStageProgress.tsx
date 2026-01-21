import { RenewalStage, RENEWAL_STAGE_ORDER, RENEWAL_STAGE_LABELS } from '@/types/renewal';
import { Check, Circle, XCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface RenewalStageProgressProps {
  currentStage: RenewalStage;
  compact?: boolean;
}

export function RenewalStageProgress({ currentStage, compact = false }: RenewalStageProgressProps) {
  const isFailed = currentStage === 'renewal_failed';
  const currentIndex = isFailed 
    ? RENEWAL_STAGE_ORDER.length 
    : RENEWAL_STAGE_ORDER.indexOf(currentStage);

  if (compact) {
    const progress = isFailed ? 0 : ((currentIndex + 1) / RENEWAL_STAGE_ORDER.length) * 100;
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all ${isFailed ? 'bg-red-500' : 'bg-primary'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {isFailed ? 'Failed' : `${currentIndex + 1}/${RENEWAL_STAGE_ORDER.length}`}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {RENEWAL_STAGE_ORDER.map((stage, index) => {
          const isComplete = !isFailed && index < currentIndex;
          const isCurrent = !isFailed && index === currentIndex;
          const isPending = !isFailed && index > currentIndex;

          return (
            <Tooltip key={stage}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center relative">
                  {/* Connector line */}
                  {index > 0 && (
                    <div 
                      className={`absolute right-1/2 top-3 w-full h-0.5 -translate-y-1/2 ${
                        isComplete || isCurrent ? 'bg-primary' : 'bg-muted'
                      }`}
                      style={{ width: 'calc(100% - 12px)', right: 'calc(50% + 6px)' }}
                    />
                  )}
                  
                  {/* Stage indicator */}
                  <div 
                    className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center ${
                      isFailed ? 'bg-red-500/20 border-2 border-red-500' :
                      isComplete ? 'bg-primary text-primary-foreground' :
                      isCurrent ? 'bg-primary/20 border-2 border-primary' :
                      'bg-muted border-2 border-muted-foreground/30'
                    }`}
                  >
                    {isFailed ? (
                      <XCircle className="h-3 w-3 text-red-500" />
                    ) : isComplete ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Circle className={`h-2 w-2 ${isCurrent ? 'fill-primary text-primary' : ''}`} />
                    )}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{RENEWAL_STAGE_LABELS[stage]}</p>
                <p className="text-xs text-muted-foreground">
                  {isComplete ? 'Completed' : isCurrent ? 'Current Stage' : 'Pending'}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      
      <div className="text-center">
        <span className="text-sm font-medium">
          {isFailed ? (
            <span className="text-red-400">Renewal Failed (Move-out)</span>
          ) : (
            RENEWAL_STAGE_LABELS[currentStage]
          )}
        </span>
      </div>
    </div>
  );
}
