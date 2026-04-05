import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, Users, Settings, Search, Bell, LogOut,
  Globe, ChevronLeft, ChevronRight, AlertTriangle, Crown,
  Handshake, Briefcase, Wallet, Menu, X, User,
  ShieldAlert, Clock, TrendingUp, CheckCheck,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
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
import { useI18n } from '../../lib/i18n';
import type { Partner } from '../../types';

const NAV_DEFS = [
  { path: '/',         icon: LayoutDashboard, key: 'dashboard' as const },
  { path: '/partners', icon: Handshake,       key: 'partners' as const },
  { path: '/deals',    icon: Briefcase,       key: 'deals' as const },
  { path: '/funds',    icon: Wallet,          key: 'funds' as const },
  { path: '/managers', icon: Users,           key: 'managers' as const },
];
const ADMIN_NAV_DEF = { path: '/admin', icon: Settings, key: 'adminPanel' as const };

function NavItem({
  icon: Icon, label, active, collapsed, badge, onClick,
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
        active ? 'bg-white/12 text-white' : 'text-slate-400 hover:text-white hover:bg-white/8'
      )}
    >
      <Icon className={cn('w-4.5 h-4.5 shrink-0', active ? 'text-white' : 'text-slate-400 group-hover:text-white')} size={18} />
      {!collapsed && <span className="truncate">{label}</span>}
      {!collapsed && badge ? (
        <span className="ml-auto bg-amber-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none">
          {badge}
        </span>
      ) : null}
      {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-400 rounded-r-full" />}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent side="right">{label}{badge ? ` (${badge})` : ''}</TooltipContent>
      </Tooltip>
    );
  }
  return btn;
}

interface Notification {
  id: string;
  type: 'risk' | 'deal' | 'fund' | 'info';
  title: string;
  body: string;
  time: string;
  read: boolean;
  href?: string;
}

function buildNotifications(riskPartners: Partner[]): Notification[] {
  const notes: Notification[] = [];
  for (const p of riskPartners.slice(0, 5)) {
    notes.push({
      id: `risk-${p.id}`,
      type: 'risk',
      title: 'Partner At Risk',
      body: `${p.name} has a low health score (${p.healthScore})`,
      time: dayjs().subtract(Math.floor(Math.random() * 120), 'minute').fromNow(),
      read: false,
      href: `/partners/${p.id}`,
    });
  }
  return notes;
}

function NotificationBell({ riskPartners }: { riskPartners: Partner[] }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  const notifications = buildNotifications(riskPartners);
  const unread = notifications.filter(n => !readIds.has(n.id)).length;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAll = () => setReadIds(new Set(notifications.map(n => n.id)));

  const typeIcon: Record<Notification['type'], React.ReactNode> = {
    risk:  <ShieldAlert size={14} className="text-amber-500" />,
    deal:  <TrendingUp  size={14} className="text-blue-500" />,
    fund:  <Wallet      size={14} className="text-purple-500" />,
    info:  <Bell        size={14} className="text-gray-400" />,
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-900 text-sm">{t('notifications')}</p>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <CheckCheck size={12} /> {t('markAllRead')}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-gray-400">
                <Bell size={28} className="mb-2 opacity-30" />
                <p className="text-sm">{t('noNotifications')}</p>
              </div>
            ) : (
              notifications.map(n => {
                const isRead = readIds.has(n.id);
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      setReadIds(prev => new Set([...prev, n.id]));
                      if (n.href) { navigate(n.href); setOpen(false); }
                    }}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left',
                      !isRead && 'bg-indigo-50/40'
                    )}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      {typeIcon[n.type]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-gray-900">{n.title}</p>
                        {!isRead && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                        <Clock size={10} />{n.time}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-gray-100 px-4 py-2.5">
            <button
              onClick={() => { navigate('/partners?status=Risk'); setOpen(false); }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {t('viewAllRisk')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth, setGlobalSearch, globalSearch } = useAppStore();
  const { lang, setLang, t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 60_000,
  });

  const { data: riskPartners = [] } = useQuery({
    queryKey: ['risk-partners'],
    queryFn: dashboardApi.getRiskPartners,
    refetchInterval: 60_000,
  });

  const riskCount = stats?.byStatus?.risk ?? 0;

  const activeKey = (() => {
    const p = location.pathname;
    if (p.startsWith('/partners')) return '/partners';
    if (p.startsWith('/deals')) return '/deals';
    if (p.startsWith('/funds')) return '/funds';
    if (p.startsWith('/managers')) return '/managers';
    if (p.startsWith('/admin')) return '/admin';
    if (p.startsWith('/account')) return '/account';
    return '/';
  })();

  const NAV = NAV_DEFS.map(n => ({ ...n, label: t(n.key) }));
  const ADMIN_NAV = { ...ADMIN_NAV_DEF, label: t(ADMIN_NAV_DEF.key) };
  const navItems = [...NAV, ...(user?.role === 'admin' ? [ADMIN_NAV] : [])];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 border-b border-white/6 px-4 gap-3 shrink-0',
        !mobile && collapsed && 'justify-center px-0'
      )}>
        <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-indigo-900/40">
          PI
        </div>
        {(mobile || !collapsed) && (
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight">PI Platform</p>
            <p className="text-slate-500 text-[10px] leading-tight truncate">Partner Intelligence</p>
          </div>
        )}
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {(!mobile && !collapsed) || mobile ? (
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Navigation
          </p>
        ) : null}
        {navItems.map(({ path, icon, label }) => (
          <NavItem
            key={path}
            icon={icon}
            label={label}
            active={activeKey === path}
            collapsed={!mobile && collapsed}
            badge={path === '/partners' && riskCount > 0 ? riskCount : undefined}
            onClick={() => handleNav(path)}
          />
        ))}
      </nav>

      {/* Risk alert */}
      {(mobile || !collapsed) && riskCount > 0 && (
        <div className="px-2 pb-3">
          <button
            onClick={() => handleNav('/partners?status=Risk')}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left hover:bg-amber-500/15 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-amber-400 text-xs font-semibold">{riskCount} {t('atRisk')}</p>
              <p className="text-slate-500 text-[10px]">{t('clickReview')}</p>
            </div>
          </button>
        </div>
      )}

      {/* Collapse toggle (desktop only) */}
      {!mobile && (
        <div className="border-t border-white/6 p-2 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/8 transition-all text-xs"
          >
            {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>{t('collapse')}</span></>}
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-slate-950 transition-transform duration-200 lg:hidden',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent mobile />
      </aside>

      {/* Desktop sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col bg-slate-950 transition-all duration-200 shrink-0 relative z-40',
        collapsed ? 'w-16' : 'w-56'
      )}>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-3 sm:px-6 shrink-0 z-30">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-500 hover:bg-gray-100 mr-2"
          >
            <Menu size={18} />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-xs sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder={t('search')}
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && globalSearch) navigate(`/partners?search=${encodeURIComponent(globalSearch)}`);
              }}
              className="w-full pl-9 pr-4 h-9 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-3">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'vi' : 'en')}
              className="h-9 px-2.5 flex items-center gap-1 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors text-xs font-semibold"
            >
              {lang === 'en' ? '🇻🇳 VI' : '🇬🇧 EN'}
            </button>

            <NotificationBell riskPartners={riskPartners} />

            <div className="w-px h-6 bg-gray-200 mx-0.5 hidden sm:block" />

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 sm:gap-2.5 px-1.5 sm:px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none">
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
                <DropdownMenuItem onClick={() => navigate('/account')}>
                  <User size={14} />
                  {t('myAccount')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open('/public', '_blank')}>
                  <Globe size={14} />
                  {t('publicDirectory')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem danger onClick={() => { clearAuth(); navigate('/login'); }}>
                  <LogOut size={14} />
                  {t('signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
