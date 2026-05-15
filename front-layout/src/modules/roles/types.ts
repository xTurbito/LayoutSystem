export interface RoleItem {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  usersCount: number;
}

export interface UpdateRoleDTO {
  name: string;
  description?: string;
}

export interface RoleDetail {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  userCount?: number;
}

/** Módulo con su bitflag de acciones tal como lo devuelve el backend */
export interface RoleModulePermission {
  id: string;
  key: string;
  name: string;
  description?: string;
  icon: string;
  actions: number;
}

export interface RoleActivitiesResponse {
  role: RoleDetail;
  modules: RoleModulePermission[];
}

export interface CreateRoleDTO {
  name: string;
  description: string;
}
