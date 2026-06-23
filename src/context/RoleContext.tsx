import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Role = 'pm' | 'tl' | 'city' | 'leadership';

export const ROLE_META: Record<Role, { label: string; short: string; home: string; subtitle: string }> = {
  pm: { label: 'Property Manager', short: 'PM', home: '/pm', subtitle: 'Operational Inbox' },
  tl: { label: 'Team Lead', short: 'TL', home: '/tl', subtitle: 'War Room' },
  city: { label: 'City Lead', short: 'City', home: '/city', subtitle: 'Strategic View' },
  leadership: { label: 'Leadership', short: 'CEO', home: '/leadership', subtitle: 'Executive Snapshot' },
};

const STORAGE_KEY = 'azuro:acc:role';

interface RoleContextValue {
  role: Role;
  setRole: (r: Role) => void;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY) as Role | null;
      if (v && ['pm', 'tl', 'city', 'leadership'].includes(v)) return v;
    } catch {}
    return 'pm';
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, role); } catch {}
  }, [role]);

  return (
    <RoleContext.Provider value={{ role, setRole: setRoleState }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used inside RoleProvider');
  return ctx;
}
