import { apiClient, setAuthToken } from './client';
import type { LoginRequest, LoginResponse, User } from '../types';
import type { ChangePasswordDto, UpdateProfileDto } from '../modules/profile/type';

const ACTION_MAP: Record<string, number> = {
  View: 1, Create: 2, Edit: 4, Delete: 8, Export: 16,
};

function mapToUser(raw: LoginResponse): User {
  return {
    id: raw.userId,
    name: raw.name,
    email: raw.email,
    role: {
      name: raw.role,
      modules: raw.modules.map((m) => ({
        name: m.name,
        icon: m.icon ?? '',
        route: m.route ?? '',
        order: m.order,
        isActive: true,
        actions: m.actions.reduce((acc, a) => acc | (ACTION_MAP[a] ?? 0), 0),
      })),
    },
  };
}

export const authApi = {
  login: async (data: LoginRequest) => {
    const raw = await apiClient.post<LoginResponse>('/api/auth/login', data).then((r) => r.data);
    setAuthToken(raw.token);
    return { token: raw.token, user: mapToUser(raw) };
  },

  refresh: async () => {
    const { data } = await apiClient.post<{ token: string; expiresAt: string }>('/api/auth/refresh');
    setAuthToken(data.token);
    return data;
  },

  logout: async () => {
    await apiClient.post('/api/auth/logout').catch(() => {});
  },

  getMe: () =>
    apiClient.get<User>('/api/auth/me').then((r) => r.data),

  updateProfile: (data: UpdateProfileDto) =>
    apiClient.patch('/api/auth/me', data).then((r) => r.data),

  changePassword: (data: ChangePasswordDto) =>
    apiClient.patch('/api/auth/change-password', data).then((r) => r.data),
};
