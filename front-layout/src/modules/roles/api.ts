import { apiClient } from '../../api/client';
import type { RoleSelectOption } from '../../types';
import type { RoleItem, CreateRoleDTO, UpdateRoleDTO, RoleActivitiesResponse } from './types';

export const rolesSelectOption = {
  getAll: () =>
    apiClient.get<RoleSelectOption[]>('/api/roles/list').then((r) => r.data),
};

export const rolesApi = {
  getAll: () =>
    apiClient.get<RoleItem[]>('/api/roles').then((r) => r.data),
  create: (data: CreateRoleDTO) =>
    apiClient.post<RoleItem>('/api/roles', data).then((r) => r.data),
  update: (id: string, data: UpdateRoleDTO) =>
    apiClient.put(`/api/roles/${id}`, data).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete(`/api/roles/${id}`).then((r) => r.data),
  getActivities: (id: string) =>
    apiClient.get<RoleActivitiesResponse>(`/api/roles/${id}/activities`).then((r) => r.data),
  togglePermission: (id: string, moduleId: string, actions: number) =>
    apiClient.patch(`/api/roles/${id}/permissions`, { moduleId, actions }).then((r) => r.data),
};
