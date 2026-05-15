import { useState } from 'react';
import { useListQuery } from '../../../hooks/useListQuery';
import { usersApi } from '../api';

export function useUsers() {
  const [statusFilter, setStatusFilter] = useState<'' | 'true' | 'false'>('');

  const list = useListQuery(
    ['users', statusFilter],
    ({ page, pageSize, search }) =>
      usersApi.getAll({
        page, pageSize, search,
        isActive: statusFilter !== '' ? statusFilter === 'true' : undefined,
      })
  );

  return {
    ...list,
    statusFilter,
    onStatusChange: (v: '' | 'true' | 'false') => { setStatusFilter(v); list.onPageChange(0); },
  };
}
