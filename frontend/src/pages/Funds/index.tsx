import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Wallet, TrendingUp, Clock, PiggyBank, X, Download } from 'lucide-react';
import dayjs from 'dayjs';
import { fundsApi } from '../../api/funds';
import { partnersApi } from '../../api/partners';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Skeleton } from '../../components/ui/skeleton';
import { Progress } from '../../components/ui/progress';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';
import type { Fund, FundType, ClaimStatus } from '../../types';
import { exportToExcel } from '../../lib/export';

const FUND_TYPES: FundType[] = ['Rebate', 'Program Fund', 'Marketing Fund'];
const CLAIM_STATUSES: ClaimStatus[] = ['Pending', 'Submitted', 'Approved', 'Rejected', 'Paid'];
const FISCAL_YEARS = [2023, 2024, 2025, 2026];

function claimStatusCfg(status: ClaimStatus) {
  const map: Record<ClaimStatus, { variant: any; dot: string }> = {
    'Pending':   { variant: 'default',  dot: '#6b7280' },
    'Submitted': { variant: 'blue',     dot: '#2563eb' },
    'Approved':  { variant: 'success',  dot: '#16a34a' },
    'Rejected':  { variant: 'danger',   dot: '#dc2626' },
    'Paid':      { variant: 'purple',   dot: '#7c3aed' },
  };
  return map[status] ?? { variant: 'default', dot: '#888' };
}

function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  const { variant, dot } = claimStatusCfg(status);
  return <Badge variant={variant} dot dotColor={dot}>{status}</Badge>;
}

function fundTypeCfg(type: FundType) {
  const map: Record<FundType, { color: string; bg: string }> = {
    'Rebate':        { color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
    'Program Fund':  { color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200' },
    'Marketing Fund':{ color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  };
  return map[type] ?? { color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' };
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

interface FundFormValues {
  partnerId: string;
  partnerName: string;
  fundType: FundType | '';
  fiscalYear: string;
  totalAmount: string;
  receivedAmount: string;
  spentAmount: string;
  claimStatus: ClaimStatus;
  notes: string;
}

function FundForm({ partners, defaultValues, onSubmit, loading }: {
  partners: any[];
  defaultValues?: Partial<Fund>;
  onSubmit: (v: any) => void;
  loading: boolean;
}) {
  const [vals, setVals] = useState<FundFormValues>({
    partnerId: defaultValues?.partnerId ?? '',
    partnerName: defaultValues?.partnerName ?? '',
    fundType: defaultValues?.fundType ?? '',
    fiscalYear: defaultValues?.fiscalYear?.toString() ?? '2025',
    totalAmount: defaultValues?.totalAmount?.toString() ?? '',
    receivedAmount: defaultValues?.receivedAmount?.toString() ?? '0',
    spentAmount: defaultValues?.spentAmount?.toString() ?? '0',
    claimStatus: defaultValues?.claimStatus ?? 'Pending',
    notes: defaultValues?.notes ?? '',
  });

  const set = (k: keyof FundFormValues, v: string) => setVals(prev => ({ ...prev, [k]: v }));

  const handlePartnerChange = (id: string) => {
    const partner = partners.find(p => p.id === id);
    set('partnerId', id);
    if (partner) set('partnerName', partner.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...vals,
      fiscalYear: parseInt(vals.fiscalYear),
      totalAmount: vals.totalAmount ? parseFloat(vals.totalAmount) : 0,
      receivedAmount: vals.receivedAmount ? parseFloat(vals.receivedAmount) : 0,
      spentAmount: vals.spentAmount ? parseFloat(vals.spentAmount) : 0,
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Fund Type</Label>
          <Select value={vals.fundType} onValueChange={(v) => set('fundType', v as FundType)} >
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {FUND_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Fiscal Year</Label>
          <Select value={vals.fiscalYear} onValueChange={(v) => set('fiscalYear', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {FISCAL_YEARS.map((y) => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Total Amount (USD)</Label>
          <Input type="number" min="0" step="1000" placeholder="0" value={vals.totalAmount} onChange={(e) => set('totalAmount', e.target.value)} />
        </div>
        <div>
          <Label>Received (USD)</Label>
          <Input type="number" min="0" step="1000" placeholder="0" value={vals.receivedAmount} onChange={(e) => set('receivedAmount', e.target.value)} />
        </div>
        <div>
          <Label>Spent (USD)</Label>
          <Input type="number" min="0" step="1000" placeholder="0" value={vals.spentAmount} onChange={(e) => set('spentAmount', e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Claim Status</Label>
        <Select value={vals.claimStatus} onValueChange={(v) => set('claimStatus', v as ClaimStatus)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {CLAIM_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
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
        <Button type="submit" loading={loading}>Save Fund</Button>
      </div>
    </form>
  );
}

export default function FundsPage() {
  const { user } = useAppStore();
  const qc = useQueryClient();

  const [filterType, setFilterType] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editFund, setEditFund] = useState<Fund | null>(null);
  const [deleteFund, setDeleteFund] = useState<Fund | null>(null);

  const { data: funds = [], isLoading } = useQuery({
    queryKey: ['funds', filterType, filterYear, filterStatus],
    queryFn: () => fundsApi.list({
      fundType: filterType || undefined,
      fiscalYear: filterYear ? parseInt(filterYear) : undefined,
      claimStatus: filterStatus || undefined,
    }),
  });

  const { data: summary } = useQuery({
    queryKey: ['funds-summary'],
    queryFn: fundsApi.getSummary,
  });

  const { data: partners = [] } = useQuery({
    queryKey: ['partners-list'],
    queryFn: () => partnersApi.getAll(),
  });

  const createMut = useMutation({
    mutationFn: (data: Partial<Fund>) => fundsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['funds'] }); qc.invalidateQueries({ queryKey: ['funds-summary'] }); setShowCreate(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Fund> }) => fundsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['funds'] }); qc.invalidateQueries({ queryKey: ['funds-summary'] }); setEditFund(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => fundsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['funds'] }); qc.invalidateQueries({ queryKey: ['funds-summary'] }); setDeleteFund(null); },
  });

  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  const fmt = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  const handleExport = () => {
    exportToExcel(funds.map(f => ({
      'Partner': f.partnerName,
      'Fund Type': f.fundType,
      'Fiscal Year': f.fiscalYear,
      'Total Amount (USD)': f.totalAmount,
      'Received (USD)': f.receivedAmount,
      'Spent (USD)': f.spentAmount,
      'Remaining (USD)': f.receivedAmount - f.spentAmount,
      'Claim Status': f.claimStatus,
      'Notes': f.notes ?? '',
    })), 'Funds_Report');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fund & Rebate Tracker</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track partner program funds, rebates, and marketing budgets</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download size={14} className="mr-1.5" />Export
          </Button>
          {canEdit && (
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus size={14} className="mr-1.5" />Add Fund Entry
            </Button>
          )}
        </div>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Wallet} label="Total Committed" value={fmt(summary.grandTotal)} sub="All fund programs" color="bg-indigo-500" />
          <StatCard icon={TrendingUp} label="Total Received" value={fmt(summary.grandReceived)} sub="Funds in hand" color="bg-green-500" />
          <StatCard icon={PiggyBank} label="Utilization Rate" value={`${summary.utilizationRate}%`} sub="Spent / Received" color="bg-blue-500" />
          <StatCard icon={Clock} label="Pending Claims" value={summary.pendingClaims} sub="Awaiting action" color="bg-amber-500" />
        </div>
      )}

      {/* Type breakdown */}
      {summary && Object.keys(summary.totalByType).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FUND_TYPES.filter(t => summary.totalByType[t]).map((type) => {
            const data = summary.totalByType[type];
            const { color, bg } = fundTypeCfg(type);
            const pct = data.received > 0 ? Math.round((data.spent / data.received) * 100) : 0;
            return (
              <Card key={type}>
                <CardContent className={cn('p-4 border rounded-xl', bg)}>
                  <p className={cn('text-sm font-semibold mb-3', color)}>{type}</p>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Committed</span><span className="font-semibold">{fmt(data.total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Received</span><span className="font-semibold">{fmt(data.received)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spent</span><span className="font-semibold">{fmt(data.spent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining</span><span className="font-semibold text-green-700">{fmt(data.remaining)}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Utilization</span><span>{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Fund Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Fund Types</SelectItem>
                {FUND_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="All Years" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Years</SelectItem>
                {FISCAL_YEARS.map((y) => <SelectItem key={y} value={y.toString()}>FY{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                {CLAIM_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            {(filterType || filterYear || filterStatus) && (
              <Button variant="ghost" size="sm" onClick={() => { setFilterType(''); setFilterYear(''); setFilterStatus(''); }}>
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
          ) : funds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Wallet size={40} className="mb-3 opacity-30" />
              <p className="font-medium">No fund entries found</p>
              <p className="text-sm mt-1">Add your first fund entry to track program funds</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Partner</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">FY</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Committed</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Received</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Spent</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Remaining</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Claim Status</th>
                    {canEdit && <th className="px-4 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {funds.map((fund) => {
                    const remaining = Number(fund.receivedAmount) - Number(fund.spentAmount);
                    const { color } = fundTypeCfg(fund.fundType);
                    return (
                      <tr key={fund.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-4 py-3 font-medium text-gray-900">{fund.partnerName}</td>
                        <td className="px-4 py-3">
                          <span className={cn('text-xs font-semibold', color)}>{fund.fundType}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">FY{fund.fiscalYear}</td>
                        <td className="px-4 py-3 text-gray-700">{fmt(fund.totalAmount)}</td>
                        <td className="px-4 py-3 text-gray-700">{fmt(fund.receivedAmount)}</td>
                        <td className="px-4 py-3 text-gray-700">{fmt(fund.spentAmount)}</td>
                        <td className="px-4 py-3">
                          <span className={remaining >= 0 ? 'text-green-700 font-semibold' : 'text-red-600 font-semibold'}>
                            {fmt(remaining)}
                          </span>
                        </td>
                        <td className="px-4 py-3"><ClaimStatusBadge status={fund.claimStatus} /></td>
                        {canEdit && (
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditFund(fund)}
                                className="px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeleteFund(fund)}
                                className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Fund Entry</DialogTitle></DialogHeader>
          <DialogBody>
            <FundForm
              partners={partners}
              onSubmit={(data) => createMut.mutate(data)}
              loading={createMut.isPending}
            />
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      {editFund && (
        <Dialog open={!!editFund} onOpenChange={() => setEditFund(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Edit Fund Entry</DialogTitle></DialogHeader>
            <DialogBody>
              <FundForm
                partners={partners}
                defaultValues={editFund}
                onSubmit={(data) => updateMut.mutate({ id: editFund.id, data })}
                loading={updateMut.isPending}
              />
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={!!deleteFund} onOpenChange={() => setDeleteFund(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Fund Entry</DialogTitle></DialogHeader>
          <DialogBody>
            <p className="text-sm text-gray-600 mb-4">
              Delete the <strong>{deleteFund?.fundType}</strong> entry for <strong>{deleteFund?.partnerName}</strong>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteFund(null)}>Cancel</Button>
              <Button variant="danger" loading={deleteMut.isPending} onClick={() => deleteFund && deleteMut.mutate(deleteFund.id)}>Delete</Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
