import { Badge } from '@/components/ui/badge';
import { RenewalStage, RENEWAL_STAGE_LABELS } from '@/types/renewal';
import { 
  Circle, 
  Play, 
  MessageSquare, 
  Clock, 
  Send, 
  FileCheck, 
  Receipt, 
  RefreshCw,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface RenewalStageBadgeProps {
  stage: RenewalStage;
  showIcon?: boolean;
}

const stageConfig: Record<RenewalStage, { icon: any; className: string }> = {
  not_started: { 
    icon: Circle, 
    className: 'bg-slate-500/20 text-slate-400 border-slate-500/30' 
  },
  renewal_initiated: { 
    icon: Play, 
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
  },
  negotiation_in_progress: { 
    icon: MessageSquare, 
    className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
  },
  owner_acknowledgement_pending: { 
    icon: Clock, 
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
  },
  agreement_sent: { 
    icon: Send, 
    className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' 
  },
  agreement_signed: { 
    icon: FileCheck, 
    className: 'bg-teal-500/20 text-teal-400 border-teal-500/30' 
  },
  tcf_completed: { 
    icon: Receipt, 
    className: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' 
  },
  pms_renewed: { 
    icon: RefreshCw, 
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
  },
  renewal_completed: { 
    icon: CheckCircle2, 
    className: 'bg-green-500/20 text-green-400 border-green-500/30' 
  },
  renewal_failed: { 
    icon: XCircle, 
    className: 'bg-red-500/20 text-red-400 border-red-500/30' 
  },
};

export function RenewalStageBadge({ stage, showIcon = true }: RenewalStageBadgeProps) {
  const { icon: Icon, className } = stageConfig[stage];

  return (
    <Badge variant="outline" className={`${className} text-xs`}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {RENEWAL_STAGE_LABELS[stage]}
    </Badge>
  );
}
