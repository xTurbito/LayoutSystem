export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
  isActive: boolean;
}

export interface CreateUserDTO {
 name: string;
  email: string;
  roleId: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateUserDTO {
  name: string;
  email: string;
  roleId?: string;
  password?: string;
  isActive: boolean;
}