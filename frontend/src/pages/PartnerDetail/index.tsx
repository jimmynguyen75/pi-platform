import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  ArrowLeft, Edit2, Plus, Trash2, Save, X, ExternalLink, Mail, Phone,
  User, MapPin, Link2, Bot, Sparkles, FileText, ChevronRight,
  AlertTriangle, CheckCircle2, Info, RefreshCw,
} from 'lucide-react';
import { partnersApi } from '../../api/partners';
import { activitiesApi } from '../../api/activities';
import { employeesApi } from '../../api/employees';
import { domainsApi } from '../../api/domains';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input, Textarea } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Progress } from '../../components/ui/progress';
import { Skeleton } from '../../components/ui/skeleton';
import { Confirm } from '../../components/ui/confirm';
import { useAppStore } from '../../store/useAppStore';
import type { OfficialLink, ContactInfo, Partner } from '../../types';
import { cn } from '../../lib/utils';

dayjs.extend(relativeTime);

const ACT_CONFIG: Record<string, { color: string; label: string; emoji: string; bg: string }> = {
  meeting: { color: '#4f46e5', label: 'Meeting', emoji: '🤝', bg: '#eef2ff' },
  deal:    { color: '#16a34a', label: 'Deal',    emoji: '💼', bg: '#f0fdf4' },
  email:   { color: '#d97706', label: 'Email',   emoji: '📧', bg: '#fffbeb' },
  call:    { color: '#7c3aed', label: 'Call',    emoji: '📞', bg: '#f5f3ff' },
  review:  { color: '#0891b2', label: 'Review',  emoji: '📋', bg: '#ecfeff' },
};

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAppStore();
  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  // Activity form state
  const [activityModal, setActivityModal] = useState(false);
  const [actVals, setActVals] = useState({ type: 'meeting', title: '', note: '', date: dayjs().format('YYYY-MM-DD'), managerId: user?.id ?? '' });

  // Edit partner form state
  const [editModal, setEditModal] = useState(false);
  const [editVals, setEditVals] = useState<any>({});

  // Notes/playbook inline edit
  const [notesEditing, setNotesEditing] = useState(false);
  const [notesValue, setNotesValue] = useState('');

  // AI parse
  const [aiParseModal, setAiParseModal] = useState(false);
  const [aiParseText, setAiParseText] = useState('');

  const { data: partner, isLoading } = useQuery({
    queryKey: ['partner', id],
    queryFn: () => partnersApi.getOne(id!),
    enabled: !!id,
  });

  const { data: aiSummary, isLoading: aiLoading, refetch: refetchSummary } = useQuery({
    queryKey: ['partner-ai-summary', id],
    queryFn: () => partnersApi.getAiSummary(id!),
    enabled: false,
  });

  const { data: managers } = useQuery({ queryKey: ['employees'], queryFn: () => employeesApi.getAll() });
  const { data: domains } = useQuery({ queryKey: ['domains'], queryFn: domainsApi.getAll });

  const addActivityMutation = useMutation({
    mutationFn: activitiesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setActivityModal(false);
      setActVals({ type: 'meeting', title: '', note: '', date: dayjs().format('YYYY-MM-DD'), managerId: user?.id ?? '' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Partner>) => partnersApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner', id] });
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      setEditModal(false);
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: activitiesApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partner', id] }),
  });

  const parseActivityMutation = useMutation({
    mutationFn: (text: string) => partnersApi.parseActivity(text),
    onSuccess: (parsed) => {
      setActVals({ type: parsed.type, title: parsed.title, note: parsed.note, date: parsed.date, managerId: user?.id ?? '' });
      setAiParseModal(false);
      setActivityModal(true);
    },
  });

  const openEdit = () => {
    if (!partner) return;
    setEditVals({
      name: partner.name,
      domainId: partner.domainId,
      managerId: partner.managerId ?? '',
      priorityLevel: partner.priorityLevel,
      status: partner.status,
      description: partner.description ?? '',
      logoUrl: partner.logoUrl ?? '',
      contactEmail: partner.contactInfo?.email ?? '',
      contactPhone: partner.contactInfo?.phone ?? '',
      contactName: partner.contactInfo?.contactName ?? '',
      contactAddress: partner.contactInfo?.address ?? '',
    });
    setEditModal(true);
  };

  const handleUpdateSubmit = () => {
    const { contactEmail, contactPhone, contactName, contactAddress, ...rest } = editVals;
    updateMutation.mutate({
      ...rest,
      contactInfo: { email: contactEmail, phone: contactPhone, contactName, address: contactAddress },
    });
  };

  const generateInsights = () => {
    if (!partner) return [];
    const items: { type: 'warning' | 'info' | 'success'; msg: string }[] = [];
    const acts = partner.activities ?? [];

    if (acts.length === 0) items.push({ type: 'warning', msg: 'No activities recorded yet. Start logging interactions to track engagement and health score.' });

    if (partner.healthScore < 40) {
      items.push({ type: 'warning', msg: `Health score is critically low (${partner.healthScore}/100). Immediate action needed — schedule a review meeting.` });
    } else if (partner.healthScore < 70) {
      items.push({ type: 'info', msg: `Health score is ${partner.healthScore}/100 (fair). Consider increasing engagement frequency.` });
    } else {
      items.push({ type: 'success', msg: `Health score is ${partner.healthScore}/100 — partnership is healthy and well-engaged.` });
    }

    if (acts.length > 0) {
      const days = dayjs().diff(dayjs(acts[0].date), 'day');
      if (days >= 30) items.push({ type: 'warning', msg: `Last activity was ${days} days ago. Relationship may be cooling — schedule a touchpoint.` });
    }
    if (!partner.managerId) items.push({ type: 'warning', msg: 'No manager assigned. Assign a manager to ensure accountability.' });
    if (partner.priorityLevel === 'Strategic' && partner.healthScore < 60) items.push({ type: 'warning', msg: 'Strategic partner with below-average health score. Consider escalating to management.' });
    if (!partner.officialLinks?.length) items.push({ type: 'info', msg: 'No official links configured. Add vendor portal, documentation, or support links for quick access.' });

    return items;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!partner) return <div className="text-red-500 text-sm">Partner not found.</div>;

  const activities = [...(partner.activities ?? [])].sort((a, b) => a.date < b.date ? 1 : -1);
  const insights = generateInsights();
  const scoreColor = partner.healthScore >= 70 ? '#16a34a' : partner.healthScore >= 40 ? '#d97706' : '#dc2626';
  const officialLinks: OfficialLink[] = partner.officialLinks ?? [];
  const contactInfo: ContactInfo = partner.contactInfo ?? {};

  return (
    <div className="animate-fade-in space-y-4">
      {/* Breadcrumb + header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card px-6 py-5">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <button onClick={() => navigate('/partners')} className="hover:text-gray-600 transition-colors flex items-center gap-1">
            <ArrowLeft size={12} /> Partners
          </button>
          <ChevronRight size={12} />
          <span className="text-gray-700 font-medium">{partner.name}</span>
        </div>

        <div className="flex items-start gap-4">
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
            <h1 className="text-2xl font-bold text-gray-900">{partner.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <PriorityBadge priority={partner.priorityLevel} />
              <StatusBadge status={partner.status} />
              {partner.domain && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-lg"
                  style={{ background: `${partner.domain.colorHex}18`, color: partner.domain.colorHex }}
                >
                  {partner.domain.name}
                </span>
              )}
            </div>
            {partner.description && (
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{partner.description}</p>
            )}
          </div>

          {/* Health score + actions */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-3xl font-black leading-none" style={{ color: scoreColor }}>{partner.healthScore}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">/ 100 health</p>
              <Progress value={partner.healthScore} indicatorColor={scoreColor} className="mt-1.5 w-20 h-1.5" />
            </div>
            {canEdit && (
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={openEdit}><Edit2 size={13} />Edit</Button>
                <Button size="sm" onClick={() => setActivityModal(true)}><Plus size={13} />Log Activity</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left column — tabs */}
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-5">
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                  <TabsTrigger value="notes">Notes / Playbook</TabsTrigger>
                </TabsList>

                {/* OVERVIEW */}
                <TabsContent value="overview" className="space-y-4">
                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Domain', value: partner.domain ? (
                        <span className="text-sm font-medium px-2 py-0.5 rounded-lg" style={{ background: `${partner.domain.colorHex}18`, color: partner.domain.colorHex }}>{partner.domain.name}</span>
                      ) : '—' },
                      { label: 'Priority', value: <PriorityBadge priority={partner.priorityLevel} /> },
                      { label: 'Status',   value: <StatusBadge status={partner.status} /> },
                      { label: 'Activities', value: <span className="text-xl font-bold text-gray-900">{activities.length}</span> },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50/60 rounded-xl p-3">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
                        <div>{value}</div>
                      </div>
                    ))}
                  </div>

                  {partner.description && (
                    <div className="bg-gray-50/60 rounded-xl p-4">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{partner.description}</p>
                    </div>
                  )}

                  {/* Contact & Links */}
                  {(contactInfo.contactName || contactInfo.email || contactInfo.phone || contactInfo.address || officialLinks.length > 0) && (
                    <div className="bg-gray-50/60 rounded-xl p-4 space-y-3">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Contact & External Access</p>
                      {contactInfo.contactName && (
                        <div className="flex items-center gap-2.5 text-sm text-gray-700">
                          <User size={14} className="text-gray-400 shrink-0" />
                          {contactInfo.contactName}
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
                          <Phone size={14} className="text-gray-400 shrink-0" />
                          {contactInfo.phone}
                        </div>
                      )}
                      {contactInfo.address && (
                        <div className="flex items-center gap-2.5 text-sm text-gray-700">
                          <MapPin size={14} className="text-gray-400 shrink-0" />
                          {contactInfo.address}
                        </div>
                      )}
                      {officialLinks.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Official Links</p>
                          <div className="flex flex-wrap gap-2">
                            {officialLinks.map((lnk, i) => (
                              <a
                                key={i}
                                href={lnk.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition-colors"
                              >
                                <Link2 size={11} />
                                {lnk.label}
                                <ExternalLink size={10} className="opacity-60" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* ACTIVITY TIMELINE */}
                <TabsContent value="activity">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500">{activities.length} activit{activities.length !== 1 ? 'ies' : 'y'}</p>
                    {canEdit && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setAiParseModal(true)}>
                          <Bot size={13} /> AI Parse
                        </Button>
                        <Button size="sm" onClick={() => setActivityModal(true)}>
                          <Plus size={13} /> Log Activity
                        </Button>
                      </div>
                    )}
                  </div>

                  {activities.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm">No activities yet. Log the first one!</div>
                  ) : (
                    <div className="space-y-0 relative">
                      <div className="absolute left-5 top-4 bottom-4 w-px bg-gray-100" />
                      {activities.map((act, idx) => {
                        const cfg = ACT_CONFIG[act.type] ?? ACT_CONFIG.meeting;
                        return (
                          <div key={act.id} className={cn('relative flex gap-4 pb-4', idx === activities.length - 1 && 'pb-0')}>
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 z-10 border-2 border-white"
                              style={{ background: cfg.bg }}
                            >
                              {cfg.emoji}
                            </div>
                            <div className="flex-1 bg-gray-50/60 rounded-xl p-3.5 group">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-gray-900">{act.title || cfg.label}</span>
                                    <span
                                      className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                                      style={{ background: `${cfg.color}18`, color: cfg.color }}
                                    >
                                      {act.type}
                                    </span>
                                  </div>
                                  {act.note && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{act.note}</p>}
                                  <p className="text-[10px] text-gray-400 mt-1.5">
                                    {dayjs(act.date).format('MMM D, YYYY')} · {dayjs(act.date).fromNow()}
                                    {act.manager && ` · by ${act.manager.name}`}
                                  </p>
                                </div>
                                {canEdit && (
                                  <Confirm title="Delete activity?" onConfirm={() => deleteActivityMutation.mutate(act.id)}>
                                    <Button variant="danger-ghost" size="icon-sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Trash2 size={12} />
                                    </Button>
                                  </Confirm>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                {/* INSIGHTS */}
                <TabsContent value="insights" className="space-y-3">
                  {insights.map((ins, i) => {
                    const cfg = {
                      warning: { icon: <AlertTriangle size={15} className="text-amber-500 shrink-0" />, cls: 'bg-amber-50 border-amber-200' },
                      info:    { icon: <Info size={15} className="text-blue-500 shrink-0" />,           cls: 'bg-blue-50 border-blue-200' },
                      success: { icon: <CheckCircle2 size={15} className="text-green-500 shrink-0" />,  cls: 'bg-green-50 border-green-200' },
                    }[ins.type];
                    return (
                      <div key={i} className={cn('flex items-start gap-3 p-3.5 rounded-xl border', cfg.cls)}>
                        <div className="mt-0.5">{cfg.icon}</div>
                        <p className="text-sm text-gray-700 leading-relaxed">{ins.msg}</p>
                      </div>
                    );
                  })}

                  {/* AI summary */}
                  <div className="mt-2 border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-indigo-500" />
                        <span className="text-sm font-semibold text-gray-800">AI Summary</span>
                        <Badge variant="primary" className="text-[10px]">Rule-based</Badge>
                      </div>
                      <Button variant="outline" size="sm" loading={aiLoading} onClick={() => refetchSummary()}>
                        <RefreshCw size={12} /> Generate
                      </Button>
                    </div>
                    {aiSummary ? (
                      <div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">{aiSummary.summary}</p>
                        {aiSummary.insights.length > 0 && (
                          <ul className="space-y-1.5">
                            {aiSummary.insights.map((ins, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                <span className="text-indigo-400 mt-0.5">→</span>
                                {ins}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">Click Generate to create an AI-powered analysis of this partnership.</p>
                    )}
                  </div>
                </TabsContent>

                {/* NOTES / PLAYBOOK */}
                <TabsContent value="notes">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">Internal Notes & Playbook</span>
                    </div>
                    {canEdit && !notesEditing && (
                      <Button variant="outline" size="sm" onClick={() => { setNotesValue(partner.notes ?? ''); setNotesEditing(true); }}>
                        <Edit2 size={12} /> Edit
                      </Button>
                    )}
                  </div>

                  {notesEditing ? (
                    <div className="space-y-3">
                      <Textarea
                        rows={12}
                        value={notesValue}
                        onChange={(e) => setNotesValue(e.target.value)}
                        placeholder="Add internal notes, playbook, SLAs, escalation procedures..."
                        className="text-sm"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => setNotesEditing(false)}><X size={12} /> Cancel</Button>
                        <Button size="sm" loading={updateMutation.isPending} onClick={() => { updateMutation.mutate({ notes: notesValue }); setNotesEditing(false); }}>
                          <Save size={12} /> Save
                        </Button>
                      </div>
                    </div>
                  ) : partner.notes ? (
                    <div className="bg-gray-50/60 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {partner.notes}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-sm text-gray-400">
                      No notes yet. {canEdit && 'Click Edit to add internal notes or playbook.'}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Manager */}
          <Card>
            <CardHeader><CardTitle>Assigned Manager</CardTitle></CardHeader>
            <CardContent>
              {partner.manager ? (
                <div className="flex items-center gap-3">
                  <Avatar size="md">
                    <AvatarFallback gradient="indigo">{partner.manager.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{partner.manager.name}</p>
                    {partner.manager.title && <p className="text-xs text-gray-400">{partner.manager.title}</p>}
                    <Badge variant={partner.manager.role === 'admin' ? 'purple' : 'primary'} className="text-[10px] mt-1">{partner.manager.role}</Badge>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-2">No manager assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Health score breakdown */}
          <Card>
            <CardHeader><CardTitle>Health Score</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-4xl font-black" style={{ color: scoreColor }}>{partner.healthScore}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {partner.healthScore >= 70 ? 'Healthy' : partner.healthScore >= 40 ? 'Fair' : 'Critical'} · out of 100
                </p>
              </div>
              <Progress value={partner.healthScore} indicatorColor={scoreColor} className="h-2.5" />
              <div className="mt-4 space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Activities (30d)</span>
                  <span className="font-medium text-gray-700">{activities.filter(a => dayjs().diff(dayjs(a.date), 'day') <= 30).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total activities</span>
                  <span className="font-medium text-gray-700">{activities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last activity</span>
                  <span className="font-medium text-gray-700">
                    {activities[0] ? dayjs(activities[0].date).fromNow() : 'Never'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick links */}
          {officialLinks.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Quick Links</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {officialLinks.map((lnk, i) => (
                  <a
                    key={i}
                    href={lnk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Link2 size={13} className="text-indigo-400" />
                      <span className="text-sm font-medium text-gray-700">{lnk.label}</span>
                    </div>
                    <ExternalLink size={12} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </a>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Meta */}
          <Card>
            <CardHeader><CardTitle>Metadata</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Created</span>
                <span className="font-medium text-gray-700">{dayjs(partner.createdAt).format('MMM D, YYYY')}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Last updated</span>
                <span className="font-medium text-gray-700">{dayjs(partner.updatedAt).fromNow()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Log Activity Dialog ─────────────────────────────────────────────── */}
      <Dialog open={activityModal} onOpenChange={(o) => { if (!o) setActivityModal(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Activity for {partner.name}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={actVals.type} onValueChange={(v) => setActVals(p => ({ ...p, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACT_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.emoji} {v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={actVals.date} onChange={(e) => setActVals(p => ({ ...p, date: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Title</Label>
              <Input placeholder="Brief title..." value={actVals.title} onChange={(e) => setActVals(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <Label>Note</Label>
              <Textarea rows={3} placeholder="Details, outcomes, next steps..." value={actVals.note} onChange={(e) => setActVals(p => ({ ...p, note: e.target.value }))} />
            </div>
            <div>
              <Label>Manager</Label>
              <Select value={actVals.managerId} onValueChange={(v) => setActVals(p => ({ ...p, managerId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select manager" /></SelectTrigger>
                <SelectContent>
                  {managers?.filter(m => m.role === 'manager' || m.role === 'admin').map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end">
              <Button
                loading={addActivityMutation.isPending}
                onClick={() => addActivityMutation.mutate({ ...actVals, type: actVals.type as any, partnerId: id })}
              >
                <Plus size={14} /> Log Activity
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* ── AI Parse Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={aiParseModal} onOpenChange={(o) => { if (!o) setAiParseModal(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Bot size={16} className="text-indigo-500" /> AI Activity Parser</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <p className="text-sm text-gray-500">Paste raw text (meeting notes, email snippets) and the AI will extract a structured activity.</p>
            <Textarea
              rows={6}
              placeholder="Paste meeting notes, email text, or raw description here..."
              value={aiParseText}
              onChange={(e) => setAiParseText(e.target.value)}
            />
            <div className="flex justify-end">
              <Button
                loading={parseActivityMutation.isPending}
                onClick={() => parseActivityMutation.mutate(aiParseText)}
                disabled={!aiParseText.trim()}
              >
                <Sparkles size={13} /> Extract Activity
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      {/* ── Edit Partner Dialog ─────────────────────────────────────────────── */}
      <Dialog open={editModal} onOpenChange={(o) => { if (!o) setEditModal(false); }}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>Edit: {partner.name}</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Partner Name</Label><Input value={editVals.name ?? ''} onChange={(e) => setEditVals((p: any) => ({ ...p, name: e.target.value }))} /></div>
              <div><Label>Logo URL</Label><Input placeholder="https://..." value={editVals.logoUrl ?? ''} onChange={(e) => setEditVals((p: any) => ({ ...p, logoUrl: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Domain</Label>
                <Select value={editVals.domainId ?? ''} onValueChange={(v) => setEditVals((p: any) => ({ ...p, domainId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
                  <SelectContent>{domains?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Manager</Label>
                <Select value={editVals.managerId ?? ''} onValueChange={(v) => setEditVals((p: any) => ({ ...p, managerId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Assign manager" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {managers?.filter(m => m.role === 'manager').map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Priority</Label>
                <Select value={editVals.priorityLevel ?? 'Normal'} onValueChange={(v) => setEditVals((p: any) => ({ ...p, priorityLevel: v }))}>
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
                <Select value={editVals.status ?? 'Active'} onValueChange={(v) => setEditVals((p: any) => ({ ...p, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Risk">At Risk</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-1">Contact Information</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Contact Name</Label><Input value={editVals.contactName ?? ''} onChange={(e) => setEditVals((p: any) => ({ ...p, contactName: e.target.value }))} /></div>
              <div><Label>Email</Label><Input type="email" value={editVals.contactEmail ?? ''} onChange={(e) => setEditVals((p: any) => ({ ...p, contactEmail: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input value={editVals.contactPhone ?? ''} onChange={(e) => setEditVals((p: any) => ({ ...p, contactPhone: e.target.value }))} /></div>
              <div><Label>Address</Label><Input value={editVals.contactAddress ?? ''} onChange={(e) => setEditVals((p: any) => ({ ...p, contactAddress: e.target.value }))} /></div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea rows={3} value={editVals.description ?? ''} onChange={(e) => setEditVals((p: any) => ({ ...p, description: e.target.value }))} />
            </div>

            <div className="flex justify-end">
              <Button loading={updateMutation.isPending} onClick={handleUpdateSubmit}>Save Changes</Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
