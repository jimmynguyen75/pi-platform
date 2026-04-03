import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, Users, Settings, Search, Bell, LogOut,
  Globe, ChevronLeft, ChevronRight, AlertTriangle, Crown,
  Handshake,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { dashboardApi } from '../../api/dashboard';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { cn } from '../../lib/utils';

const NAV = [
  { path: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/partners', icon: Handshake,       label: 'Partners' },
  { path: '/managers', icon: Users,           label: 'Managers' },
];
const ADMIN_NAV = { path: '/admin', icon: Settings, label: 'Admin Panel' };

function NavItem({
  icon: Icon, label, active, collapsed, badge,
  onClick,
}: {
  icon: React.ElementType; label: string;
  active: boolean; collapsed: boolean; badge?: number;
  onClick: () => void;
}) {
  const btn = (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative',
        active
          ? 'bg-white/12 text-white'
          : 'text-slate-400 hover:text-white hover:bg-white/8'
      )}
    >
      <Icon className={cn('w-4.5 h-4.5 shrink-0', active ? 'text-white' : 'text-slate-400 group-hover:text-white')} size={18} />
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && badge ? (
        <span className="ml-auto bg-amber-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none">
          {badge}
        </span>
      ) : null}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r-full" />
      )}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }
  return btn;
}

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth, setGlobalSearch, globalSearch } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 60_000,
  });

  const riskCount = stats?.byStatus?.risk ?? 0;

  const activeKey = (() => {
    const p = location.pathname;
    if (p.startsWith('/partners')) return '/partners';
    if (p.startsWith('/managers')) return '/managers';
    if (p.startsWith('/admin')) return '/admin';
    return '/';
  })();

  const navItems = [...NAV, ...(user?.role === 'admin' ? [ADMIN_NAV] : [])];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-slate-950 transition-all duration-200 shrink-0 relative z-40',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 border-b border-white/6 px-4 gap-3 shrink-0',
          collapsed && 'justify-center px-0'
        )}>
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-indigo-900/40">
            PI
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-tight">PI Platform</p>
              <p className="text-slate-500 text-[10px] leading-tight truncate">Partner Intelligence</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Navigation
            </p>
          )}
          {navItems.map(({ path, icon, label }) => (
            <NavItem
              key={path}
              icon={icon}
              label={label}
              active={activeKey === path}
              collapsed={collapsed}
              badge={path === '/partners' && riskCount > 0 ? riskCount : undefined}
              onClick={() => navigate(path)}
            />
          ))}
        </nav>

        {/* Risk alert (expanded only) */}
        {!collapsed && riskCount > 0 && (
          <div className="px-2 pb-3">
            <button
              onClick={() => navigate('/partners?status=Risk')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left hover:bg-amber-500/15 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-amber-400 text-xs font-semibold">{riskCount} At Risk</p>
                <p className="text-slate-500 text-[10px]">Click to review</p>
              </div>
            </button>
          </div>
        )}

        {/* Collapse toggle */}
        <div className="border-t border-white/6 p-2 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/8 transition-all text-xs"
          >
            {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-30">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search partners..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && globalSearch) navigate(`/partners?search=${encodeURIComponent(globalSearch)}`);
              }}
              className="w-full pl-9 pr-4 h-9 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate('/partners?status=Risk')}
                  className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  <Bell size={16} />
                  {riskCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {riskCount > 9 ? '9+' : riskCount}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>{riskCount} partner{riskCount !== 1 ? 's' : ''} at risk</TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none">
                  <Avatar size="sm">
                    <AvatarFallback gradient={user?.role === 'admin' ? 'purple' : 'indigo'}>
                      {user?.name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name}</p>
                    <p className="text-xs text-gray-500 leading-tight capitalize">{user?.role}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  {user?.title && <p className="text-xs text-gray-500 mt-0.5">{user.title}</p>}
                  <div className="mt-1.5">
                    <Badge variant={user?.role === 'admin' ? 'purple' : 'primary'} className="text-[10px]">
                      {user?.role === 'admin' && <Crown size={10} className="mr-1" />}
                      {user?.role?.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.open('/public', '_blank')}>
                  <Globe size={14} />
                  Public Directory
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  danger
                  onClick={() => { clearAuth(); navigate('/login'); }}
                >
                  <LogOut size={14} />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
