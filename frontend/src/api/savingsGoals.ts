import api from './index';

export interface SavingsGoal {
  id: number;
  user: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  progress_percentage: number;
  remaining_amount: number;
  category_name: string;
}

export interface CreateSavingsGoal {
  name: string;
  target_amount: number;
  target_date: string;
  category_name?: string;
}

export const savingsGoalsAPI = {
  getSavingsGoals: async (): Promise<SavingsGoal[]> => {
    const response = await api.get('/savings-goals/');
    return response.data;
  },

  createSavingsGoal: async (data: CreateSavingsGoal): Promise<SavingsGoal> => {
    const response = await api.post('/savings-goals/', data);
    return response.data;
  },

  updateSavingsGoal: async (id: number, data: Partial<CreateSavingsGoal>): Promise<SavingsGoal> => {
    const response = await api.put(`/savings-goals/${id}/`, data);
    return response.data;
  },

  deleteSavingsGoal: async (id: number): Promise<void> => {
    await api.delete(`/savings-goals/${id}/`);
  },

  contributeToGoal: async (id: number, amount: number): Promise<SavingsGoal> => {
    const response = await api.post(`/savings-goals/${id}/contribute/`, { amount });
    return response.data;
  },
};
