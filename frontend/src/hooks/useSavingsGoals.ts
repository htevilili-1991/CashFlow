import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { savingsGoalsAPI, type SavingsGoal, type CreateSavingsGoal } from '../api/savingsGoals';
import toast from 'react-hot-toast';

export const useSavingsGoals = () => {
  const queryClient = useQueryClient();

  const {
    data: savingsGoalsData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['savingsGoals'],
    queryFn: async () => {
      console.log('Fetching savings goals...');
      try {
        const result = await savingsGoalsAPI.getSavingsGoals();
        console.log('Savings goals API response:', result);
        console.log('Savings goals API response type:', typeof result);
        console.log('Savings goals API response isArray:', Array.isArray(result));
        
        // Handle paginated response
        if (result && typeof result === 'object' && 'results' in result) {
          console.log('Detected paginated response, using results array');
          return result.results;
        }
        
        return result;
      } catch (error) {
        console.error('Error fetching savings goals:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Log error if it exists
  if (error) {
    console.error('Savings goals query error:', error);
  }

  const createSavingsGoalMutation = useMutation({
    mutationFn: savingsGoalsAPI.createSavingsGoal,
    onSuccess: (data) => {
      console.log('Savings goal created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
      toast.success('Savings goal created successfully!');
    },
    onError: (error) => {
      console.error('Failed to create savings goal:', error);
      toast.error('Failed to create savings goal.');
    },
  });

  const updateSavingsGoalMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateSavingsGoal> }) =>
      savingsGoalsAPI.updateSavingsGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
      toast.success('Savings goal updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update savings goal.');
    },
  });

  const deleteSavingsGoalMutation = useMutation({
    mutationFn: savingsGoalsAPI.deleteSavingsGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
      toast.success('Savings goal deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete savings goal.');
    },
  });

  const contributeToGoalMutation = useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      savingsGoalsAPI.contributeToGoal(id, amount),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['savingsGoals'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['income'] });
      toast.success(`Successfully contributed VT ${variables.amount} to ${data.name}!`);
    },
    onError: (error) => {
      console.error('Failed to contribute to goal:', error);
      toast.error('Failed to contribute to savings goal.');
    },
  });

  return {
    savingsGoals: savingsGoalsData,
    isLoading,
    error,
    createSavingsGoal: createSavingsGoalMutation.mutate,
    updateSavingsGoal: updateSavingsGoalMutation.mutate,
    deleteSavingsGoal: deleteSavingsGoalMutation.mutate,
    contributeToGoal: contributeToGoalMutation.mutate,
    isCreating: createSavingsGoalMutation.isPending,
    isUpdating: updateSavingsGoalMutation.isPending,
    isDeleting: deleteSavingsGoalMutation.isPending,
    isContributing: contributeToGoalMutation.isPending,
  };
};
