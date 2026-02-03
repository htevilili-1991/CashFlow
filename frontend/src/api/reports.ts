import api from './index';

export interface MonthlyReport {
  period: {
    year: number;
    month: number;
    month_name: string;
  };
  summary: {
    income: number;
    expenses: number;
    net: number;
    transaction_count: number;
  };
  category_breakdown: Array<{
    category: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
  daily_breakdown: Array<{
    date: string;
    income: number;
    expenses: number;
    net: number;
  }>;
  envelope_performance: Array<{
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentage: number;
  }>;
}

export interface YearlyReport {
  period: {
    year: number;
  };
  summary: {
    total_income: number;
    total_expenses: number;
    total_net: number;
    transaction_count: number;
  };
  monthly_breakdown: Array<{
    month: number;
    month_name: string;
    income: number;
    expenses: number;
    net: number;
    transaction_count: number;
  }>;
  category_trends: Array<{
    category: string;
    [key: string]: number | string;
  }>;
  top_categories: Array<{
    category: string;
    total: number;
  }>;
}

export interface ComparisonReport {
  period_type: 'monthly' | 'yearly';
  current_period: string;
  previous_period: string;
  current_stats: {
    income: number;
    expenses: number;
    net: number;
    transaction_count: number;
  };
  previous_stats: {
    income: number;
    expenses: number;
    net: number;
    transaction_count: number;
  };
  changes: {
    income_change: number;
    expenses_change: number;
    net_change: number;
    transaction_count_change: number;
  };
  category_comparison: {
    [category: string]: {
      current: number;
      previous: number;
      change: number;
    };
  };
}

export const reportsAPI = {
  getMonthlyReport: async (year?: number, month?: number): Promise<MonthlyReport> => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    
    const response = await api.get(`/reports/monthly/?${params.toString()}`);
    return response.data;
  },

  getYearlyReport: async (year?: number): Promise<YearlyReport> => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    
    const response = await api.get(`/reports/yearly/?${params.toString()}`);
    return response.data;
  },

  getComparisonReport: async (type: 'monthly' | 'yearly' = 'monthly'): Promise<ComparisonReport> => {
    const response = await api.get(`/reports/comparison/?type=${type}`);
    return response.data;
  },

  exportData: async (format: 'csv' | 'json', startDate?: string, endDate?: string): Promise<void> => {
    const params = new URLSearchParams();
    params.append('format', format);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/export/?${params.toString()}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    const filename = `transactions_${new Date().toISOString().split('T')[0]}.${format}`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
