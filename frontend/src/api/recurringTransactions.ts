import api from './index';

export interface RecurringTransaction {
  id: number;
  user: number;
  name: string;
  description: string;
  amount: number;
  category: string;
  transaction_type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  next_occurrence: string;
  status: 'active' | 'paused' | 'completed';
  count_created: number;
  max_occurrences?: number;
  created_at: string;
  updated_at: string;
  last_created?: string;
  is_overdue: boolean;
  days_until_next: number;
  frequency_display: string;
  status_display: string;
}

export interface CreateRecurringTransaction {
  name: string;
  description?: string;
  amount: number;
  category: string;
  transaction_type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  max_occurrences?: number;
}

export const recurringTransactionsAPI = {
  getRecurringTransactions: async (): Promise<RecurringTransaction[]> => {
    const response = await api.get('/recurring-transactions/');
    return response.data.results || response.data;
  },

  createRecurringTransaction: async (data: CreateRecurringTransaction): Promise<RecurringTransaction> => {
    const response = await api.post('/recurring-transactions/', data);
    return response.data;
  },

  updateRecurringTransaction: async (id: number, data: Partial<CreateRecurringTransaction>): Promise<RecurringTransaction> => {
    const response = await api.put(`/recurring-transactions/${id}/`, data);
    return response.data;
  },

  deleteRecurringTransaction: async (id: number): Promise<void> => {
    await api.delete(`/recurring-transactions/${id}/`);
  },

  createTransactionFromRecurring: async (id: number): Promise<any> => {
    const response = await api.post(`/recurring-transactions/${id}/create_transaction/`);
    return response.data;
  },

  skipNextOccurrence: async (id: number): Promise<RecurringTransaction> => {
    const response = await api.post(`/recurring-transactions/${id}/skip_next/`);
    return response.data;
  },

  getUpcomingTransactions: async (): Promise<RecurringTransaction[]> => {
    const response = await api.get('/recurring-transactions/upcoming/');
    return response.data;
  },

  getOverdueTransactions: async (): Promise<RecurringTransaction[]> => {
    const response = await api.get('/recurring-transactions/overdue/');
    return response.data;
  },

  processOverdueTransactions: async (): Promise<any> => {
    const response = await api.post('/recurring-transactions/process_overdue/');
    return response.data;
  },
};
