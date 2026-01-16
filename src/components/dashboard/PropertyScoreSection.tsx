import { PropertyScore } from '@/types/dashboard';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, Wrench, DollarSign, Heart, Sparkles, AlertTriangle } from 'lucide-react';

interface PropertyScoreSectionProps {
  propertyScore: PropertyScore;
}

interface MetricRowProps {
  label: string;
  earned: number;
  max: number;
  tooltip: string;
  isNegative?: boolean;
}

const MetricRow = ({ label, earned, max, tooltip, isNegative = false }: MetricRowProps) => {
  const percentage = isNegative ? 0 : (earned / max) * 100;
  const displayValue = isNegative ? earned : earned.toFixed(1);
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="tooltip-trigger">{label}</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <span className={`font-semibold ${isNegative ? 'text-danger' : ''}`}>
          {displayValue} / {max}
        </span>
      </div>
      <div className="progress-track">
        <div 
          className={`h-full transition-all duration-700 ease-out ${
            isNegative ? 'bg-danger' : 
            percentage >= 80 ? 'bg-success' : 
            percentage >= 60 ? 'bg-warning' : 
            'bg-danger'
          }`}
          style={{ width: isNegative ? '100%' : `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface PillarCardProps {
  title: string;
  icon: React.ElementType;
  color: string;
  earned: number;
  max: number;
  children: React.ReactNode;
}

const PillarCard = ({ title, icon: Icon, color, earned, max, children }: PillarCardProps) => {
  const percentage = (earned / max) * 100;
  
  return (
    <div className="pillar-card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{percentage.toFixed(0)}% achieved</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold" style={{ color }}>{earned.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">/{max}</span>
        </div>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

export const PropertyScoreSection = ({ propertyScore }: PropertyScoreSectionProps) => {
  const { operations, financial, customer, ecosystem } = propertyScore;
  
  const operationsTotal = operations.serviceRequestsScore + operations.reportWorkScore + 
    operations.moveInReportScore + operations.moveOutScore + operations.utilityBillHandling;
  
  const financialTotal = financial.paidRentPaymentScore + financial.utilityBillClosureAccuracy + financial.latePenalty;
  
  const customerTotal = customer.tenantAppReviewScore + customer.ownerAppReviewScore + 
    customer.timelyRenewalInitiation + customer.renewalPercentScore;
  
  const ecosystemTotal = ecosystem.ownerAppDownload + ecosystem.homeInsuranceActivation + 
    ecosystem.leaseAgreement + ecosystem.utilityEnablement;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Property Performance Score</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Raw Score:</span>
          <span className="font-semibold">{propertyScore.rawScore.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground mx-1">×</span>
          <span className="font-semibold text-primary">{propertyScore.medianAdjustmentFactor}</span>
          <span className="text-sm text-muted-foreground mx-1">=</span>
          <span className="text-lg font-bold text-primary">{propertyScore.adjustedScore.toFixed(1)}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Pillar 1: Operations */}
        <PillarCard 
          title="Operations & Execution" 
          icon={Wrench}
          color="hsl(var(--pillar-operations))"
          earned={operationsTotal}
          max={40}
        >
          <MetricRow 
            label="Service Requests Score" 
            earned={operations.serviceRequestsScore} 
            max={10}
            tooltip="% of service requests closed within SLA. Target: 95%+ for full score."
          />
          <MetricRow 
            label="Report Work Score" 
            earned={operations.reportWorkScore} 
            max={5}
            tooltip="Inspection, SR, and periodic reports accuracy and completeness."
          />
          <MetricRow 
            label="Move-in Report Score" 
            earned={operations.moveInReportScore} 
            max={10}
            tooltip="Completed within 24 hours with full documentation."
          />
          <MetricRow 
            label="Move-out Score" 
            earned={operations.moveOutScore} 
            max={10}
            tooltip="Smooth closure with no escalation. Full handover completed."
          />
          <MetricRow 
            label="Utility Bill Handling" 
            earned={operations.utilityBillHandling} 
            max={5}
            tooltip="Correct handover and billing for all utilities."
          />
        </PillarCard>

        {/* Pillar 2: Financial */}
        <PillarCard 
          title="Financial Discipline" 
          icon={DollarSign}
          color="hsl(var(--pillar-financial))"
          earned={Math.max(0, financialTotal)}
          max={15}
        >
          <MetricRow 
            label="Paid Rent Payment Score" 
            earned={financial.paidRentPaymentScore} 
            max={10}
            tooltip="Rent credited on or before due date. Target: 95%+ on-time."
          />
          <MetricRow 
            label="Utility Bill Closure Accuracy" 
            earned={financial.utilityBillClosureAccuracy} 
            max={5}
            tooltip="All utility bills correctly settled and documented."
          />
          {financial.latePenalty < 0 && (
            <div className="mt-3 p-3 bg-danger-light rounded-lg border border-danger/20">
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-semibold">Late Rent Penalty Applied</span>
              </div>
              <p className="text-sm text-danger/80 mt-1">
                {financial.daysLate} days late → {financial.latePenalty} points
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Grace period: 5 days | 6-15 days: -5 | 15+ days: -10
              </p>
            </div>
          )}
        </PillarCard>

        {/* Pillar 3: Customer Experience */}
        <PillarCard 
          title="Customer Experience & Retention" 
          icon={Heart}
          color="hsl(var(--pillar-customer))"
          earned={customerTotal}
          max={25}
        >
          <MetricRow 
            label="Tenant App Review Score" 
            earned={customer.tenantAppReviewScore} 
            max={5}
            tooltip="Average rating from tenant app reviews. Target: 4.5+ stars."
          />
          <MetricRow 
            label="Owner App Review Score" 
            earned={customer.ownerAppReviewScore} 
            max={5}
            tooltip="Average rating from owner app reviews. Target: 4.5+ stars."
          />
          <MetricRow 
            label="Timely Renewal Initiation" 
            earned={customer.timelyRenewalInitiation} 
            max={5}
            tooltip="Renewal conversation started 60-90 days before expiry."
          />
          <MetricRow 
            label="Renewal % Score" 
            earned={customer.renewalPercentScore} 
            max={10}
            tooltip="% of eligible leases successfully renewed. Target: 80%+."
          />
        </PillarCard>

        {/* Pillar 4: Ecosystem */}
        <PillarCard 
          title="Ecosystem & Value Addition" 
          icon={Sparkles}
          color="hsl(var(--pillar-ecosystem))"
          earned={ecosystemTotal}
          max={20}
        >
          <MetricRow 
            label="Owner App Download & Activation" 
            earned={ecosystem.ownerAppDownload} 
            max={5}
            tooltip="% of owners with active app accounts."
          />
          <MetricRow 
            label="Home Insurance Activation" 
            earned={ecosystem.homeInsuranceActivation} 
            max={5}
            tooltip="% of properties with active home insurance."
          />
          <MetricRow 
            label="Lease Agreement (New/Renewal)" 
            earned={ecosystem.leaseAgreement} 
            max={5}
            tooltip="Digital lease agreements completed on platform."
          />
          <MetricRow 
            label="Utility Enablement" 
            earned={ecosystem.utilityEnablement} 
            max={5}
            tooltip="New tenant utility connections completed through platform."
          />
        </PillarCard>
      </div>
    </section>
  );
};
