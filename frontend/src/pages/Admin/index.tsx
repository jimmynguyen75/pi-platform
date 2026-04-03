import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Users, Layers, RefreshCw, Crown, Edit2, Trash2, Plus, Shield, Info } from 'lucide-react';
import { employeesApi } from '../../api/employees';
import { domainsApi } from '../../api/domains';
import { partnersApi } from '../../api/partners';
import { useAppStore } from '../../store/useAppStore';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Confirm } from '../../components/ui/confirm';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Skeleton } from '../../components/ui/skeleton';
import type { Manager, Domain } from '../../types';

const DOMAIN_COLORS = ['#4f46e5','#16a34a','#d97706','#dc2626','#7c3aed','#0891b2','#be185d'];

/* ── Managers Tab ─────────────────────────────────────────────────────────── */
function ManagersTab() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Manager | null>(null);
  const [vals, setVals] = useState({ name: '', email: '', password: '', role: 'manager', title: '' });

  const { data: managers, isLoading } = useQuery({ queryKey: ['employees'], queryFn: () => employeesApi.getAll() });

  const set = (k: string, v: string) => setVals(prev => ({ ...prev, [k]: v }));

  const createMutation = useMutation({
    mutationFn: (d: any) => employeesApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); setModal(null); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => employeesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); setModal(null); setEditTarget(null); },
  });
  const deleteMutation = useMutation({
    mutationFn: employeesApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });

  const openCreate = () => { setEditTarget(null); setVals({ name: '', email: '', password: '', role: 'manager', title: '' }); setModal('create'); };
  const openEdit = (m: Manager) => { setEditTarget(m); setVals({ name: m.name, email: m.email, password: '', role: m.role, title: m.title ?? '' }); setModal('edit'); };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate}><Plus size={14} /> Add Manager</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
              <th className="py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Role</th>
              <th className="py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Title</th>
              <th className="py-2.5" />
            </tr>
          </thead>
          <tbody>
            {(managers ?? []).map((m) => (
              <tr key={m.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback gradient={m.role === 'admin' ? 'purple' : 'indigo'}>{m.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-gray-900">{m.name}</span>
                        {m.role === 'admin' && <Crown size={12} className="text-purple-500" />}
                      </div>
                      <span className="text-xs text-gray-400">{m.email}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <Badge variant={m.role === 'admin' ? 'purple' : 'primary'} className="text-[10px]">{m.role}</Badge>
                </td>
                <td className="py-3">
                  <span className="text-sm text-gray-500">{m.title || '—'}</span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(m)}><Edit2 size={13} /></Button>
                    <Confirm title="Delete manager?" description="Their partners will become unassigned." onConfirm={() => deleteMutation.mutate(m.id)}>
                      <Button variant="danger-ghost" size="icon-sm"><Trash2 size={13} /></Button>
                    </Confirm>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Dialog open={!!modal} onOpenChange={(o) => { if (!o) setModal(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modal === 'edit' ? `Edit: ${editTarget?.name}` : 'New Manager'}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Full Name</Label><Input value={vals.name} onChange={(e) => set('name', e.target.value)} /></div>
              <div><Label>Email</Label><Input type="email" value={vals.email} onChange={(e) => set('email', e.target.value)} /></div>
            </div>
            {modal === 'create' && (
              <div><Label>Password</Label><Input type="password" placeholder="Min. 6 characters" value={vals.password} onChange={(e) => set('password', e.target.value)} /></div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Role</Label>
                <Select value={vals.role} onValueChange={(v) => set('role', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin"><span className="flex items-center gap-1.5"><Crown size={12} className="text-purple-500" />Admin</span></SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Job Title</Label><Input placeholder="Partnership Manager" value={vals.title} onChange={(e) => set('title', e.target.value)} /></div>
            </div>
            <div className="flex justify-end pt-1">
              <Button
                loading={createMutation.isPending || updateMutation.isPending}
                onClick={() => modal === 'edit' && editTarget ? updateMutation.mutate({ id: editTarget.id, data: vals }) : createMutation.mutate(vals)}
              >
                {modal === 'edit' ? 'Save Changes' : 'Create Manager'}
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ── Domains Tab ──────────────────────────────────────────────────────────── */
function DomainsTab() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Domain | null>(null);
  const [vals, setVals] = useState({ name: '', description: '', colorHex: '#4f46e5' });

  const set = (k: string, v: string) => setVals(prev => ({ ...prev, [k]: v }));

  const { data: domains, isLoading } = useQuery({ queryKey: ['domains'], queryFn: domainsApi.getAll });
  const createMutation = useMutation({ mutationFn: domainsApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['domains'] }); setModal(false); } });
  const updateMutation = useMutation({ mutationFn: ({ id, data }: any) => domainsApi.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['domains'] }); setModal(false); setEditTarget(null); } });
  const deleteMutation = useMutation({ mutationFn: domainsApi.remove, onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }) });

  const openCreate = () => { setEditTarget(null); setVals({ name: '', description: '', colorHex: '#4f46e5' }); setModal(true); };
  const openEdit = (d: Domain) => { setEditTarget(d); setVals({ name: d.name, description: d.description ?? '', colorHex: d.colorHex }); setModal(true); };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openCreate}><Plus size={14} /> Add Domain</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Domain</th>
              <th className="py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Description</th>
              <th className="py-2.5 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Partners</th>
              <th className="py-2.5" />
            </tr>
          </thead>
          <tbody>
            {(domains ?? []).map((d) => (
              <tr key={d.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group">
                <td className="py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: d.colorHex }} />
                    <span className="text-sm font-semibold text-gray-900">{d.name}</span>
                  </div>
                </td>
                <td className="py-3 text-sm text-gray-500">{d.description || '—'}</td>
                <td className="py-3">
                  <Badge variant="default">{d.partners?.length ?? 0}</Badge>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(d)}><Edit2 size={13} /></Button>
                    <Confirm title="Delete domain?" description="Partners in this domain will be unlinked." onConfirm={() => deleteMutation.mutate(d.id)}>
                      <Button variant="danger-ghost" size="icon-sm"><Trash2 size={13} /></Button>
                    </Confirm>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Dialog open={modal} onOpenChange={(o) => { if (!o) setModal(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Domain' : 'New Domain'}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div><Label>Domain Name</Label><Input placeholder="e.g. Software" value={vals.name} onChange={(e) => set('name', e.target.value)} /></div>
            <div><Label>Description</Label><Input placeholder="Optional" value={vals.description} onChange={(e) => set('description', e.target.value)} /></div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap mt-1">
                {DOMAIN_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set('colorHex', c)}
                    className="w-7 h-7 rounded-lg transition-transform hover:scale-110 relative"
                    style={{ background: c }}
                  >
                    {vals.colorHex === c && (
                      <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <Button
                loading={createMutation.isPending || updateMutation.isPending}
                onClick={() => editTarget ? updateMutation.mutate({ id: editTarget.id, data: vals }) : createMutation.mutate(vals as any)}
              >
                {editTarget ? 'Save Changes' : 'Create Domain'}
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ── System Tab ───────────────────────────────────────────────────────────── */
function SystemTab() {
  const qc = useQueryClient();
  const recalcMutation = useMutation({
    mutationFn: partnersApi.bulkRecalculate,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['partners'] }); qc.invalidateQueries({ queryKey: ['dashboard-stats'] }); },
  });

  const SCORING_ROWS = [
    { label: 'Recency (0–50)', detail: '≤7d=50, ≤14d=40, ≤30d=30, ≤60d=15, else 0' },
    { label: 'Volume (0–30)',  detail: '90d: 10+=30, 6-9=25, 3-5=20, 1-2=10' },
    { label: 'Engagement (0–20)', detail: '30d: 3+=20, 2=15, 1=10' },
  ];

  return (
    <div className="space-y-4">
      {/* Health engine card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <RefreshCw size={14} className="text-indigo-500" />
          <CardTitle>Health Score Engine</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Force a full recalculation of health scores and risk status for all partners.
            Runs automatically after every activity change — use this to repair any inconsistencies.
          </p>
          <Button
            loading={recalcMutation.isPending}
            onClick={() => recalcMutation.mutate()}
          >
            <RefreshCw size={14} />
            Recalculate All Health Scores
          </Button>
          {recalcMutation.isSuccess && (
            <Alert variant="success" className="mt-4">
              <AlertDescription>All health scores recalculated successfully.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Scoring reference */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Info size={13} className="text-indigo-500" />
            <CardTitle className="text-xs">Health Score (0–100)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-1">
            {SCORING_ROWS.map(({ label, detail }) => (
              <div key={label}>
                <Badge variant="blue" className="text-[10px] mb-1">{label}</Badge>
                <p className="text-xs text-gray-500">{detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Shield size={13} className="text-purple-500" />
            <CardTitle className="text-xs">Status Logic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-1">
            {[
              { status: 'Active',   variant: 'success' as const, rule: 'Health ≥ 40 and activity within 30 days' },
              { status: 'Risk',     variant: 'warning' as const, rule: 'Health < 40 or no activity in 30+ days' },
              { status: 'Inactive', variant: 'danger'  as const, rule: 'Health < 10 and no activity in 90+ days' },
            ].map(({ status, variant, rule }) => (
              <div key={status}>
                <Badge variant={variant} className="text-[10px] mb-1">{status}</Badge>
                <p className="text-xs text-gray-500">{rule}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Layers size={13} className="text-green-500" />
            <CardTitle className="text-xs">Workload Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 pt-1">
            {[
              { label: 'Strategic partner', pts: '3 pts', variant: 'purple' as const },
              { label: 'Key partner',       pts: '2 pts', variant: 'blue'   as const },
              { label: 'Normal partner',    pts: '1 pt',  variant: 'default' as const },
            ].map(({ label, pts, variant }) => (
              <div key={label} className="flex items-center justify-between">
                <Badge variant={variant} className="text-[10px]">{label}</Badge>
                <span className="text-xs font-semibold text-gray-700">{pts}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function AdminPage() {
  const { user } = useAppStore();

  if (user?.role !== 'admin') {
    return (
      <Alert variant="danger" className="max-w-lg">
        <Shield size={16} className="shrink-0" />
        <div>
          <AlertDescription className="font-semibold">Access Denied</AlertDescription>
          <AlertDescription>You need Admin permissions to access the Admin Panel.</AlertDescription>
        </div>
      </Alert>
    );
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card px-6 py-5">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Settings size={20} className="text-purple-500" />
          Admin Panel
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage managers, domains, and system settings</p>
      </div>

      <Card>
        <CardContent className="p-5">
          <Tabs defaultValue="managers">
            <TabsList>
              <TabsTrigger value="managers"><Users size={14} />Managers</TabsTrigger>
              <TabsTrigger value="domains"><Layers size={14} />Domains</TabsTrigger>
              <TabsTrigger value="system"><RefreshCw size={14} />System</TabsTrigger>
            </TabsList>
            <TabsContent value="managers"><ManagersTab /></TabsContent>
            <TabsContent value="domains"><DomainsTab /></TabsContent>
            <TabsContent value="system"><SystemTab /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
