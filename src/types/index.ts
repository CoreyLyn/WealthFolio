// 资产类型
export type AssetCategory = 
  | 'cash'           // 现金
  | 'deposit'        // 存款
  | 'fund'           // 基金
  | 'stock'          // 股票
  | 'bond'           // 债券
  | 'insurance'      // 保险
  | 'realestate'     // 房产
  | 'vehicle'        // 车辆
  | 'gold'           // 黄金
  | 'crypto'         // 数字货币
  | 'other_asset';   // 其他资产

// 负债类型
export type LiabilityCategory =
  | 'mortgage'       // 房贷
  | 'car_loan'       // 车贷
  | 'credit_card'    // 信用卡
  | 'consumer_loan'  // 消费贷
  | 'education_loan' // 教育贷款
  | 'other_liability'; // 其他负债

// 账户基础接口
export interface Account {
  id: string;
  name: string;
  amount: number;
  note?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

// 资产账户
export interface AssetAccount extends Account {
  type: 'asset';
  category: AssetCategory;
  platform?: string;  // 平台/银行
}

// 负债账户
export interface LiabilityAccount extends Account {
  type: 'liability';
  category: LiabilityCategory;
  interestRate?: number;  // 年利率
  dueDate?: string;       // 到期日
}

// 统一账户类型
export type AnyAccount = AssetAccount | LiabilityAccount;

// 资产快照（用于趋势图）
export interface Snapshot {
  id: string;
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  breakdown: {
    category: AssetCategory | LiabilityCategory;
    amount: number;
  }[];
}

// 应用状态
export interface AppState {
  assets: AssetAccount[];
  liabilities: LiabilityAccount[];
  snapshots: Snapshot[];
}

// 类别配置
export interface CategoryConfig {
  key: AssetCategory | LiabilityCategory;
  label: string;
  icon: string;
  color: string;
}

// 资产类别配置
export const ASSET_CATEGORIES: CategoryConfig[] = [
  { key: 'cash', label: '现金', icon: '💵', color: '#10B981' },
  { key: 'deposit', label: '存款', icon: '🏦', color: '#3B82F6' },
  { key: 'fund', label: '基金', icon: '📈', color: '#8B5CF6' },
  { key: 'stock', label: '股票', icon: '📊', color: '#F59E0B' },
  { key: 'bond', label: '债券', icon: '📄', color: '#6366F1' },
  { key: 'insurance', label: '保险', icon: '🛡️', color: '#14B8A6' },
  { key: 'realestate', label: '房产', icon: '🏠', color: '#EC4899' },
  { key: 'vehicle', label: '车辆', icon: '🚗', color: '#F97316' },
  { key: 'gold', label: '黄金', icon: '🪙', color: '#EAB308' },
  { key: 'crypto', label: '数字货币', icon: '₿', color: '#A855F7' },
  { key: 'other_asset', label: '其他资产', icon: '📦', color: '#64748B' },
];

// 负债类别配置
export const LIABILITY_CATEGORIES: CategoryConfig[] = [
  { key: 'mortgage', label: '房贷', icon: '🏠', color: '#EF4444' },
  { key: 'car_loan', label: '车贷', icon: '🚗', color: '#F97316' },
  { key: 'credit_card', label: '信用卡', icon: '💳', color: '#EC4899' },
  { key: 'consumer_loan', label: '消费贷', icon: '🛒', color: '#8B5CF6' },
  { key: 'education_loan', label: '教育贷款', icon: '🎓', color: '#3B82F6' },
  { key: 'other_liability', label: '其他负债', icon: '📋', color: '#64748B' },
];

// 工具函数
export const getCategoryConfig = (category: AssetCategory | LiabilityCategory): CategoryConfig | undefined => {
  return [...ASSET_CATEGORIES, ...LIABILITY_CATEGORIES].find(c => c.key === category);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCompactCurrency = (amount: number): string => {
  if (Math.abs(amount) >= 100000000) {
    return `¥${(amount / 100000000).toFixed(2)}亿`;
  }
  if (Math.abs(amount) >= 10000) {
    return `¥${(amount / 10000).toFixed(2)}万`;
  }
  return formatCurrency(amount);
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
