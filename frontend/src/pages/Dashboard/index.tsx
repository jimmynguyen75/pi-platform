import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Users, AlertTriangle, TrendingUp, Activity,
  Zap, CheckCircle2, Flame, ArrowRight,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboard';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { HealthScoreBar } from '../../components/HealthScoreBar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { cn } from '../../lib/utils';

dayjs.extend(relativeTime);

const ACTIVITY_ICON: Record<string, string> = {
  meeting: '🤝', deal: '💼', email: '📧', call: '📞', review: '📋',
};

const ACT_COLORS: Record<string, string> = {
  meeting: '#4f46e5', deal: '#16a34a', email: '#d97706', call: '#7c3aed', review: '#0891b2',
};

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: dashboardApi.getStats, refetchInterval: 30_000 });
  const { data: managerLoad } = useQuery({ queryKey: ['dashboard-manager-load'], queryFn: dashboardApi.getManagerLoad });
  const { data: domainBreakdown } = useQuery({ queryKey: ['dashboard-domain-breakdown'], queryFn: dashboardApi.getDomainBreakdown });
  const { data: activityTrend } = useQuery({ queryKey: ['dashboard-activity-trend'], queryFn: () => dashboardApi.getActivityTrend(30) });
  const { data: riskPartners } = useQuery({ queryKey: ['dashboard-risk-partners'], queryFn: dashboardApi.getRiskPartners });
  const { data: recentActivities } = useQuery({ queryKey: ['dashboard-recent-activities'], queryFn: () => dashboardApi.getRecentActivities(8) });

  const trendOption = {
    tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: '#e5e7eb', borderWidth: 1, textStyle: { color: '#374151', fontSize: 12 } },
    grid: { left: 32, right: 12, top: 16, bottom: 28 },
    xAxis: { type: 'category', data: activityTrend?.map((d) => dayjs(d.date).format('MMM D')) ?? [], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontSize: 11, color: '#9ca3af' } },
    yAxis: { type: 'value', minInterval: 1, axisLabel: { fontSize: 11, color: '#9ca3af' }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    series: [{
      type: 'line', smooth: true,
      data: activityTrend?.map((d) => d.count) ?? [],
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(79,70,229,0.15)' }, { offset: 1, color: 'rgba(79,70,229,0)' }] } },
      lineStyle: { color: '#4f46e5', width: 2.5 },
      itemStyle: { color: '#4f46e5' },
      symbol: 'circle', symbolSize: 6,
    }],
  };

  const statusOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, left: 'center', itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 11, color: '#6b7280' } },
    series: [{
      type: 'pie', radius: ['52%', '76%'], center: ['50%', '44%'],
      data: [
        { value: stats?.byStatus?.active ?? 0, name: 'Active', itemStyle: { color: '#16a34a' } },
        { value: stats?.byStatus?.risk ?? 0, name: 'At Risk', itemStyle: { color: '#d97706' } },
        { value: stats?.byStatus?.inactive ?? 0, name: 'Inactive', itemStyle: { color: '#dc2626' } },
      ],
      label: { show: false },
      emphasis: { scale: true, scaleSize: 5 },
    }],
  };

  const loadData = [...(managerLoad ?? [])].sort((a, b) => b.workloadScore - a.workloadScore);
  const managerLoadOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any[]) => {
        const d = loadData[params[0].dataIndex];
        return `<b>${d?.name}</b><br/>Score: <b>${d?.workloadScore}</b><br/>Partners: ${d?.partnerCount}`;
      },
    },
    grid: { left: 110, right: 16, top: 8, bottom: 16 },
    xAxis: { type: 'value', axisLabel: { fontSize: 11, color: '#9ca3af' }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
    yAxis: { type: 'category', data: loadData.map((w) => w.name), axisLabel: { fontSize: 11, color: '#374151' }, axisLine: { show: false }, axisTick: { show: false } },
    series: [{
      type: 'bar', barMaxWidth: 20,
      data: loadData.map((w) => ({
        value: w.workloadScore,
        itemStyle: { color: w.workloadScore >= 8 ? '#dc2626' : w.workloadScore >= 5 ? '#d97706' : '#4f46e5', borderRadius: [0, 6, 6, 0] },
      })),
    }],
  };

  const priorityOption = {
    tooltip: { trigger: 'item', formatter: '{b}: {c}' },
    series: [{
      type: 'pie', radius: ['44%', '68%'], center: ['50%', '48%'],
      data: [
        { value: stats?.byPriority?.strategic ?? 0, name: 'Strategic', itemStyle: { color: '#7c3aed' } },
        { value: stats?.byPriority?.key ?? 0, name: 'Key', itemStyle: { color: '#4f46e5' } },
        { value: stats?.byPriority?.normal ?? 0, name: 'Normal', itemStyle: { color: '#16a34a' } },
      ],
      label: { show: false },
    }],
    legend: { bottom: 0, left: 'center', itemWidth: 10, itemHeight: 10, textStyle: { fontSize: 11, color: '#6b7280' } },
  };

  const KPI_CARDS = [
    { label: 'Total Partners',    value: stats?.totalPartners,           icon: Users,         color: '#4f46e5', bg: '#eef2ff' },
    { label: 'Strategic',         value: stats?.byPriority?.strategic,   icon: Zap,           color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Active',            value: stats?.byStatus?.active,        icon: CheckCircle2,  color: '#16a34a', bg: '#f0fdf4' },
    { label: 'At Risk',           value: stats?.byStatus?.risk,          icon: AlertTriangle, color: '#d97706', bg: '#fffbeb' },
    { label: 'Avg Health',        value: stats?.avgHealthScore,          icon: TrendingUp,    color: '#0891b2', bg: '#ecfeff', suffix: '/100' },
    { label: 'Activities (30d)',  value: stats?.recentActivities,        icon: Activity,      color: '#be185d', bg: '#fdf2f8' },
  ];

  return (
    <div className="animate-fade-in space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-card px-6 py-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {dayjs().format('dddd, MMMM D, YYYY')} · Portfolio overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
            <p className="text-xl font-bold text-indigo-600">{isLoading ? '—' : stats?.avgHealthScore ?? 0}</p>
            <p className="text-xs text-gray-500">Avg Health</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-green-50 border border-green-100">
            <p className="text-xl font-bold text-green-600">{isLoading ? '—' : stats?.totalManagers ?? 0}</p>
            <p className="text-xs text-gray-500">Managers</p>
          </div>
        </div>
      </div>

      {/* Risk banner */}
      {(stats?.byStatus?.risk ?? 0) > 0 && (
        <Alert variant="warning">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <AlertDescription>
            <strong>{stats?.byStatus?.risk} partner{stats!.byStatus.risk > 1 ? 's' : ''} require attention</strong>
            {' — '}no activity in 30+ days or health score below threshold.{' '}
            <button onClick={() => navigate('/partners?status=Risk')} className="font-semibold underline underline-offset-2 hover:no-underline">
              Review partners →
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {KPI_CARDS.map(({ label, value, icon: Icon, color, bg, suffix }, i) => (
          <Card key={i} className="hover:shadow-card-hover transition-shadow duration-200 cursor-default group">
            <CardContent className="p-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                <Icon size={16} style={{ color }} />
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-14 mb-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 leading-none">
                  {value ?? 0}
                  {suffix && <span className="text-sm text-gray-400 font-normal">{suffix}</span>}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Activity Trend</CardTitle>
            <p className="text-xs text-gray-400">Last 30 days</p>
          </CardHeader>
          <CardContent className="pt-2">
            <ReactECharts option={trendOption} style={{ height: 200 }} />
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Partner Status</CardTitle></CardHeader>
          <CardContent className="pt-2">
            <ReactECharts option={statusOption} style={{ height: 200 }} />
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Manager Workload</CardTitle>
            <p className="text-xs text-gray-400">Strategic×3 · Key×2 · Normal×1</p>
          </CardHeader>
          <CardContent className="pt-2">
            <ReactECharts option={managerLoadOption} style={{ height: 200 }} />
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader><CardTitle>Priority Breakdown</CardTitle></CardHeader>
          <CardContent className="pt-2">
            <ReactECharts option={priorityOption} style={{ height: 200 }} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* At risk table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" />
              <CardTitle>Partners At Risk</CardTitle>
            </div>
            <button
              onClick={() => navigate('/partners?status=Risk')}
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
            >
              See all <ArrowRight size={12} />
            </button>
          </CardHeader>
          <CardContent className="p-0">
            {(riskPartners?.slice(0, 6) ?? []).length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">No partners at risk</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-5 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Partner</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Health</th>
                    <th className="px-5 py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Manager</th>
                  </tr>
                </thead>
                <tbody>
                  {riskPartners?.slice(0, 6).map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 cursor-pointer transition-colors"
                      onClick={() => navigate(`/partners/${r.id}`)}
                    >
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                        <div className="mt-0.5"><PriorityBadge priority={r.priorityLevel} /></div>
                      </td>
                      <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-3 py-3"><HealthScoreBar score={r.healthScore} showLabel={false} size="small" /></td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-gray-500">{r.manager?.name ?? '—'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Domain health */}
        <Card>
          <CardHeader><CardTitle>Domain Health Overview</CardTitle></CardHeader>
          <CardContent className="space-y-4 pt-3">
            {domainBreakdown?.map((d) => (
              <div key={d.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.colorHex }} />
                    <span className="text-sm font-medium text-gray-700">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{d.totalPartners} partners</span>
                    {d.riskPartners > 0 && (
                      <Badge variant="warning" className="text-[10px] px-1.5">{d.riskPartners} risk</Badge>
                    )}
                    <span
                      className="text-xs font-semibold"
                      style={{ color: d.avgHealthScore >= 70 ? '#16a34a' : d.avgHealthScore >= 40 ? '#d97706' : '#dc2626' }}
                    >
                      {d.avgHealthScore}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${d.avgHealthScore}%`, background: d.colorHex }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Activity feed */}
      <Card>
        <CardHeader><CardTitle>Recent Activity Feed</CardTitle></CardHeader>
        <CardContent className="p-0">
          {(recentActivities ?? []).map((item, index) => (
            <div
              key={item.id}
              className={cn(
                'flex items-start gap-4 px-5 py-3.5 hover:bg-gray-50/70 cursor-pointer transition-colors',
                index < (recentActivities?.length ?? 0) - 1 && 'border-b border-gray-50'
              )}
              onClick={() => navigate(`/partners/${item.partnerId}`)}
            >
              <span className="text-xl leading-none mt-0.5 shrink-0">{ACTIVITY_ICON[item.type] ?? '📌'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">{item.title || item.type}</span>
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                    style={{ background: `${ACT_COLORS[item.type]}15`, color: ACT_COLORS[item.type] }}
                  >
                    {item.type}
                  </span>
                  <span className="text-xs text-gray-400">→ {item.partner?.name}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  by {item.manager?.name} · {dayjs(item.date).format('MMM D, YYYY')}
                </p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-0.5">{dayjs(item.date).fromNow()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
