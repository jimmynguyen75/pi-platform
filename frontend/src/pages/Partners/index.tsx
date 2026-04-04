import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus, Search, Eye, Edit2, Trash2, Filter, X, Download,
} from 'lucide-react';
import dayjs from 'dayjs';
import { partnersApi } from '../../api/partners';
import { domainsApi } from '../../api/domains';
import { employeesApi } from '../../api/employees';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { HealthScoreBar } from '../../components/HealthScoreBar';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui/tooltip';
import { Confirm } from '../../components/ui/confirm';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Skeleton } from '../../components/ui/skeleton';
import { useAppStore } from '../../store/useAppStore';
import { exportToExcel } from '../../lib/export';
import { useDebounce } from '../../hooks/useDebounce';
import type { Partner } from '../../types';
import { cn } from '../../lib/utils';

function PartnerForm({
  domains, managers, defaultValues, onSubmit, loading,
}: {
  domains: any[]; managers: any[];
  defaultValues?: Partial<Partner>;
  onSubmit: (v: any) => void;
  loading: boolean;
}) {
  const [vals, setVals] = useState({
    name: defaultValues?.name ?? '',
    domainId: defaultValues?.domainId ?? '',
    managerId: defaultValues?.managerId ?? '',
    priorityLevel: defaultValues?.priorityLevel ?? 'Normal',
    status: defaultValues?.status ?? 'Active',
    description: defaultValues?.description ?? '',
  });

  const set = (k: string, v: string) => setVals(prev => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="pname">Partner Name</Label>
        <Input id="pname" placeholder="e.g. Microsoft" value={vals.name} onChange={(e) => set('name', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Domain</Label>
          <Select value={vals.domainId} onValueChange={(v) => set('domainId', v)}>
            <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
            <SelectContent>
              {domains.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Manager</Label>
          <Select value={vals.managerId} onValueChange={(v) => set('managerId', v)}>
            <SelectTrigger><SelectValue placeholder="Assign manager" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {managers.filter(m => m.role === 'manager').map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Priority</Label>
          <Select value={vals.priorityLevel} onValueChange={(v) => set('priorityLevel', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Strategic">Strategic</SelectItem>
              <SelectItem value="Key">Key</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={vals.status} onValueChange={(v) => set('status', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Risk">At Risk</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <textarea
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:bg-white resize-none h-20"
          placeholder="Brief description of the partnership..."
          value={vals.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={() => onSubmit(vals)} loading={loading}>
          {defaultValues ? 'Save Changes' : 'Create Partner'}
        </Button>
      </div>
    </div>
  );
}

export default function PartnersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAppStore();
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  const handleExport = () => {
    exportToExcel((partners ?? []).map(p => ({
      'Name': p.name,
      'Domain': p.domain?.name ?? '',
      'Manager': p.manager?.name ?? '',
      'Priority': p.priorityLevel,
      'Status': p.status,
      'Health Score': p.healthScore,
      'Tier': p.partnerTier ?? '',
      'Description': p.description ?? '',
    })), 'Partners_Report');
  };

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [domainFilter, setDomainFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [managerFilter, setManagerFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Partner | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data: partners, isLoading } = useQuery({
    queryKey: ['partners', { search: debouncedSearch, domain: domainFilter, priority: priorityFilter, status: statusFilter, managerId: managerFilter }],
    queryFn: () => partnersApi.getAll({
      search: debouncedSearch || undefined,
      domain: domainFilter || undefined,
      priority: priorityFilter || undefined,
      status: statusFilter || undefined,
      managerId: managerFilter || undefined,
    }),
  });

  const { data: domains } = useQuery({ queryKey: ['domains'], queryFn: domainsApi.getAll });
  const { data: managers } = useQuery({ queryKey: ['employees'], queryFn: () => employeesApi.getAll() });

  const createMutation = useMutation({
    mutationFn: partnersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => partnersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      setEditTarget(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: partnersApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const activeFilters = [domainFilter, priorityFilter, statusFilter, managerFilter].filter(Boolean).length;
  const clearFilters = () => { setSearch(''); setDomainFilter(''); setPriorityFilter(''); setStatusFilter(''); setManagerFilter(''); };

  return (
    <div className="animate-fade-in space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-card px-6 py-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Partner Explorer</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isLoading ? 'Loading...' : `${partners?.length ?? 0} partner${partners?.length !== 1 ? 's' : ''}`}
            {activeFilters > 0 && (
              <Badge variant="primary" className="ml-2 text-[10px]">{activeFilters} filter{activeFilters > 1 ? 's' : ''}</Badge>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download size={14} className="mr-1.5" />Export
          </Button>
          {canEdit && (
            <Button onClick={() => { setEditTarget(null); setModalOpen(true); }}>
              <Plus size={15} /> Add Partner
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 h-9 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <Select value={domainFilter} onValueChange={(v) => setDomainFilter(v === '_all' ? '' : v)}>
              <SelectTrigger className="w-36"><Filter size={13} className="mr-1.5 text-gray-400 shrink-0" /><SelectValue placeholder="Domain" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Domains</SelectItem>
                {domains?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v === '_all' ? '' : v)}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Priorities</SelectItem>
                <SelectItem value="Strategic">Strategic</SelectItem>
                <SelectItem value="Key">Key</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === '_all' ? '' : v)}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Risk">At Risk</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={managerFilter} onValueChange={(v) => setManagerFilter(v === '_all' ? '' : v)}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Manager" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Managers</SelectItem>
                {managers?.filter(m => m.role === 'manager').map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500">
                <X size={13} /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-5 space-y-3">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Partner</th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Priority</th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Health</th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Manager</th>
                  <th className="px-3 py-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Last Activity</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {(partners ?? []).length === 0 ? (
                  <tr><td colSpan={7} className="py-16 text-center text-sm text-gray-400">No partners found</td></tr>
                ) : (
                  (partners ?? []).map((rec) => {
                    const acts = rec.activities ?? [];
                    const sorted = [...acts].sort((a, b) => a.date < b.date ? 1 : -1);
                    const days = sorted[0] ? dayjs().diff(dayjs(sorted[0].date), 'day') : null;

                    return (
                      <tr
                        key={rec.id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 cursor-pointer transition-colors group"
                        onDoubleClick={() => navigate(`/partners/${rec.id}`)}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {rec.logoUrl ? (
                              <img src={rec.logoUrl} alt={rec.name} className="w-9 h-9 rounded-xl object-contain bg-gray-50 border border-gray-100 shrink-0" />
                            ) : (
                              <Avatar size="md">
                                <AvatarFallback gradient={rec.priorityLevel === 'Strategic' ? 'purple' : rec.priorityLevel === 'Key' ? 'indigo' : 'blue'}>
                                  {rec.name[0]}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{rec.name}</p>
                              {rec.domain && (
                                <span
                                  className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md mt-0.5"
                                  style={{ background: `${rec.domain.colorHex}18`, color: rec.domain.colorHex }}
                                >
                                  {rec.domain.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5"><PriorityBadge priority={rec.priorityLevel} /></td>
                        <td className="px-3 py-3.5"><StatusBadge status={rec.status} /></td>
                        <td className="px-3 py-3.5"><HealthScoreBar score={rec.healthScore} size="small" /></td>
                        <td className="px-3 py-3.5">
                          {rec.manager ? (
                            <div className="flex items-center gap-2">
                              <Avatar size="xs">
                                <AvatarFallback gradient="indigo">{rec.manager.name[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-600">{rec.manager.name}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Unassigned</span>
                          )}
                        </td>
                        <td className="px-3 py-3.5">
                          {days === null ? (
                            <span className="text-xs text-gray-400">No activity</span>
                          ) : (
                            <span className={cn('text-xs font-medium', days > 30 ? 'text-red-600' : days > 14 ? 'text-amber-600' : 'text-green-600')}>
                              {days === 0 ? 'Today' : `${days}d ago`}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); navigate(`/partners/${rec.id}`); }}>
                                  <Eye size={13} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View detail</TooltipContent>
                            </Tooltip>
                            {canEdit && (
                              <>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); setEditTarget(rec); setModalOpen(true); }}>
                                      <Edit2 size={13} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit</TooltipContent>
                                </Tooltip>
                                <Confirm title="Delete partner?" description="All related activities will be removed." onConfirm={() => deleteMutation.mutate(rec.id)}>
                                  <Button variant="danger-ghost" size="icon-sm" onClick={(e) => e.stopPropagation()}>
                                    <Trash2 size={13} />
                                  </Button>
                                </Confirm>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={(o) => { if (!o) { setModalOpen(false); setEditTarget(null); } }}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? `Edit: ${editTarget.name}` : 'Add New Partner'}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <PartnerForm
              domains={domains ?? []}
              managers={managers ?? []}
              defaultValues={editTarget ?? undefined}
              loading={createMutation.isPending || updateMutation.isPending}
              onSubmit={(v) => {
                if (editTarget) {
                  updateMutation.mutate({ id: editTarget.id, data: v });
                } else {
                  createMutation.mutate(v);
                }
              }}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
