import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { envelopesAPI, type EnvelopeSummary } from '../api/envelopes';
import toast from 'react-hot-toast';
import type { Envelope, CreateEnvelopeData, UpdateEnvelopeData } from '../api/envelopes';

export const useEnvelopes = () => {
  const queryClient = useQueryClient();

  const {
    data: envelopes = [] as Envelope[],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['envelopes'],
    queryFn: async (): Promise<Envelope[]> => {
      const result = await envelopesAPI.getEnvelopes();
      // Handle paginated response
      if (result && typeof result === 'object' && 'results' in result) {
        return (result as any).results;
      }
      return result as Envelope[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: summary,
    isLoading: isSummaryLoading,
  } = useQuery({
    queryKey: ['envelopes', 'summary'],
    queryFn: envelopesAPI.getEnvelopeSummary,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createEnvelopeMutation = useMutation({
    mutationFn: envelopesAPI.createEnvelope,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['envelopes'] });
      queryClient.invalidateQueries({ queryKey: ['envelopes', 'summary'] });
      toast.success('Envelope created successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to create envelope.';
      toast.error(message);
    },
  });

  const updateEnvelopeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEnvelopeData }) =>
      envelopesAPI.updateEnvelope(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['envelopes'] });
      queryClient.invalidateQueries({ queryKey: ['envelopes', 'summary'] });
      toast.success('Envelope updated successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to update envelope.';
      toast.error(message);
    },
  });

  const deleteEnvelopeMutation = useMutation({
    mutationFn: envelopesAPI.deleteEnvelope,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['envelopes'] });
      queryClient.invalidateQueries({ queryKey: ['envelopes', 'summary'] });
      toast.success('Envelope deleted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Failed to delete envelope.';
      toast.error(message);
    },
  });

  const getEnvelopeByCategory = (categoryId: number) => {
    return envelopes.find((envelope: Envelope) => envelope.category === categoryId);
  };

  const getEnvelopeByCategoryName = (categoryName: string) => {
    return envelopes.find((envelope: Envelope) => envelope.category_name === categoryName);
  };

  return {
    envelopes,
    summary,
    isLoading,
    isSummaryLoading,
    error,
    createEnvelope: createEnvelopeMutation.mutate,
    updateEnvelope: updateEnvelopeMutation.mutate,
    deleteEnvelope: deleteEnvelopeMutation.mutate,
    isCreating: createEnvelopeMutation.isPending,
    isUpdating: updateEnvelopeMutation.isPending,
    isDeleting: deleteEnvelopeMutation.isPending,
    getEnvelopeByCategory,
    getEnvelopeByCategoryName,
  };
};
