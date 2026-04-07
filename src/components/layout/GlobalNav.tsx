import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Trophy, Home, RefreshCw, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { allProperties } from '@/data/propertyData';
import { allRenewals } from '@/data/renewalData';

export function GlobalNav() {
  const location = useLocation();
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

  const navItems = [
    { to: '/', label: 'Dashboard', icon: BarChart3, badge: 0 },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy, badge: 0 },
    { to: '/properties', label: 'Properties', icon: Home, badge: counts.highRiskProperties },
    { to: '/renewals', label: 'Renewals', icon: RefreshCw, badge: counts.redRenewals },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-[60] bg-card/95 backdrop-blur-md border-b shadow-sm">
      <div className="container flex items-center justify-between h-14">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <BarChart3 className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">Azuro</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon, badge }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative',
                isActive(to)
                  ? 'bg-primary/10 text-primary shadow-sm'
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
          <div className="container py-2 space-y-1">
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
      )}
    </nav>
  );
}
