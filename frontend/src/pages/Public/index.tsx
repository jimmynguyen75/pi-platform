import { useState } from 'react';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Search, Globe, Mail, Phone, User, MapPin, Link2, ExternalLink,
  X, Lock, ChevronRight, Building2,
} from 'lucide-react';
import dayjs from 'dayjs';
import { partnersApi } from '../../api/partners';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import type { Partner, OfficialLink, ContactInfo } from '../../types';
import { useDebounce } from '../../hooks/useDebounce';
import { cn } from '../../lib/utils';
import { TooltipProvider } from '../../components/ui/tooltip';

const publicQueryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

const PRIORITY_ORDER = ['Strategic', 'Key', 'Normal'] as const;

function PartnerCard({ partner, onClick }: { partner: Partner; onClick: () => void }) {
  const acts = partner.activities ?? [];
  const lastActivity = acts.length > 0
    ? dayjs().diff(dayjs([...acts].sort((a, b) => a.date < b.date ? 1 : -1)[0].date), 'day')
    : null;
  const scoreColor = partner.healthScore >= 70 ? '#16a34a' : partner.healthScore >= 40 ? '#d97706' : '#dc2626';

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 p-4 group"
    >
      <div className="flex items-start gap-3">
        {partner.logoUrl ? (
          <img src={partner.logoUrl} alt={partner.name} className="w-11 h-11 rounded-xl object-contain bg-gray-50 border border-gray-100 shrink-0" />
        ) : (
          <Avatar size="md">
            <AvatarFallback gradient={partner.priorityLevel === 'Strategic' ? 'purple' : 'indigo'}>
              {partner.name[0]}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{partner.name}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            {partner.domain && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                style={{ background: `${partner.domain.colorHex}18`, color: partner.domain.colorHex }}
              >
                {partner.domain.name}
              </span>
            )}
            <PriorityBadge priority={partner.priorityLevel} />
            <StatusBadge status={partner.status} />
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-black leading-none" style={{ color: scoreColor }}>{partner.healthScore}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">health</p>
        </div>
      </div>

      <div className="mt-3">
        <Progress value={partner.healthScore} indicatorColor={scoreColor} className="h-1" />
      </div>

      {partner.description && (
        <p className="mt-2.5 text-xs text-gray-500 line-clamp-2 leading-relaxed">{partner.description}</p>
      )}

      {lastActivity !== null && (
        <p className={cn('mt-2 text-[10px] font-medium', lastActivity > 30 ? 'text-amber-500' : 'text-green-500')}>
          Last activity: {lastActivity === 0 ? 'today' : `${lastActivity}d ago`}
        </p>
      )}

      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {partner.manager && (
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <User size={10} />
              {partner.manager.name}
            </div>
          )}
        </div>
        <ChevronRight size={13} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
      </div>
    </button>
  );
}

function PartnerDrawer({ partner, onClose }: { partner: Partner; onClose: () => void }) {
  const officialLinks: OfficialLink[] = partner.officialLinks ?? [];
  const contactInfo: ContactInfo = partner.contactInfo ?? {};
  const scoreColor = partner.healthScore >= 70 ? '#16a34a' : partner.healthScore >= 40 ? '#d97706' : '#dc2626';

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-md bg-white flex flex-col overflow-hidden animate-slide-in shadow-2xl">
        {/* Header */}
        <div className="flex items-start gap-4 p-6 border-b border-gray-100 shrink-0">
          {partner.logoUrl ? (
            <img src={partner.logoUrl} alt={partner.name} className="w-14 h-14 rounded-2xl object-contain bg-gray-50 border border-gray-100 shrink-0" />
          ) : (
            <Avatar size="xl">
              <AvatarFallback gradient={partner.priorityLevel === 'Strategic' ? 'purple' : 'indigo'}>
                {partner.name[0]}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900">{partner.name}</h2>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <PriorityBadge priority={partner.priorityLevel} />
              <StatusBadge status={partner.status} />
              {partner.domain && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: `${partner.domain.colorHex}18`, color: partner.domain.colorHex }}>
                  {partner.domain.name}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500 shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Health */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Health Score</p>
              <p className="text-xl font-black" style={{ color: scoreColor }}>{partner.healthScore}<span className="text-xs text-gray-400 font-normal">/100</span></p>
            </div>
            <Progress value={partner.healthScore} indicatorColor={scoreColor} className="h-2" />
          </div>

          {/* Description */}
          {partner.description && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">About</p>
              <p className="text-sm text-gray-700 leading-relaxed">{partner.description}</p>
            </div>
          )}

          {/* Contact */}
          {(contactInfo.contactName || contactInfo.email || contactInfo.phone || contactInfo.address) && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Information</p>
              <div className="space-y-2.5">
                {contactInfo.contactName && (
                  <div className="flex items-center gap-2.5 text-sm text-gray-700">
                    <User size={14} className="text-gray-400 shrink-0" />{contactInfo.contactName}
                  </div>
                )}
                {contactInfo.email && (
                  <div className="flex items-center gap-2.5 text-sm">
                    <Mail size={14} className="text-gray-400 shrink-0" />
                    <a href={`mailto:${contactInfo.email}`} className="text-indigo-600 hover:underline">{contactInfo.email}</a>
                  </div>
                )}
                {contactInfo.phone && (
                  <div className="flex items-center gap-2.5 text-sm text-gray-700">
                    <Phone size={14} className="text-gray-400 shrink-0" />{contactInfo.phone}
                  </div>
                )}
                {contactInfo.address && (
                  <div className="flex items-center gap-2.5 text-sm text-gray-700">
                    <MapPin size={14} className="text-gray-400 shrink-0" />{contactInfo.address}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Official links */}
          {officialLinks.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Official Links</p>
              <div className="space-y-2">
                {officialLinks.map((lnk, i) => (
                  <a
                    key={i}
                    href={lnk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Link2 size={13} className="text-indigo-400" />
                      <span className="text-sm font-medium text-gray-700">{lnk.label}</span>
                    </div>
                    <ExternalLink size={12} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Manager */}
          {partner.manager && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Account Manager</p>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <Avatar size="sm">
                  <AvatarFallback gradient="indigo">{partner.manager.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{partner.manager.name}</p>
                  {partner.manager.title && <p className="text-xs text-gray-400">{partner.manager.title}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Login prompt for internal data */}
          <div className="border border-gray-100 rounded-xl p-4 flex items-start gap-3">
            <Lock size={15} className="text-gray-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Internal data available</p>
              <p className="text-xs text-gray-400 mt-0.5 mb-3">Sign in to access activity history, notes, health breakdown, and AI insights.</p>
              <Button size="sm" variant="outline" onClick={() => window.open('/login', '_blank')}>
                Staff Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PublicInner() {
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data: partners, isLoading } = useQuery({
    queryKey: ['public-partners', { search: debouncedSearch, domain: domainFilter }],
    queryFn: () => partnersApi.getPublicList({
      search: debouncedSearch || undefined,
      domain: domainFilter || undefined,
    }),
  });

  // Derive unique domains from partner list
  const domains = Array.from(
    new Map((partners ?? []).filter(p => p.domain).map(p => [p.domain!.id, p.domain!])).values()
  );

  const grouped = PRIORITY_ORDER.reduce((acc, prio) => {
    acc[prio] = (partners ?? []).filter(p => p.priorityLevel === prio);
    return acc;
  }, {} as Record<string, Partner[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white font-black text-xs">PI</div>
            <span className="font-bold text-gray-900 text-sm">Partner Directory</span>
            <Badge variant="default" className="text-[10px]">Public</Badge>
          </div>
          <div className="flex items-center gap-3">
            {partners && <span className="text-xs text-gray-400">{partners.length} partners</span>}
            <Button size="sm" variant="outline" onClick={() => window.open('/login', '_blank')}>
              <Lock size={12} /> Staff Login
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Globe size={12} /> Public Partner Directory
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Our Partner Ecosystem</h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Browse our partner network. Contact information and official links are publicly available.
          </p>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search partners..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 h-10 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-card"
            />
          </div>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-card"
          >
            <option value="">All Domains</option>
            {domains.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        {/* Partners by priority */}
        {isLoading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading partners...</div>
        ) : (partners ?? []).length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No partners found</div>
        ) : (
          <div className="space-y-8">
            {PRIORITY_ORDER.map((prio) => {
              const group = grouped[prio];
              if (!group.length) return null;
              const labelCfg = {
                Strategic: { variant: 'purple' as const, icon: '⭐' },
                Key:       { variant: 'primary' as const, icon: '🔑' },
                Normal:    { variant: 'default' as const, icon: '🏢' },
              }[prio];

              return (
                <div key={prio}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-lg">{labelCfg.icon}</span>
                    <h2 className="text-base font-bold text-gray-800">{prio} Partners</h2>
                    <Badge variant={labelCfg.variant}>{group.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.map((p) => (
                      <PartnerCard key={p.id} partner={p} onClick={() => setSelectedPartner(p)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-12">
          © {new Date().getFullYear()} PI Platform · Partner Intelligence · Internal data requires staff login
        </p>
      </div>

      {/* Drawer */}
      {selectedPartner && (
        <PartnerDrawer partner={selectedPartner} onClose={() => setSelectedPartner(null)} />
      )}
    </div>
  );
}

export default function PublicPage() {
  return (
    <QueryClientProvider client={publicQueryClient}>
      <TooltipProvider>
        <PublicInner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
