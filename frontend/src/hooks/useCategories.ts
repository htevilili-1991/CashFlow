import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesAPI } from '../api/categories';
import toast from 'react-hot-toast';

export const useCategories = () => {
  const queryClient = useQueryClient();

  const {
    data: categoriesData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('Fetching categories...');
      try {
        const result = await categoriesAPI.getCategories();
        console.log('Categories API response:', result);
        console.log('Categories API response type:', typeof result);
        console.log('Categories API response isArray:', Array.isArray(result));
        
        // Handle paginated response
        if (result && typeof result === 'object' && 'results' in result) {
          console.log('Detected paginated response, using results array');
          return result.results;
        }
        
        return result;
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Log error if it exists
  if (error) {
    console.error('Categories query error:', error);
  }

  const createCategoryMutation = useMutation({
    mutationFn: categoriesAPI.createCategory,
    onSuccess: (data) => {
      console.log('Category created successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully!');
    },
    onError: (error) => {
      console.error('Failed to create category:', error);
      toast.error('Failed to create category.');
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      categoriesAPI.updateCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update category.');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: categoriesAPI.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete category.');
    },
  });

  return {
    categories: categoriesData,
    isLoading,
    error,
    createCategory: createCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate,
    isCreating: createCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
  };
};
