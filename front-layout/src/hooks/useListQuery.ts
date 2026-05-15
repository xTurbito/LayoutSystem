import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
}

/**
 * Hook genérico para listas paginadas con búsqueda debounced.
 *
 * @param baseQueryKey - Clave base + filtros extra (ej: ['users', statusFilter])
 * @param queryFn - Función que recibe { page, pageSize, search? } y retorna PagedResponse
 *
 * El caller maneja sus propios filtros extra y los pasa en baseQueryKey para
 * que React Query los detecte y refetch cuando cambien.
 */
export function useListQuery<T>(
  baseQueryKey: unknown[],
  queryFn: (params: { page: number; pageSize: number; search?: string }) => Promise<PagedResponse<T>>
) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(0); }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [...baseQueryKey, page, pageSize, search],
    queryFn: () => queryFn({ page: page + 1, pageSize, search: search || undefined }),
    placeholderData: keepPreviousData,
  });

  return {
    items:      data?.items      ?? [],
    totalCount: data?.totalCount ?? 0,
    pageCount:  data?.totalPages ?? 0,
    isLoading,
    isFetching,
    page,
    pageSize,
    onPageChange:     setPage,
    onPageSizeChange: (v: number) => { setPageSize(v); setPage(0); },
    onSearchChange:   (v: string) => setSearchInput(v),
  };
}
