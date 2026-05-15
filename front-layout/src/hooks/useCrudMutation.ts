import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiError } from '../api/errors';

interface CrudMutationOptions<TData> {
  mutationFn: (data: TData) => Promise<unknown>;
  successMessage: string;
  errorMessage: string;
  invalidateKeys?: string[];
  onSuccess?: () => void;
}

/**
 * Hook genérico para mutaciones CRUD.
 * Maneja toast de éxito/error e invalidación del caché automáticamente.
 */
export function useCrudMutation<TData = unknown>({
  mutationFn,
  successMessage,
  errorMessage,
  invalidateKeys = [],
  onSuccess,
}: CrudMutationOptions<TData>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      toast.success(successMessage);
      invalidateKeys.forEach(key =>
        queryClient.invalidateQueries({ queryKey: [key], exact: false })
      );
      onSuccess?.();
    },
    onError: (error) => toast.error(getApiError(error, errorMessage)),
  });
}
