import { PropertyScore } from '@/types/dashboard';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Wrench, DollarSign, Heart, RefreshCw, AlertTriangle } from 'lucide-react';

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
  const completionPercent = isNegative ? 0 : Math.round((earned / max) * 100);
  
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
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {!isNegative && `${completionPercent}%`}
          </span>
          <span className={`font-semibold ${isNegative ? 'text-danger' : ''}`}>
            {displayValue} / {max}
          </span>
        </div>
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
  hasPenalty?: boolean;
}

const PillarCard = ({ title, icon: Icon, color, earned, max, children, hasPenalty }: PillarCardProps) => {
  const percentage = Math.max(0, (earned / max) * 100);
  
  return (
    <div className="pillar-card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{Math.round(percentage)}% achieved</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-2xl font-bold ${hasPenalty && earned < 0 ? 'text-danger' : ''}`} style={{ color: hasPenalty && earned < 0 ? undefined : color }}>
            {earned.toFixed(1)}
          </span>
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
  const { operations, financial, customer, renewal } = propertyScore;
  
  // Pillar 1: Operations & Execution (40 points)
  const operationsTotal = operations.serviceRequestsSLAScore + operations.reportAccuracyScore + 
    operations.moveInReportScore + operations.moveOutScore + operations.utilityBillHandling;
  
  // Pillar 2: Financial Discipline (15 points + penalty)
  const financialTotal = financial.paidRentOnTimeScore + financial.latePenalty;
  
  // Pillar 3: Customer Experience (20 points)
  const customerTotal = customer.tenantAppReviewScore + customer.ownerAppReviewScore + 
    customer.ownerAppDownload + customer.tenantAppDownload;
  
  // Pillar 4: Renewal (25 points)
  const renewalTotal = renewal.timelyRenewalInitiation + renewal.renewalRAUploadTimely + 
    renewal.renewalPercentScore + renewal.homeInsurance;

  // Calculate total score from pillars
  const totalScore = operationsTotal + financialTotal + customerTotal + renewalTotal;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Property Performance Score</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Total Score:</span>
          <span className="text-2xl font-bold text-primary">{Math.max(0, totalScore).toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Pillar 1: Operations & Execution (40 Points) */}
        <PillarCard 
          title="Operations & Execution" 
          icon={Wrench}
          color="hsl(var(--pillar-operations))"
          earned={operationsTotal}
          max={40}
        >
          <MetricRow 
            label="Service Requests SLA Score" 
            earned={operations.serviceRequestsSLAScore} 
            max={10}
            tooltip="% of service requests closed within SLA. Target: 95%+ for full score."
          />
          <MetricRow 
            label="Report Accuracy Score" 
            earned={operations.reportAccuracyScore} 
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

        {/* Pillar 2: Financial Discipline (15 Points + Penalty) */}
        <PillarCard 
          title="Financial Discipline" 
          icon={DollarSign}
          color="hsl(var(--pillar-financial))"
          earned={Math.max(0, financialTotal)}
          max={15}
          hasPenalty={financial.latePenalty < 0}
        >
          <MetricRow 
            label="Paid Rent On-time Score" 
            earned={financial.paidRentOnTimeScore} 
            max={15}
            tooltip="Rent credited on or before due date. Target: 95%+ on-time collection."
          />
          {financial.latePenalty < 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="mt-3 p-3 bg-danger-light rounded-lg border border-danger/20 cursor-help">
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
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p className="font-medium mb-1">Late Rent Penalty Rules:</p>
                <ul className="text-sm space-y-1">
                  <li>• 0-5 days late: No penalty (Grace period)</li>
                  <li>• 6-15 days late: -5 points</li>
                  <li>• 15+ days late: -10 points</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">Penalty is deducted in real-time from Financial score.</p>
              </TooltipContent>
            </Tooltip>
          )}
        </PillarCard>

        {/* Pillar 3: Customer Experience (20 Points) */}
        <PillarCard 
          title="Customer Experience" 
          icon={Heart}
          color="hsl(var(--pillar-customer))"
          earned={customerTotal}
          max={20}
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
            label="Owner App Download" 
            earned={customer.ownerAppDownload} 
            max={5}
            tooltip="% of owners with active app accounts."
          />
          <MetricRow 
            label="Tenant App Download" 
            earned={customer.tenantAppDownload} 
            max={5}
            tooltip="% of tenants with active app accounts."
          />
        </PillarCard>

        {/* Pillar 4: Renewal (25 Points) */}
        <PillarCard 
          title="Renewal" 
          icon={RefreshCw}
          color="hsl(var(--pillar-ecosystem))"
          earned={renewalTotal}
          max={25}
        >
          <MetricRow 
            label="Timely Renewal Initiation" 
            earned={renewal.timelyRenewalInitiation} 
            max={5}
            tooltip="Renewal conversation started 60-90 days before expiry."
          />
          <MetricRow 
            label="Renewal RA Upload Timely" 
            earned={renewal.renewalRAUploadTimely} 
            max={5}
            tooltip="Rent Agreement uploaded within 7 days of renewal confirmation."
          />
          <MetricRow 
            label="Renewal % Score" 
            earned={renewal.renewalPercentScore} 
            max={10}
            tooltip="% of eligible leases successfully renewed. Target: 80%+."
          />
          <MetricRow 
            label="Home Insurance" 
            earned={renewal.homeInsurance} 
            max={5}
            tooltip="% of properties with active home insurance."
          />
        </PillarCard>
      </div>
    </section>
  );
};
