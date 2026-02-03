export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Transaction {
  id: number;
  user: string;
  date: string;
  description: string;
  amount: string;
  category: string;
  transaction_type: 'income' | 'expense';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  user: number;
  transaction_type: 'income' | 'expense';
  created_at: string;
}

export interface Balance {
  total_income: string;
  total_expenses: string;
  balance: string;
  monthly_income: string;
  monthly_expenses: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
