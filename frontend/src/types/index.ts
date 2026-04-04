export type ManagerRole = 'admin' | 'manager';
export type PriorityLevel = 'Strategic' | 'Key' | 'Normal';
export type PartnerStatus = 'Active' | 'Risk' | 'Inactive';
export type PartnerTier = 'Titanium' | 'Platinum' | 'Gold' | 'Silver' | 'Registered' | 'Strategic Partner';
export type ActivityType = 'meeting' | 'deal' | 'email' | 'call' | 'review';
export type DealStatus = 'In Progress' | 'Won' | 'Lost' | 'Pending';
export type BusinessUnit = 'HSI' | 'HSC' | 'HAS' | 'HSE' | 'HSV';
export type FundType = 'Rebate' | 'Program Fund' | 'Marketing Fund';
export type ClaimStatus = 'Pending' | 'Submitted' | 'Approved' | 'Rejected' | 'Paid';

export interface Certification {
  name: string;
  issuedDate?: string;
  expiryDate?: string;
  level?: string;
}

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
  partnerTier?: PartnerTier;
  certifications?: Certification[];
  activities?: Activity[];
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  partnerId: string;
  partnerName: string;
  customerName: string;
  dealValue: number;
  expectedCloseDate?: string;
  status: DealStatus;
  businessUnit?: BusinessUnit;
  assignedManagerId?: string;
  assignedManager?: Manager;
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DealStats {
  total: number;
  won: number;
  lost: number;
  inProgress: number;
  pending: number;
  successRate: number;
  totalPipelineValue: number;
  wonValue: number;
  byBU: Record<string, number>;
}

export interface Fund {
  id: string;
  partnerId: string;
  partnerName: string;
  fundType: FundType;
  fiscalYear: number;
  totalAmount: number;
  receivedAmount: number;
  spentAmount: number;
  claimStatus: ClaimStatus;
  notes?: string;
  partner?: Partner;
  createdAt: string;
  updatedAt: string;
}

export interface FundSummary {
  totalByType: Record<string, { total: number; received: number; spent: number; remaining: number }>;
  grandTotal: number;
  grandReceived: number;
  utilizationRate: number;
  pendingClaims: number;
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
