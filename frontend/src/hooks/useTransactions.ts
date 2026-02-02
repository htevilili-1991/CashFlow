import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsAPI } from '../api/transactions';
import toast from 'react-hot-toast';
import type { Transaction } from '../types';

export const useTransactions = () => {
  const queryClient = useQueryClient();

  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionsAPI.getTransactions,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const {
    data: balance,
    isLoading: balanceLoading,
  } = useQuery({
    queryKey: ['balance'],
    queryFn: transactionsAPI.getBalance,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const createTransactionMutation = useMutation({
    mutationFn: transactionsAPI.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success('Transaction created successfully!');
    },
    onError: () => {
      toast.error('Failed to create transaction.');
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, transaction }: { id: number; transaction: Partial<Transaction> }) =>
      transactionsAPI.updateTransaction(id, transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success('Transaction updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update transaction.');
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: transactionsAPI.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success('Transaction deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete transaction.');
    },
  });

  return {
    transactions,
    balance,
    isLoading,
    balanceLoading,
    error,
    createTransaction: createTransactionMutation.mutate,
    updateTransaction: updateTransactionMutation.mutate,
    deleteTransaction: deleteTransactionMutation.mutate,
    isCreating: createTransactionMutation.isPending,
    isUpdating: updateTransactionMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,
  };
};
