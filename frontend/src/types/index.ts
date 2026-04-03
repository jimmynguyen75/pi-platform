export type ManagerRole = 'admin' | 'manager';
export type PriorityLevel = 'Strategic' | 'Key' | 'Normal';
export type PartnerStatus = 'Active' | 'Risk' | 'Inactive';
export type ActivityType = 'meeting' | 'deal' | 'email' | 'call' | 'review';

/** System user — either an admin or a manager */
export interface Manager {
  id: string;
  name: string;
  email: string;
  role: ManagerRole;
  title?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/** Backward-compat alias used in some API calls */
export type Employee = Manager;

export interface Domain {
  id: string;
  name: string;
  description?: string;
  colorHex: string;
  partners?: Partner[];
  createdAt: string;
}

export interface OfficialLink {
  label: string;
  url: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  contactName?: string;
  address?: string;
  [key: string]: string | undefined;
}

export interface Partner {
  id: string;
  name: string;
  domainId: string;
  managerId?: string;
  domain?: Domain;
  manager?: Manager;
  priorityLevel: PriorityLevel;
  status: PartnerStatus;
  healthScore: number;
  description?: string;
  logoUrl?: string;
  officialLinks: OfficialLink[];
  contactInfo: ContactInfo;
  notes?: string;
  activities?: Activity[];
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  partnerId: string;
  managerId: string;
  type: ActivityType;
  date: string;
  title?: string;
  note?: string;
  partner?: Partner;
  manager?: Manager;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  entityType: string;
  entityId: string;
  fieldChanged: string;
  oldValue?: string;
  newValue?: string;
  updatedBy?: string;
  updatedByName?: string;
  timestamp: string;
}

export interface DashboardStats {
  totalPartners: number;
  byPriority: { strategic: number; key: number; normal: number };
  byStatus: { active: number; risk: number; inactive: number };
  totalManagers: number;
  totalActivities: number;
  recentActivities: number;
  avgHealthScore: number;
}

export interface ManagerLoad {
  id: string;
  name: string;
  title?: string;
  partnerCount: number;
  workloadScore: number;
  strategicCount: number;
  keyCount: number;
  normalCount: number;
}

export interface DomainBreakdown {
  id: string;
  name: string;
  colorHex: string;
  totalPartners: number;
  activePartners: number;
  riskPartners: number;
  inactivePartners: number;
  strategicPartners: number;
  avgHealthScore: number;
}

export interface ActivityTrend {
  date: string;
  count: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: ManagerRole;
  title?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface AiSummary {
  summary: string;
  insights: string[];
}

export interface ParsedActivity {
  type: string;
  title: string;
  note: string;
  date: string;
}
