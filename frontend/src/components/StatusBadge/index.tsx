import { Badge } from '../ui/badge';
import type { PartnerStatus, PriorityLevel } from '../../types';

export function StatusBadge({ status }: { status: PartnerStatus }) {
  const cfg: Record<PartnerStatus, { variant: 'success' | 'warning' | 'danger'; label: string; dot: string }> = {
    Active:   { variant: 'success', label: 'Active',   dot: '#16a34a' },
    Risk:     { variant: 'warning', label: 'At Risk',  dot: '#d97706' },
    Inactive: { variant: 'danger',  label: 'Inactive', dot: '#dc2626' },
  };
  const { variant, label, dot } = cfg[status] ?? { variant: 'default' as any, label: status, dot: '#888' };
  return <Badge variant={variant} dot dotColor={dot}>{label}</Badge>;
}

export function PriorityBadge({ priority }: { priority: PriorityLevel }) {
  const cfg: Record<PriorityLevel, { variant: 'purple' | 'blue' | 'default'; dot: string }> = {
    Strategic: { variant: 'purple', dot: '#7c3aed' },
    Key:       { variant: 'blue',   dot: '#2563eb' },
    Normal:    { variant: 'default',dot: '#6b7280' },
  };
  const { variant, dot } = cfg[priority] ?? { variant: 'default' as any, dot: '#888' };
  return <Badge variant={variant} dot dotColor={dot}>{priority}</Badge>;
}
