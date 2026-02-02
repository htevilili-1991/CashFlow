import api from './index';
import type { Transaction } from '../types';

export const transactionsAPI = {
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get('/transactions/');
    return response.data.results || response.data;
  },

  createTransaction: async (transaction: Partial<Transaction>): Promise<Transaction> => {
    const response = await api.post('/transactions/', transaction);
    return response.data;
  },

  updateTransaction: async (id: number, transaction: Partial<Transaction>): Promise<Transaction> => {
    const response = await api.put(`/transactions/${id}/`, transaction);
    return response.data;
  },

  deleteTransaction: async (id: number): Promise<void> => {
    await api.delete(`/transactions/${id}/`);
  },

  getBalance: async () => {
    const response = await api.get('/balance/');
    return response.data;
  },
};
