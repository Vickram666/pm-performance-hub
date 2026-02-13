import { useState, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Users, BarChart3, Calendar, PieChart } from 'lucide-react';
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
import { NotificationBell } from '@/components/renewal/NotificationBell';
import { RenewalAnalyticsDashboard } from '@/components/renewal/RenewalAnalyticsDashboard';
import { 
  allRenewals, 
  filterRenewals, 
  calculateFunnelStats,
  getPMRenewalSummaries,
  getLeadershipStats,
  getPMActionItems,
  getAnalyticsStats
} from '@/data/renewalData';
import { RenewalRecord, RenewalFilters as FiltersType, RenewalStage, VALID_STAGE_TRANSITIONS, ActionLogEntry } from '@/types/renewal';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { checkAndNotifyRedRiskRenewals } from '@/services/notificationService';

type ViewMode = 'pm' | 'tl' | 'leadership' | 'analytics';

// Action key to next stage mapping
const actionToStage: Record<string, RenewalStage> = {
  start_renewal: 'negotiation_in_progress',
  send_proposal: 'proposal_sent',
  send_owner_ack: 'proposal_sent', // Owner ack opens the flow, doesn't advance stage directly
  upload_agreement: 'agreement_uploaded',
  punch_tcf: 'tcf_created',
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

  useMemo(() => {
    checkAndNotifyRedRiskRenewals(renewals);
  }, [renewals]);

  const cities = useMemo(() => 
    [...new Set(renewals.map(r => r.property.city))].sort(),
    [renewals]
  );
  const zones = useMemo(() => 
    [...new Set(renewals.map(r => r.property.zone))].sort(),
    [renewals]
  );

  const filteredRenewals = useMemo(() => {
    let baseFilters = { ...filters };
    if (viewMode === 'pm') {
      baseFilters.pmId = pmId;
    }
    return filterRenewals(renewals, baseFilters);
  }, [filters, viewMode, pmId, renewals]);

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

  const analyticsStats = useMemo(() =>
    getAnalyticsStats(renewals),
    [renewals]
  );

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

  const handleNextAction = useCallback((renewal: RenewalRecord, actionKey: string) => {
    // send_owner_ack opens the modal flow - handled by detail modal
    if (actionKey === 'send_owner_ack' || actionKey === 'upload_agreement') {
      setSelectedRenewal(renewal);
      return;
    }

    const nextStage = actionToStage[actionKey];
    if (!nextStage) {
      toast.error('Unknown action');
      return;
    }

    const validTransitions = VALID_STAGE_TRANSITIONS[renewal.status.currentStage];
    if (!validTransitions.includes(nextStage)) {
      toast.error('Invalid stage transition. Follow the renewal process in order.');
      return;
    }

    const newLogEntry: ActionLogEntry = {
      id: `LOG${Date.now()}`,
      action: getActionLabel(actionKey),
      actionBy: renewal.property.assignedPM,
      source: 'PM',
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      stageFrom: renewal.status.currentStage,
      stageTo: nextStage,
    };

    const updated: RenewalRecord = {
      ...renewal,
      status: {
        ...renewal.status,
        currentStage: nextStage,
        lastActionDate: format(new Date(), 'yyyy-MM-dd'),
        stageEnteredAt: format(new Date(), 'yyyy-MM-dd'),
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
            
            <NotificationBell 
              onNotificationClick={(notification) => {
                const renewal = renewals.find(r => r.id === notification.renewalId);
                if (renewal) {
                  setSelectedRenewal(renewal);
                }
              }}
            />
            
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
                <TabsTrigger value="analytics" className="gap-2">
                  <PieChart className="h-4 w-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {viewMode === 'pm' && (
          <>
            <RenewalSummaryStrip stats={funnelStats} />
            <PMActionList 
              needsActionToday={pmActionItems.needsActionToday}
              onRenewalClick={setSelectedRenewal}
            />
            <RenewalFunnel 
              stats={funnelStats} 
              onBucketClick={handleBucketClick}
            />
            <RenewalFilters
              filters={filters}
              onFiltersChange={setFilters}
              cities={cities}
              zones={zones}
              activeFilterCount={activeFilterCount}
            />
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

        {viewMode === 'analytics' && (
          <RenewalAnalyticsDashboard 
            stats={analyticsStats}
            renewals={renewals}
            cities={cities}
          />
        )}

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
    send_owner_ack: 'Sent owner acknowledgement request',
    upload_agreement: 'Uploaded renewal agreement',
    punch_tcf: 'TCF created successfully',
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
    agreement_uploaded: 'Agreement Uploaded',
    tcf_created: 'TCF Created',
    pms_renewed: 'PMS Renewed',
    renewal_completed: 'Completed',
    renewal_failed: 'Failed',
  };
  return labels[stage] || stage;
}
