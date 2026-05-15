// Espejo del enum ModuleAction del backend (flags)
export const ModuleAction = {
  None: 0,
  View: 1,
  Create: 2,
  Edit: 4,
  Delete: 8,
  Export: 16,
} as const;

export type ModuleActionValue = typeof ModuleAction[keyof typeof ModuleAction];

export function hasAction(actions: number, action: ModuleActionValue): boolean {
  return (actions & action) === action;
}

export interface AppModule {
  name: string;
  icon: string;
  route: string;
  order: number;
  isActive: boolean;
  actions: number; // ModuleAction flags
}

export interface Role {
  name: string;
  modules: AppModule[];
}

export interface RoleSelectOption {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Shape real que devuelve el backend
export interface LoginResponse {
  token: string;
  expiresAt: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  modules: Array<{
    name: string;
    icon: string | null;
    route: string | null;
    order: number;
    actions: string[]; // ["View", "Create", ...]
  }>;
}

