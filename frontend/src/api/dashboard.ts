import { get } from './client';
import type {
  DashboardStats,
  ManagerLoad,
  DomainBreakdown,
  ActivityTrend,
  Partner,
  Activity,
} from '../types';

export const dashboardApi = {
  getStats: () => get<DashboardStats>('/dashboard/stats'),
  getManagerLoad: () => get<ManagerLoad[]>('/dashboard/manager-load'),
  getDomainBreakdown: () => get<DomainBreakdown[]>('/dashboard/domain-breakdown'),
  getActivityTrend: (days?: number) =>
    get<ActivityTrend[]>('/dashboard/activity-trend', days ? { days } : undefined),
  getRiskPartners: () => get<Partner[]>('/dashboard/risk-partners'),
  getTopPartners: () => get<Partner[]>('/dashboard/top-partners'),
  getRecentActivities: (limit?: number) =>
    get<Activity[]>('/dashboard/recent-activities', limit ? { limit } : undefined),
};
