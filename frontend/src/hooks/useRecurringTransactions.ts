import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recurringTransactionsAPI, type RecurringTransaction, type CreateRecurringTransaction } from '../api/recurringTransactions';
import toast from 'react-hot-toast';

export const useRecurringTransactions = () => {
  const queryClient = useQueryClient();

  const {
    data: recurringTransactionsData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['recurringTransactions'],
    queryFn: async () => {
      console.log('Fetching recurring transactions...');
      try {
        const result = await recurringTransactionsAPI.getRecurringTransactions();
        console.log('Recurring transactions API response:', result);
        
        // Handle paginated response
        if (result && typeof result === 'object' && 'results' in result) {
          console.log('Detected paginated response, using results array');
          return result.results;
        }
        
        return result;
      } catch (error) {
        console.error('Error fetching recurring transactions:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: upcomingTransactions = [],
    isLoading: upcomingLoading,
  } = useQuery({
    queryKey: ['upcomingRecurringTransactions'],
    queryFn: recurringTransactionsAPI.getUpcomingTransactions,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const {
    data: overdueTransactions = [],
    isLoading: overdueLoading,
  } = useQuery({
    queryKey: ['overdueRecurringTransactions'],
    queryFn: recurringTransactionsAPI.getOverdueTransactions,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Log error if it exists
  if (error) {
    console.error('Recurring transactions query error:', error);
  }

  const createRecurringTransactionMutation = useMutation({
    mutationFn: recurringTransactionsAPI.createRecurringTransaction,
    onSuccess: (data) => {
      console.log('Recurring transaction created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['recurringTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingRecurringTransactions'] });
      toast.success('Recurring transaction created successfully!');
    },
    onError: (error) => {
      console.error('Failed to create recurring transaction:', error);
      toast.error('Failed to create recurring transaction.');
    },
  });

  const updateRecurringTransactionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateRecurringTransaction> }) =>
      recurringTransactionsAPI.updateRecurringTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingRecurringTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['overdueRecurringTransactions'] });
      toast.success('Recurring transaction updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update recurring transaction.');
    },
  });

  const deleteRecurringTransactionMutation = useMutation({
    mutationFn: recurringTransactionsAPI.deleteRecurringTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingRecurringTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['overdueRecurringTransactions'] });
      toast.success('Recurring transaction deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete recurring transaction.');
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: recurringTransactionsAPI.createTransactionFromRecurring,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recurringTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingRecurringTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['overdueRecurringTransactions'] });
      toast.success('Transaction created successfully!');
    },
    onError: (error) => {
      console.error('Failed to create transaction from recurring:', error);
      toast.error('Failed to create transaction.');
    },
  });

  const skipNextMutation = useMutation({
    mutationFn: recurringTransactionsAPI.skipNextOccurrence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingRecurringTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['overdueRecurringTransactions'] });
      toast.success('Next occurrence skipped successfully!');
    },
    onError: () => {
      toast.error('Failed to skip next occurrence.');
    },
  });

  const processOverdueMutation = useMutation({
    mutationFn: recurringTransactionsAPI.processOverdueTransactions,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['recurringTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingRecurringTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['overdueRecurringTransactions'] });
      toast.success(`Processed ${data.transactions.length} overdue transactions!`);
    },
    onError: (error) => {
      console.error('Failed to process overdue transactions:', error);
      toast.error('Failed to process overdue transactions.');
    },
  });

  return {
    recurringTransactions: recurringTransactionsData,
    upcomingTransactions,
    overdueTransactions,
    isLoading,
    upcomingLoading,
    overdueLoading,
    error,
    createRecurringTransaction: createRecurringTransactionMutation.mutate,
    updateRecurringTransaction: updateRecurringTransactionMutation.mutate,
    deleteRecurringTransaction: deleteRecurringTransactionMutation.mutate,
    createTransaction: createTransactionMutation.mutate,
    skipNext: skipNextMutation.mutate,
    processOverdue: processOverdueMutation.mutate,
    isCreating: createRecurringTransactionMutation.isPending,
    isUpdating: updateRecurringTransactionMutation.isPending,
    isDeleting: deleteRecurringTransactionMutation.isPending,
    isCreatingTransaction: createTransactionMutation.isPending,
    isProcessingOverdue: processOverdueMutation.isPending,
  };
};
