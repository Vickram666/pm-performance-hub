import { createContext, useContext, useMemo, useCallback, ReactNode } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useRole, ROLE_META, Role } from './RoleContext';

/**
 * Scope drives the "drill-down drill-across" behavior:
 * Leadership → click city → City view filtered
 * City → click PM row → TL view filtered to that PM's TL / city
 * TL → click PM → PM view filtered to that PM
 * PM → click property → PropertyDetailModal
 *
 * Scope is URL-driven so it's shareable, back-button friendly, and survives refresh.
 */
export interface Scope {
  city?: string;
  tl?: string;
  pm?: string;
  pmName?: string;
}

interface ScopeContextValue {
  scope: Scope;
  /** Drill down into a city — switches to City view scoped to that city. */
  drillCity: (city: string) => void;
  /** Drill into a TL for a city. */
  drillTL: (opts: { city: string; tl: string }) => void;
  /** Drill into a PM — switches to PM view scoped to that PM. */
  drillPM: (opts: { city?: string; pm: string; pmName?: string }) => void;
  /** Reset to a role's default (clears scope, keeps role). */
  resetToRole: (r: Role) => void;
  /** Clear scope entirely for current role. */
  clearScope: () => void;
}

const ScopeContext = createContext<ScopeContextValue | null>(null);

export function ScopeProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { setRole } = useRole();

  const scope: Scope = useMemo(() => ({
    city: params.get('city') || undefined,
    tl: params.get('tl') || undefined,
    pm: params.get('pm') || undefined,
    pmName: params.get('pmName') || undefined,
  }), [params]);

  const push = useCallback((role: Role, next: Scope) => {
    setRole(role);
    const search = new URLSearchParams();
    if (next.city) search.set('city', next.city);
    if (next.tl) search.set('tl', next.tl);
    if (next.pm) search.set('pm', next.pm);
    if (next.pmName) search.set('pmName', next.pmName);
    const qs = search.toString();
    navigate(`${ROLE_META[role].home}${qs ? '?' + qs : ''}`);
  }, [navigate, setRole]);

  const drillCity = useCallback((city: string) => push('city', { city }), [push]);
  const drillTL = useCallback((opts: { city: string; tl: string }) => push('tl', opts), [push]);
  const drillPM = useCallback((opts: { city?: string; pm: string; pmName?: string }) => push('pm', opts), [push]);
  const resetToRole = useCallback((r: Role) => push(r, {}), [push]);
  const clearScope = useCallback(() => setParams(new URLSearchParams()), [setParams]);

  return (
    <ScopeContext.Provider value={{ scope, drillCity, drillTL, drillPM, resetToRole, clearScope }}>
      {children}
    </ScopeContext.Provider>
  );
}

export function useScope() {
  const ctx = useContext(ScopeContext);
  if (!ctx) throw new Error('useScope must be used inside ScopeProvider');
  return ctx;
}
