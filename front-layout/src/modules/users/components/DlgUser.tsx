import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { User as UserIcon } from 'lucide-react';
import ModalShell from '../../../components/ui/ModalShell';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { rolesSelectOption } from '../../roles/api';
import { usersApi } from '../api';
import { useUserMutation } from '../hooks/useUserMutation';
import type { UserItem } from '../types';
import { zodResolver } from '@hookform/resolvers/zod';
import type { UserFormValues } from '../schemas';
import { createUserSchema, updateUserSchema } from '../schemas';

interface DlgUserProps {
  open: boolean;
  onClose: () => void;
  user?: UserItem;
}

const defaultValues = {
  name: '',
  email: '',
  roleId: '',
  password: '',
  confirmPassword: '',
  isActive: false,
};

export default function DlgUser({ open, onClose, user }: DlgUserProps) {
  const isEditing = !!user;

  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles', 'select-options'],
    queryFn: rolesSelectOption.getAll,
  });

  const userId = user?.id;

  const { data: userData, isLoading: loadingUser } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersApi.getById(userId!),
    enabled: open && isEditing && !!userId,
  });

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<UserFormValues>({
      resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema) as any, defaultValues,
    })

  // Limpiar el form inmediatamente cuando cambia el usuario objetivo
  useEffect(() => {
    reset(defaultValues);
  }, [userId, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) { reset(defaultValues); return; }
    if (isEditing && userData) {
      reset({ name: userData.name, email: userData.email, roleId: userData.roleId, password: '', confirmPassword: '', isActive: userData.isActive });
    }
  }, [open, userData, isEditing, reset]);

  const mutation = useUserMutation(user, onClose);

  const onSubmit = (values: UserFormValues) => mutation.mutate(values);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}
      icon={<UserIcon className="w-8 h-8 text-indigo-600 bg-indigo-100 rounded-lg p-1.5" />}
      description={
        isEditing
          ? 'Modifica los datos del usuario. Deja la contraseña en blanco para mantener la actual.'
          : 'Complete los campos a continuación para registrar un nuevo usuario.'
      }
    >
      {loadingUser ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col gap-3">
            <Input
              label="Nombre Completo"
              placeholder="Ej: Juan Pérez"
              errorMessage={errors.name?.message}
              maxLength={100}
              {...register('name')}
            />
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="Ej: juan.perez@example.com"
              errorMessage={errors.email?.message}
              maxLength={150}
              {...register('email')}
            />
            <Select
              label="Rol"
              error={errors.roleId?.message}
              disabled={rolesLoading}
              {...register('roleId')}
            >
              <option value="" disabled hidden>Selecciona un rol</option>
              {roles?.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </Select>
            <Input
              label={isEditing ? 'Nueva contraseña (opcional)' : 'Contraseña'}
              type="password"
              placeholder={isEditing ? 'Dejar en blanco para no cambiar' : 'Ingrese una contraseña segura'}
              errorMessage={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirmar Contraseña"
              type="password"
              placeholder="Repita la contraseña"
              errorMessage={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {isEditing && (
              <label className='flex gap-1.5 items-center font-bold cursor-pointer'>
                <input type="checkbox" {...register('isActive')} />
                Activar Usuario
              </label>
            )}
            <Button
              type="submit"
              label={isEditing ? 'Guardar cambios' : 'Crear Usuario'}
              fullWidth
              isLoading={mutation.isPending}
              className="mt-1"
            />
          </div>
        </form>
      )}
    </ModalShell>
  );
}
