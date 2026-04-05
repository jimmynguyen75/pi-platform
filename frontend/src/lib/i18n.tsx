import { createContext, useContext, useState, ReactNode } from 'react';

export type Lang = 'en' | 'vi';

const T = {
  en: {
    // Nav
    dashboard: 'Dashboard',
    partners: 'Partners',
    deals: 'Deals',
    funds: 'Funds',
    managers: 'Managers',
    adminPanel: 'Admin Panel',
    myAccount: 'My Account',
    publicDirectory: 'Public Directory',
    signOut: 'Sign out',
    // Common
    search: 'Search partners...',
    notifications: 'Notifications',
    markAllRead: 'Mark all read',
    noNotifications: 'No notifications',
    viewAllRisk: 'View all risk partners →',
    atRisk: 'At Risk',
    clickReview: 'Click to review',
    collapse: 'Collapse',
    // Deals
    dealRegistration: 'Deal Registration',
    dealSubtitle: 'Track partner deals and pipeline',
    registerDeal: 'Register Deal',
    export: 'Export',
    allStatuses: 'All Statuses',
    allBUs: 'All BUs',
    totalDeals: 'Total Deals',
    successRate: 'Success Rate',
    pipelineValue: 'Pipeline Value',
    wonValue: 'Won Value',
    partner: 'Partner',
    customer: 'Customer',
    value: 'Value',
    status: 'Status',
    businessUnit: 'Business Unit',
    closeDate: 'Close Date',
    registered: 'Registered',
    noDeals: 'No deals found',
    noDealsHint: 'Register your first deal to get started',
    // Funds
    fundTracker: 'Fund & Rebate Tracker',
    fundSubtitle: 'Track partner program funds, rebates, and marketing budgets',
    addFund: 'Add Fund Entry',
    totalCommitted: 'Total Committed',
    totalReceived: 'Total Received',
    utilizationRate: 'Utilization Rate',
    pendingClaims: 'Pending Claims',
    fundType: 'Type',
    fiscalYear: 'FY',
    committed: 'Committed',
    received: 'Received',
    spent: 'Spent',
    remaining: 'Remaining',
    claimStatus: 'Claim Status',
    noFunds: 'No fund entries found',
    noFundsHint: 'Add your first fund entry to track program funds',
    allFundTypes: 'All Fund Types',
    allYears: 'All Years',
    // Partner list
    partnerExplorer: 'Partner Explorer',
    addPartner: 'Add Partner',
    // Account
    myAccountTitle: 'My Account',
    myAccountSubtitle: 'Manage your profile and security settings',
    profileInfo: 'Profile Information',
    profilePhoto: 'Profile Photo',
    changePhoto: 'Change photo',
    remove: 'Remove',
    fullName: 'Full Name',
    jobTitle: 'Job Title',
    email: 'Email',
    role: 'Role',
    saveChanges: 'Save Changes',
    profileUpdated: 'Profile updated successfully!',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    updatePassword: 'Update Password',
    passwordChanged: 'Password changed successfully!',
  },
  vi: {
    // Nav
    dashboard: 'Tổng quan',
    partners: 'Đối tác',
    deals: 'Deals',
    funds: 'Quỹ & Rebate',
    managers: 'Quản lý',
    adminPanel: 'Quản trị',
    myAccount: 'Tài khoản của tôi',
    publicDirectory: 'Danh bạ công khai',
    signOut: 'Đăng xuất',
    // Common
    search: 'Tìm kiếm đối tác...',
    notifications: 'Thông báo',
    markAllRead: 'Đánh dấu đã đọc',
    noNotifications: 'Không có thông báo',
    viewAllRisk: 'Xem tất cả đối tác rủi ro →',
    atRisk: 'Rủi ro',
    clickReview: 'Nhấn để xem',
    collapse: 'Thu gọn',
    // Deals
    dealRegistration: 'Đăng ký Deal',
    dealSubtitle: 'Theo dõi deals và pipeline của đối tác',
    registerDeal: 'Thêm Deal',
    export: 'Xuất file',
    allStatuses: 'Tất cả trạng thái',
    allBUs: 'Tất cả BU',
    totalDeals: 'Tổng Deal',
    successRate: 'Tỷ lệ thành công',
    pipelineValue: 'Giá trị Pipeline',
    wonValue: 'Giá trị thắng',
    partner: 'Đối tác',
    customer: 'Khách hàng',
    value: 'Giá trị',
    status: 'Trạng thái',
    businessUnit: 'Đơn vị BU',
    closeDate: 'Ngày đóng',
    registered: 'Ngày tạo',
    noDeals: 'Chưa có deal nào',
    noDealsHint: 'Thêm deal đầu tiên để bắt đầu',
    // Funds
    fundTracker: 'Quản lý Quỹ & Rebate',
    fundSubtitle: 'Theo dõi quỹ chương trình, rebate và quỹ marketing của đối tác',
    addFund: 'Thêm quỹ',
    totalCommitted: 'Tổng cam kết',
    totalReceived: 'Đã nhận',
    utilizationRate: 'Tỷ lệ sử dụng',
    pendingClaims: 'Chờ xử lý',
    fundType: 'Loại quỹ',
    fiscalYear: 'Năm tài chính',
    committed: 'Cam kết',
    received: 'Đã nhận',
    spent: 'Đã chi',
    remaining: 'Còn lại',
    claimStatus: 'Trạng thái claim',
    noFunds: 'Chưa có quỹ nào',
    noFundsHint: 'Thêm quỹ đầu tiên để theo dõi',
    allFundTypes: 'Tất cả loại quỹ',
    allYears: 'Tất cả năm',
    // Partner list
    partnerExplorer: 'Danh sách đối tác',
    addPartner: 'Thêm đối tác',
    // Account
    myAccountTitle: 'Tài khoản của tôi',
    myAccountSubtitle: 'Quản lý thông tin cá nhân và bảo mật',
    profileInfo: 'Thông tin cá nhân',
    profilePhoto: 'Ảnh đại diện',
    changePhoto: 'Đổi ảnh',
    remove: 'Xóa ảnh',
    fullName: 'Họ và tên',
    jobTitle: 'Chức vụ',
    email: 'Email',
    role: 'Vai trò',
    saveChanges: 'Lưu thay đổi',
    profileUpdated: 'Cập nhật thành công!',
    changePassword: 'Đổi mật khẩu',
    currentPassword: 'Mật khẩu hiện tại',
    newPassword: 'Mật khẩu mới',
    confirmPassword: 'Xác nhận mật khẩu mới',
    updatePassword: 'Cập nhật mật khẩu',
    passwordChanged: 'Đổi mật khẩu thành công!',
  },
} as const;

export type TranslationKey = keyof typeof T.en;

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nCtx>({
  lang: 'en',
  setLang: () => {},
  t: (k) => T.en[k],
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem('pi_lang') as Lang) ?? 'en'
  );

  const setLang = (l: Lang) => {
    localStorage.setItem('pi_lang', l);
    setLangState(l);
  };

  const t = (key: TranslationKey): string => T[lang][key] ?? T.en[key];

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
