export interface Expense {
  id?: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  receipt_url?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export type ExpenseCategory = 
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Entertainment'
  | 'Health'
  | 'Bills'
  | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Health',
  'Bills',
  'Other'
];

export interface MonthlySummary {
  totalExpenses: number;
  expenseCount: number;
  categoryBreakdown: { category: ExpenseCategory; total: number }[];
}

