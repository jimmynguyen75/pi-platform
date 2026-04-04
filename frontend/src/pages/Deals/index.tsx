import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Briefcase, TrendingUp, DollarSign, Target, X, Download } from 'lucide-react';
import dayjs from 'dayjs';
import { dealsApi } from '../../api/deals';
import { partnersApi } from '../../api/partners';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Skeleton } from '../../components/ui/skeleton';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';
import type { Deal, DealStatus, BusinessUnit } from '../../types';
import { exportToExcel } from '../../lib/export';

const STATUSES: DealStatus[] = ['Pending', 'In Progress', 'Won', 'Lost'];
const BUS: BusinessUnit[] = ['HSI', 'HSC', 'HAS', 'HSE', 'HSV'];

function dealStatusCfg(status: DealStatus) {
  const map: Record<DealStatus, { variant: any; dot: string }> = {
    'Pending':     { variant: 'default', dot: '#6b7280' },
    'In Progress': { variant: 'blue',    dot: '#2563eb' },
    'Won':         { variant: 'success', dot: '#16a34a' },
    'Lost':        { variant: 'danger',  dot: '#dc2626' },
  };
  return map[status] ?? { variant: 'default', dot: '#888' };
}

function DealStatusBadge({ status }: { status: DealStatus }) {
  const { variant, dot } = dealStatusCfg(status);
  return <Badge variant={variant} dot dotColor={dot}>{status}</Badge>;
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', color)}>
            <Icon size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DealFormValues {
  partnerId: string;
  partnerName: string;
  customerName: string;
  dealValue: string;
  expectedCloseDate: string;
  status: DealStatus;
  businessUnit: BusinessUnit | '';
  description: string;
  notes: string;
}

function DealForm({ partners, defaultValues, onSubmit, loading }: {
  partners: any[];
  defaultValues?: Partial<Deal>;
  onSubmit: (v: any) => void;
  loading: boolean;
}) {
  const [vals, setVals] = useState<DealFormValues>({
    partnerId: defaultValues?.partnerId ?? '',
    partnerName: defaultValues?.partnerName ?? '',
    customerName: defaultValues?.customerName ?? '',
    dealValue: defaultValues?.dealValue?.toString() ?? '',
    expectedCloseDate: defaultValues?.expectedCloseDate ? dayjs(defaultValues.expectedCloseDate).format('YYYY-MM-DD') : '',
    status: defaultValues?.status ?? 'Pending',
    businessUnit: defaultValues?.businessUnit ?? '',
    description: defaultValues?.description ?? '',
    notes: defaultValues?.notes ?? '',
  });

  const set = (k: keyof DealFormValues, v: string) => setVals(prev => ({ ...prev, [k]: v }));

  const handlePartnerChange = (id: string) => {
    const partner = partners.find(p => p.id === id);
    set('partnerId', id);
    if (partner) set('partnerName', partner.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...vals,
      dealValue: vals.dealValue ? parseFloat(vals.dealValue) : 0,
      expectedCloseDate: vals.expectedCloseDate || undefined,
      businessUnit: vals.businessUnit || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Partner</Label>
        <Select value={vals.partnerId} onValueChange={handlePartnerChange}>
          <SelectTrigger><SelectValue placeholder="Select partner" /></SelectTrigger>
          <SelectContent>
            {partners.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Customer Name</Label>
        <Input placeholder="e.g. Viettel Group" value={vals.customerName} onChange={(e) => set('customerName', e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Deal Value (USD)</Label>
          <Input type="number" min="0" step="1000" placeholder="0" value={vals.dealValue} onChange={(e) => set('dealValue', e.target.value)} />
        </div>
        <div>
          <Label>Expected Close Date</Label>
          <Input type="date" value={vals.expectedCloseDate} onChange={(e) => set('expectedCloseDate', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Status</Label>
          <Select value={vals.status} onValueChange={(v) => set('status', v as DealStatus)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Business Unit</Label>
          <Select value={vals.businessUnit || '_none'} onValueChange={(v) => set('businessUnit', v === '_none' ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="Select BU" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">None</SelectItem>
              {BUS.map((bu) => <SelectItem key={bu} value={bu}>{bu}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Description</Label>
        <textarea
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={2}
          placeholder="Brief deal description..."
          value={vals.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>
      <div>
        <Label>Notes</Label>
        <textarea
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={2}
          placeholder="Internal notes..."
          value={vals.notes}
          onChange={(e) => set('notes', e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" loading={loading}>Save Deal</Button>
      </div>
    </form>
  );
}

export default function DealsPage() {
  const { user } = useAppStore();
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBU, setFilterBU] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [deleteDeal, setDeleteDeal] = useState<Deal | null>(null);

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals', filterStatus, filterBU, search],
    queryFn: () => dealsApi.list({
      status: filterStatus || undefined,
      businessUnit: filterBU || undefined,
      search: search || undefined,
    }),
  });

  const { data: stats } = useQuery({
    queryKey: ['deals-stats'],
    queryFn: dealsApi.getStats,
  });

  const { data: partners = [] } = useQuery({
    queryKey: ['partners-list'],
    queryFn: () => partnersApi.getAll(),
  });

  const createMut = useMutation({
    mutationFn: (data: Partial<Deal>) => dealsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals'] }); qc.invalidateQueries({ queryKey: ['deals-stats'] }); setShowCreate(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Deal> }) => dealsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals'] }); qc.invalidateQueries({ queryKey: ['deals-stats'] }); setEditDeal(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => dealsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deals'] }); qc.invalidateQueries({ queryKey: ['deals-stats'] }); setDeleteDeal(null); },
  });

  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  const handleExport = () => {
    exportToExcel(deals.map(d => ({
      'Partner': d.partnerName,
      'Customer': d.customerName,
      'Value (USD)': d.dealValue,
      'Status': d.status,
      'Business Unit': d.businessUnit ?? '',
      'Expected Close': d.expectedCloseDate ? dayjs(d.expectedCloseDate).format('YYYY-MM-DD') : '',
      'Description': d.description ?? '',
      'Created': dayjs(d.createdAt).format('YYYY-MM-DD'),
    })), 'Deals_Report');
  };

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deal Registration</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track partner deals and pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download size={14} className="mr-1.5" />Export
          </Button>
          {canEdit && (
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus size={14} className="mr-1.5" />Register Deal
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Briefcase} label="Total Deals" value={stats.total} sub={`${stats.inProgress} in progress`} color="bg-indigo-500" />
          <StatCard icon={TrendingUp} label="Success Rate" value={`${stats.successRate}%`} sub={`${stats.won} won / ${stats.lost} lost`} color="bg-green-500" />
          <StatCard icon={DollarSign} label="Pipeline Value" value={fmt(stats.totalPipelineValue)} sub="Active + Pending" color="bg-blue-500" />
          <StatCard icon={Target} label="Won Value" value={fmt(stats.wonValue)} sub="Closed won" color="bg-purple-500" />
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Input
                placeholder="Search partner or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-3"
              />
            </div>
            <Select value={filterStatus || '_all'} onValueChange={(v) => setFilterStatus(v === '_all' ? '' : v)}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Statuses</SelectItem>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterBU || '_all'} onValueChange={(v) => setFilterBU(v === '_all' ? '' : v)}>
              <SelectTrigger className="w-[120px]"><SelectValue placeholder="All BUs" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All BUs</SelectItem>
                {BUS.map((bu) => <SelectItem key={bu} value={bu}>{bu}</SelectItem>)}
              </SelectContent>
            </Select>
            {(filterStatus || filterBU || search) && (
              <Button variant="ghost" size="sm" onClick={() => { setFilterStatus(''); setFilterBU(''); setSearch(''); }}>
                <X size={14} className="mr-1" />Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : deals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Briefcase size={40} className="mb-3 opacity-30" />
              <p className="font-medium">No deals found</p>
              <p className="text-sm mt-1">Register your first deal to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Partner</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">BU</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Close Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Registered</th>
                    {canEdit && <th className="px-4 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {deals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-4 py-3 font-medium text-gray-900">{deal.partnerName}</td>
                      <td className="px-4 py-3 text-gray-700">{deal.customerName}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{fmt(deal.dealValue)}</td>
                      <td className="px-4 py-3"><DealStatusBadge status={deal.status} /></td>
                      <td className="px-4 py-3">
                        {deal.businessUnit ? (
                          <Badge variant="primary">{deal.businessUnit}</Badge>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {deal.expectedCloseDate ? dayjs(deal.expectedCloseDate).format('MMM D, YYYY') : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{dayjs(deal.createdAt).format('MMM D, YYYY')}</td>
                      {canEdit && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditDeal(deal)}
                              className="px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteDeal(deal)}
                              className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Register New Deal</DialogTitle></DialogHeader>
          <DialogBody>
            <DealForm
              partners={partners}
              onSubmit={(data) => createMut.mutate(data)}
              loading={createMut.isPending}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      {editDeal && (
        <Dialog open={!!editDeal} onOpenChange={() => setEditDeal(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Deal</DialogTitle></DialogHeader>
            <DialogBody>
              <DealForm
                partners={partners}
                defaultValues={editDeal}
                onSubmit={(data) => updateMut.mutate({ id: editDeal.id, data })}
                loading={updateMut.isPending}
              />
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirm */}
      <Dialog open={!!deleteDeal} onOpenChange={() => setDeleteDeal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Deal</DialogTitle></DialogHeader>
          <DialogBody>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete the deal with <strong>{deleteDeal?.customerName}</strong>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteDeal(null)}>Cancel</Button>
              <Button variant="danger" loading={deleteMut.isPending} onClick={() => deleteDeal && deleteMut.mutate(deleteDeal.id)}>Delete</Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
