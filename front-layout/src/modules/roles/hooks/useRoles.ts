import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '../api';

export function useRoles() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesApi.getAll,
    staleTime: 0
  });

  return { roles: data, isLoading };
}
