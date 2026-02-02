import api from './index';
import type { Category } from '../types';

export const categoriesAPI = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories/');
    return response.data;
  },

  createCategory: async (name: string): Promise<Category> => {
    const response = await api.post('/categories/', { name });
    return response.data;
  },

  updateCategory: async (id: number, name: string): Promise<Category> => {
    const response = await api.put(`/categories/${id}/`, { name });
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}/`);
  },
};
