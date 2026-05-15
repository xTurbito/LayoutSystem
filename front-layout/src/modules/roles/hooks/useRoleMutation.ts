import { useCrudMutation } from '../../../hooks/useCrudMutation';
import { rolesApi } from '../api';
import type { UpdateRoleDTO } from '../types';

export function useRoleMutation(onSuccess: () => void) {
  const create = useCrudMutation({
    mutationFn: rolesApi.create,
    successMessage: 'Rol creado correctamente',
    errorMessage: 'Error al crear el rol',
    invalidateKeys: ['roles'],
    onSuccess,
  });

  const update = useCrudMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDTO }) => rolesApi.update(id, data),
    successMessage: 'Rol actualizado correctamente',
    errorMessage: 'Error al actualizar el rol',
    invalidateKeys: ['roles'],
    onSuccess,
  });

  const remove = useCrudMutation({
    mutationFn: (id: string) => rolesApi.remove(id),
    successMessage: 'Rol eliminado correctamente',
    errorMessage: 'Error al eliminar el rol',
    invalidateKeys: ['roles'],
    onSuccess,
  });

  return { create, update, remove };
}
