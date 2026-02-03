import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsAPI, type MonthlyReport, type YearlyReport, type ComparisonReport } from '../api/reports';
import toast from 'react-hot-toast';

export const useReports = () => {
  const queryClient = useQueryClient();

  const useMonthlyReport = (year?: number, month?: number) => {
    return useQuery({
      queryKey: ['monthlyReport', year, month],
      queryFn: () => reportsAPI.getMonthlyReport(year, month),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };

  const useYearlyReport = (year?: number) => {
    return useQuery({
      queryKey: ['yearlyReport', year],
      queryFn: () => reportsAPI.getYearlyReport(year),
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  const useComparisonReport = (type: 'monthly' | 'yearly' = 'monthly') => {
    return useQuery({
      queryKey: ['comparisonReport', type],
      queryFn: () => reportsAPI.getComparisonReport(type),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };

  const exportMutation = useMutation({
    mutationFn: ({ format, startDate, endDate }: {
      format: 'csv' | 'json';
      startDate?: string;
      endDate?: string;
    }) => reportsAPI.exportData(format, startDate, endDate),
    onSuccess: () => {
      toast.success('Data exported successfully!');
    },
    onError: (error) => {
      console.error('Export failed:', error);
      toast.error('Failed to export data.');
    },
  });

  const exportData = (format: 'csv' | 'json', startDate?: string, endDate?: string) => {
    exportMutation.mutate({ format, startDate, endDate });
  };

  const invalidateReports = () => {
    queryClient.invalidateQueries({ queryKey: ['monthlyReport'] });
    queryClient.invalidateQueries({ queryKey: ['yearlyReport'] });
    queryClient.invalidateQueries({ queryKey: ['comparisonReport'] });
  };

  return {
    useMonthlyReport,
    useYearlyReport,
    useComparisonReport,
    exportData,
    invalidateReports,
    isExporting: exportMutation.isPending,
  };
};
