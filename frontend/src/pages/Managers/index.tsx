import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Crown, Users, Zap, AlertTriangle } from 'lucide-react';
import { dashboardApi } from '../../api/dashboard';
import { employeesApi } from '../../api/employees';
import { partnersApi } from '../../api/partners';
import { PriorityBadge, StatusBadge } from '../../components/StatusBadge';
import { HealthScoreBar } from '../../components/HealthScoreBar';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Skeleton } from '../../components/ui/skeleton';
import type { Manager, Partner } from '../../types';
import { cn } from '../../lib/utils';

function ManagerCard({ manager, partners }: { manager: Manager; partners: Partner[] }) {
  const navigate = useNavigate();
  const strategicCount = partners.filter(p => p.priorityLevel === 'Strategic').length;
  const riskCount = partners.filter(p => p.status === 'Risk').length;
  const avgHealth = partners.length
    ? Math.round(partners.reduce((s, p) => s + p.healthScore, 0) / partners.length)
    : 0;

  const healthColor = avgHealth >= 70 ? '#16a34a' : avgHealth >= 40 ? '#d97706' : '#dc2626';
  const healthBg    = avgHealth >= 70 ? '#f0fdf4' : avgHealth >= 40 ? '#fffbeb' : '#fef2f2';

  return (
    <Card className="hover:shadow-card-hover transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start gap-4 p-5 pb-4 border-b border-gray-50">
        <Avatar size="lg">
          <AvatarFallback gradient={manager.role === 'admin' ? 'purple' : 'indigo'}>
            {manager.name[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-gray-900 truncate">{manager.name}</span>
            {manager.role === 'admin' && <Crown size={14} className="text-purple-500 shrink-0" />}
          </div>
          {manager.title && <p className="text-xs text-gray-500 mt-0.5">{manager.title}</p>}
          <div className="mt-1.5">
            <Badge variant={manager.role === 'admin' ? 'purple' : 'primary'} className="text-[10px]">
              {manager.role}
            </Badge>
          </div>
        </div>
        <div
          className="text-right px-3 py-2 rounded-xl shrink-0"
          style={{ background: healthBg }}
        >
          <p className="text-xl font-bold leading-none" style={{ color: healthColor }}>{avgHealth}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">avg health</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-50 border-b border-gray-50">
        {[
          { value: partners.length, label: 'Partners',  color: 'text-gray-900' },
          { value: strategicCount,  label: 'Strategic', color: 'text-purple-600' },
          { value: riskCount,       label: 'At Risk',   color: riskCount > 0 ? 'text-amber-600' : 'text-gray-400' },
        ].map(({ value, label, color }) => (
          <div key={label} className="text-center py-3">
            <p className={cn('text-xl font-bold', color)}>{value}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Partner list */}
      {partners.length > 0 ? (
        <div className="py-1">
          {partners.slice(0, 5).map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between px-5 py-2.5 hover:bg-gray-50/70 cursor-pointer transition-colors"
              onClick={() => navigate(`/partners/${p.id}`)}
            >
              <div className="flex items-center gap-2">
                <PriorityBadge priority={p.priorityLevel} />
                <span className="text-sm text-gray-700">{p.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={p.status} />
                <span className="text-xs text-gray-400 w-6 text-right tabular-nums">{p.healthScore}</span>
              </div>
            </div>
          ))}
          {partners.length > 5 && (
            <p className="px-5 py-2 text-xs text-gray-400">+{partners.length - 5} more partners</p>
          )}
        </div>
      ) : (
        <div className="py-8 text-center text-sm text-gray-400">No partners assigned</div>
      )}
    </Card>
  );
}

export default function ManagersPage() {
  const { data: managers, isLoading: mgrLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeesApi.getAll(),
  });
  const { data: allPartners } = useQuery({
    queryKey: ['partners', {}],
    queryFn: () => partnersApi.getAll(),
  });
  const { data: managerLoad } = useQuery({
    queryKey: ['dashboard-manager-load'],
    queryFn: dashboardApi.getManagerLoad,
  });

  const managerUsers = (managers ?? []).filter(m => m.role === 'manager');
  const getPartners = (id: string): Partner[] => (allPartners ?? []).filter(p => p.managerId === id);
  const unassigned = (allPartners ?? []).filter(p => !p.managerId);

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-card px-6 py-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={20} className="text-indigo-500" />
            Managers
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {managerUsers.length} manager{managerUsers.length !== 1 ? 's' : ''} · {allPartners?.length ?? 0} partners total
            {unassigned.length > 0 && (
              <Badge variant="warning" className="ml-2 text-[10px]">{unassigned.length} unassigned</Badge>
            )}
          </p>
        </div>
      </div>

      {/* Workload bar chart */}
      {managerLoad && managerLoad.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Workload Distribution
              <span className="text-xs text-gray-400 font-normal">(Strategic×3, Key×2, Normal×1)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
            {[...managerLoad].sort((a, b) => b.workloadScore - a.workloadScore).map((m) => {
              const maxScore = managerLoad.reduce((mx, x) => Math.max(mx, x.workloadScore), 1);
              const pct = Math.round((m.workloadScore / maxScore) * 100);
              const color = m.workloadScore >= 8 ? '#dc2626' : m.workloadScore >= 5 ? '#d97706' : '#4f46e5';
              return (
                <div key={m.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Avatar size="xs">
                        <AvatarFallback gradient="indigo">{m.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-700">{m.name}</span>
                      {m.title && <span className="text-xs text-gray-400">({m.title})</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Zap size={10} className="text-purple-500" /> {m.strategicCount}
                        <span className="mx-1">·</span>
                        <Users size={10} className="text-indigo-500" /> {m.partnerCount}
                      </span>
                      <span className="text-sm font-bold w-6 text-right tabular-nums" style={{ color }}>
                        {m.workloadScore}
                      </span>
                    </div>
                  </div>
                  <Progress value={pct} indicatorColor={color} className="h-1.5" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Manager cards grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {mgrLoading
          ? [1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))
          : managerUsers.map(mgr => (
              <ManagerCard key={mgr.id} manager={mgr} partners={getPartners(mgr.id)} />
            ))
        }
      </div>

      {/* Unassigned partners */}
      {unassigned.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            <CardTitle>Unassigned Partners</CardTitle>
            <Badge variant="warning" className="ml-1">{unassigned.length}</Badge>
          </CardHeader>
          <CardContent className="p-0 pt-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-5 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Partner</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Domain</th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Health</th>
                </tr>
              </thead>
              <tbody>
                {unassigned.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={p.priorityLevel} />
                        <span className="text-sm font-semibold text-gray-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      {p.domain ? (
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-md"
                          style={{ background: `${p.domain.colorHex}18`, color: p.domain.colorHex }}
                        >
                          {p.domain.name}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-3"><HealthScoreBar score={p.healthScore} size="small" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
