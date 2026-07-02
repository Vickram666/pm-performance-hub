import { ChevronRight, Crown, MapPin, Users, Briefcase, X } from 'lucide-react';
import { useScope } from '@/context/ScopeContext';
import { useRole } from '@/context/RoleContext';
import { cn } from '@/lib/utils';

/**
 * Persistent hierarchical breadcrumb: CEO › City › TL › PM.
 * Click any crumb to jump up. Shown on every ACC page.
 */
export function ScopeBreadcrumb({ className }: { className?: string }) {
  const { scope, resetToRole, drillCity, drillTL, clearScope } = useScope();
  const { role } = useRole();

  const crumbs: { label: string; icon: React.ComponentType<{ className?: string }>; onClick?: () => void; active?: boolean }[] = [
    { label: 'CEO', icon: Crown, onClick: () => resetToRole('leadership'), active: role === 'leadership' && !scope.city },
  ];
  if (scope.city) crumbs.push({ label: scope.city, icon: MapPin, onClick: () => drillCity(scope.city!), active: role === 'city' && !scope.tl && !scope.pm });
  if (scope.tl) crumbs.push({ label: `TL ${scope.tl}`, icon: Users, onClick: () => drillTL({ city: scope.city!, tl: scope.tl! }), active: role === 'tl' && !scope.pm });
  if (scope.pm) crumbs.push({ label: scope.pmName || `PM ${scope.pm}`, icon: Briefcase, active: role === 'pm' });

  const anyScope = scope.city || scope.tl || scope.pm;

  return (
    <div className={cn('flex items-center gap-1 text-[11px] flex-wrap', className)}>
      {crumbs.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            <button
              type="button"
              onClick={c.onClick}
              disabled={!c.onClick}
              className={cn(
                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors',
                c.active ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                !c.onClick && 'cursor-default',
              )}
            >
              <Icon className="h-3 w-3" />
              {c.label}
            </button>
          </div>
        );
      })}
      {anyScope && (
        <button
          type="button"
          onClick={clearScope}
          className="ml-1 inline-flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground px-1 py-0.5 rounded"
          title="Clear scope"
        >
          <X className="h-3 w-3" /> clear
        </button>
      )}
    </div>
  );
}
