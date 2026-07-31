export type PageId =
  | 'dashboard' | 'transactions' | 'accounts' | 'transfer'
  | 'budget' | 'report' | 'goals' | 'advisor' | 'profile';

export type TxType = 'in' | 'out';

export interface Account {
  id: string;
  name: string;
  type: string;
  color_id: string;
  sort_order: number;
}

export interface Category {
  id: string;
  type: TxType;
  name: string;
  color: string | null;
  is_default: boolean;
  sort_order: number;
}

export interface Transaction {
  id: string;
  type: TxType;
  description: string;
  amount: number;
  account: string;
  category: string;
  date: string;
  time: string | null;
}

export interface Transfer {
  id: string;
  from_account: string;
  to_account: string;
  amount: number;
  admin_fee: number;
  fee_tx_id: string | null;
  note: string | null;
  date: string;
  time: string | null;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
}

export interface OpeningBalance {
  id: string;
  account: string;
  amount: number;
}

export interface Cicilan {
  id: string;
  name: string;
  type: string;
  total_debt: number;
  monthly_payment: number;
  due_day: number;
  account_id: string | null;
}

export interface SavingsGoal {
  id: string;
  name: string;
  icon: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
}

export interface RecurringTransaction {
  id: string;
  type: TxType;
  description: string;
  amount: number;
  account: string;
  category: string;
  frequency: string;
  next_due: string;
  active: boolean;
}

export interface AccountType {
  id: string;
  name: string;
  sort_order: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface NotificationSettings {
  remind_enabled: boolean;
  remind_hour: number;
  remind_minute: number;
  daily_limit_enabled: boolean;
  daily_limit_amount: number;
  daily_limit_notify: boolean;
}
