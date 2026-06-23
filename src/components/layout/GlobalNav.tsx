import { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Trophy, Home, RefreshCw, Menu, X,
  Briefcase, Users, MapPin, Crown, ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { allProperties } from '@/data/propertyData';
import { allRenewals } from '@/data/renewalData';
import { useRole, ROLE_META, Role } from '@/context/RoleContext';

const ROLE_ICONS: Record<Role, typeof Briefcase> = {
  pm: Briefcase,
  tl: Users,
  city: MapPin,
  leadership: Crown,
};

export function GlobalNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, setRole } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);

  const counts = useMemo(() => {
    const redRenewals = allRenewals.filter(
      r => r.status.riskLevel === 'red' &&
      r.status.currentStage !== 'renewal_completed' &&
      r.status.currentStage !== 'renewal_failed'
    ).length;
    const highRiskProperties = allProperties.filter(p => p.riskLevel === 'high').length;
    return { redRenewals, highRiskProperties };
  }, []);

  const roleNav = ROLE_META[role];
  const RoleIcon = ROLE_ICONS[role];

  const navItems = [
    { to: roleNav.home, label: 'Command', icon: LayoutDashboard, badge: 0 },
    { to: '/properties', label: 'Properties', icon: Home, badge: counts.highRiskProperties },
    { to: '/renewals', label: 'Renewals', icon: RefreshCw, badge: counts.redRenewals },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy, badge: 0 },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const switchRole = (r: Role) => {
    setRole(r);
    navigate(ROLE_META[r].home);
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-[60] bg-card/95 backdrop-blur-md border-b shadow-sm">
      <div className="container flex items-center justify-between h-14">
        {/* Brand + Role */}
        <div className="flex items-center gap-3">
          <Link to={roleNav.home} className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center shadow-md">
              <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-base tracking-tight block">Azuro</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Command Center</span>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md border bg-muted/40 hover:bg-muted transition-colors">
                <RoleIcon className="h-3.5 w-3.5" />
                <span>{roleNav.label}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Switch role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(ROLE_META) as Role[]).map(r => {
                const Icon = ROLE_ICONS[r];
                return (
                  <DropdownMenuItem key={r} onClick={() => switchRole(r)} className="gap-2">
                    <Icon className="h-4 w-4" />
                    <div className="flex-1">
                      <p className="text-sm">{ROLE_META[r].label}</p>
                      <p className="text-[11px] text-muted-foreground">{ROLE_META[r].subtitle}</p>
                    </div>
                    {role === r && <Badge variant="secondary" className="text-[10px]">Active</Badge>}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon, badge }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all relative',
                isActive(to)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {badge > 0 && (
                <Badge className="h-5 min-w-[20px] flex items-center justify-center p-0 px-1.5 text-[10px] bg-destructive text-destructive-foreground">
                  {badge}
                </Badge>
              )}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-card animate-in slide-in-from-top-2 duration-200">
          <div className="container py-3 space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-1 mb-1">Role</p>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(ROLE_META) as Role[]).map(r => {
                  const Icon = ROLE_ICONS[r];
                  return (
                    <button
                      key={r}
                      onClick={() => switchRole(r)}
                      className={cn(
                        'flex items-center gap-2 px-2 py-2 rounded-md text-xs border transition-colors',
                        role === r ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border hover:bg-muted/60',
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {ROLE_META[r].short}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              {navItems.map(({ to, label, icon: Icon, badge }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all',
                    isActive(to)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  {badge > 0 && (
                    <Badge className="h-5 min-w-[20px] flex items-center justify-center p-0 px-1.5 text-[10px] bg-destructive text-destructive-foreground ml-auto">
                      {badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
