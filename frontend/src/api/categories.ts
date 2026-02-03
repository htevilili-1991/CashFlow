import api from './index';
import type { Category } from '../types';

export const categoriesAPI = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories/');
    return response.data;
  },

  createCategory: async (data: { name: string; transaction_type: 'income' | 'expense' }): Promise<Category> => {
    const response = await api.post('/categories/', data);
    return response.data;
  },

  updateCategory: async (id: number, data: any): Promise<Category> => {
    const response = await api.put(`/categories/${id}/`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}/`);
  },
};
