import api from './index';

export interface IncomeData {
  total_income: number;
  total_allocated: number;
  available_income: number;
}

export const incomeAPI = {
  getIncome: (): Promise<IncomeData> => 
    api.get('/income/').then(response => response.data),
};
