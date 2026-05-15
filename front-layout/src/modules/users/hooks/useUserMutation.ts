import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { usersApi } from '../api';
import { getApiError } from '../../../api/errors';
import type { UserItem, CreateUserDTO, UpdateUserDTO } from '../types';

interface MutationPayload {
  name: string;
  email: string;
  roleId: string;
  password: string;
  isActive?: boolean;
}

// Este hook combina crear/editar en uno porque el formulario es el mismo.
// Para patrones CRUD simples (sin dualidad) usar useCrudMutation directamente.
export function useUserMutation(user: UserItem | undefined, onSuccess: () => void) {
  const queryClient = useQueryClient();
  const isEditing = !!user;

  return useMutation({
    mutationFn: (data: MutationPayload) =>
      isEditing
        ? usersApi.update(user.id, { name: data.name, email: data.email, roleId: data.roleId, password: data.password || undefined, isActive: data.isActive } as UpdateUserDTO)
        : usersApi.create(data as CreateUserDTO),
    onSuccess: () => {
      toast.success(isEditing ? 'Usuario actualizado' : 'Usuario creado');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      if (isEditing) queryClient.invalidateQueries({ queryKey: ['user', user.id] });
      onSuccess();
    },
    onError: (error) =>
      toast.error(getApiError(error, isEditing ? 'Error al actualizar el usuario' : 'Error al crear el usuario')),
  });
}
