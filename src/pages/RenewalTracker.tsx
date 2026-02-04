import { useState, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Users, BarChart3, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RenewalFunnel } from '@/components/renewal/RenewalFunnel';
import { RenewalFilters } from '@/components/renewal/RenewalFilters';
import { RenewalTable } from '@/components/renewal/RenewalTable';
import { RenewalDetailModal } from '@/components/renewal/RenewalDetailModal';
import { PMActionList } from '@/components/renewal/PMActionList';
import { TLDashboard } from '@/components/renewal/TLDashboard';
import { LeadershipDashboard } from '@/components/renewal/LeadershipDashboard';
import { RenewalSummaryStrip } from '@/components/renewal/RenewalSummaryStrip';
import { 
  allRenewals, 
  filterRenewals, 
  calculateFunnelStats,
  getPMRenewalSummaries,
  getLeadershipStats,
  getPMActionItems
} from '@/data/renewalData';
import { RenewalRecord, RenewalFilters as FiltersType, RenewalStage, VALID_STAGE_TRANSITIONS, ActionLogEntry } from '@/types/renewal';
import { toast } from 'sonner';
import { format } from 'date-fns';

type ViewMode = 'pm' | 'tl' | 'leadership';

// Action key to next stage mapping
const actionToStage: Record<string, RenewalStage> = {
  start_renewal: 'negotiation_in_progress',
  send_proposal: 'proposal_sent',
  send_agreement: 'agreement_sent',
  upload_agreement: 'agreement_uploaded',
  punch_tcf: 'tcf_completed',
  renew_pms: 'pms_renewed',
  close_renewal: 'renewal_completed',
};

export default function RenewalTracker() {
  const [searchParams] = useSearchParams();
  const pmId = searchParams.get('pmId') || 'PM001';
  
  const [viewMode, setViewMode] = useState<ViewMode>('pm');
  const [renewals, setRenewals] = useState<RenewalRecord[]>(() => allRenewals);
  const [filters, setFilters] = useState<FiltersType>({
    expiryBucket: 'all',
    searchQuery: '',
  });
  const [selectedRenewal, setSelectedRenewal] = useState<RenewalRecord | null>(null);

  // Get unique cities and zones
  const cities = useMemo(() => 
    [...new Set(renewals.map(r => r.property.city))].sort(),
    [renewals]
  );
  const zones = useMemo(() => 
    [...new Set(renewals.map(r => r.property.zone))].sort(),
    [renewals]
  );

  // Filter renewals based on view mode
  const filteredRenewals = useMemo(() => {
    let baseFilters = { ...filters };
    if (viewMode === 'pm') {
      baseFilters.pmId = pmId;
    }
    return filterRenewals(renewals, baseFilters);
  }, [filters, viewMode, pmId, renewals]);

  // Calculate stats
  const funnelStats = useMemo(() => 
    calculateFunnelStats(filteredRenewals),
    [filteredRenewals]
  );

  const pmSummaries = useMemo(() => 
    getPMRenewalSummaries(renewals),
    [renewals]
  );

  const leadershipStats = useMemo(() => 
    getLeadershipStats(renewals),
    [renewals]
  );

  const pmActionItems = useMemo(() => 
    getPMActionItems(renewals, pmId),
    [renewals, pmId]
  );

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.city) count++;
    if (filters.zone) count++;
    if (filters.riskLevel) count++;
    if (filters.stage) count++;
    if (filters.expiryBucket && filters.expiryBucket !== 'all') count++;
    if (filters.searchQuery) count++;
    if (filters.noticePeriod) count++;
    return count;
  }, [filters]);

  const handleBucketClick = (bucket: string) => {
    setFilters(prev => ({ 
      ...prev, 
      expiryBucket: bucket as FiltersType['expiryBucket'] 
    }));
  };

  // Handle next action - system-driven stage advancement
  const handleNextAction = useCallback((renewal: RenewalRecord, actionKey: string) => {
    const nextStage = actionToStage[actionKey];
    if (!nextStage) {
      toast.error('Unknown action');
      return;
    }

    // Validate transition
    const validTransitions = VALID_STAGE_TRANSITIONS[renewal.status.currentStage];
    if (!validTransitions.includes(nextStage)) {
      toast.error('Invalid stage transition. Follow the renewal process in order.');
      return;
    }

    // Create action log entry
    const newLogEntry: ActionLogEntry = {
      id: `LOG${Date.now()}`,
      action: getActionLabel(actionKey),
      actionBy: renewal.property.assignedPM,
      source: 'PM',
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      stageFrom: renewal.status.currentStage,
      stageTo: nextStage,
    };

    // Update renewal
    const updated: RenewalRecord = {
      ...renewal,
      status: {
        ...renewal.status,
        currentStage: nextStage,
        lastActionDate: format(new Date(), 'yyyy-MM-dd'),
        agreementSigned: nextStage === 'agreement_signed' ? true : renewal.status.agreementSigned,
        agreementUploaded: nextStage === 'agreement_uploaded' ? true : renewal.status.agreementUploaded,
      },
      actionLog: [...renewal.actionLog, newLogEntry],
      updatedAt: format(new Date(), 'yyyy-MM-dd'),
    };

    setRenewals(prev => prev.map(r => r.id === updated.id ? updated : r));
    
    if (selectedRenewal?.id === renewal.id) {
      setSelectedRenewal(updated);
    }

    toast.success(`Stage updated to: ${getStageLabel(nextStage)}`);
  }, [selectedRenewal]);

  const handleRenewalUpdate = useCallback((updated: RenewalRecord) => {
    setRenewals(prev => prev.map(r => r.id === updated.id ? updated : r));
    setSelectedRenewal(updated);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <RefreshCw className="h-6 w-6 text-primary" />
                  Renewal Tracker
                </h1>
                <p className="text-sm text-muted-foreground">
                  Action-driven • System-enforced • Audit-proof
                </p>
              </div>
            </div>
            
            {/* View Mode Tabs */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="pm" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  PM View
                </TabsTrigger>
                <TabsTrigger value="tl" className="gap-2">
                  <Users className="h-4 w-4" />
                  TL View
                </TabsTrigger>
                <TabsTrigger value="leadership" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Leadership
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 space-y-6">
        {viewMode === 'pm' && (
          <>
            {/* Summary Strip */}
            <RenewalSummaryStrip stats={funnelStats} />

            {/* Action List */}
            <PMActionList 
              needsActionToday={pmActionItems.needsActionToday}
              onRenewalClick={setSelectedRenewal}
            />

            {/* Funnel Stats */}
            <RenewalFunnel 
              stats={funnelStats} 
              onBucketClick={handleBucketClick}
            />

            {/* Filters */}
            <RenewalFilters
              filters={filters}
              onFiltersChange={setFilters}
              cities={cities}
              zones={zones}
              activeFilterCount={activeFilterCount}
            />

            {/* Renewal Table */}
            <RenewalTable
              renewals={filteredRenewals}
              onRenewalClick={setSelectedRenewal}
              onNextAction={handleNextAction}
            />
          </>
        )}

        {viewMode === 'tl' && (
          <TLDashboard pmSummaries={pmSummaries} />
        )}

        {viewMode === 'leadership' && (
          <LeadershipDashboard stats={leadershipStats} />
        )}

        {/* Detail Modal */}
        <RenewalDetailModal
          renewal={selectedRenewal}
          open={!!selectedRenewal}
          onClose={() => setSelectedRenewal(null)}
          onRenewalUpdate={handleRenewalUpdate}
          onNextAction={handleNextAction}
        />
      </main>
    </div>
  );
}

function getActionLabel(actionKey: string): string {
  const labels: Record<string, string> = {
    start_renewal: 'Started renewal discussion',
    send_proposal: 'Sent renewal proposal to owner',
    send_agreement: 'Sent agreement for signature',
    upload_agreement: 'Uploaded signed agreement',
    punch_tcf: 'TCF punched successfully',
    renew_pms: 'PMS subscription renewed',
    close_renewal: 'Renewal marked complete',
  };
  return labels[actionKey] || 'Action performed';
}

function getStageLabel(stage: RenewalStage): string {
  const labels: Record<RenewalStage, string> = {
    renewal_not_started: 'Not Started',
    negotiation_in_progress: 'Negotiation In Progress',
    proposal_sent: 'Proposal Sent',
    owner_acknowledged: 'Owner Acknowledged',
    agreement_sent: 'Agreement Sent',
    agreement_signed: 'Agreement Signed',
    agreement_uploaded: 'Agreement Uploaded',
    tcf_completed: 'TCF Completed',
    pms_renewed: 'PMS Renewed',
    renewal_completed: 'Completed',
    renewal_failed: 'Failed',
  };
  return labels[stage] || stage;
}
