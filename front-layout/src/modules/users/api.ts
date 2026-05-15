import { apiClient } from '../../api/client';
import type { PagedResponse } from '../../types';
import type { UserItem, CreateUserDTO, UpdateUserDTO } from './types';

export const usersApi = {
  getAll: (params: { page: number; pageSize: number; search?: string; isActive?: boolean }) =>
    apiClient
      .get<PagedResponse<UserItem>>('/api/users', { params })
      .then((r) => r.data),
  getById: (id: string) =>
    apiClient.get<UserItem>(`/api/users/${id}`).then((r) => r.data),
  create: (data: CreateUserDTO) =>
    apiClient.post<UserItem>('/api/users', data).then((r) => r.data),
  update: (id: string, data: UpdateUserDTO) =>
    apiClient.put<UserItem>(`/api/users/${id}`, data).then((r) => r.data),
};
