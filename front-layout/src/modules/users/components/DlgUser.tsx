import { useEffect } from 'react';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import ModalShell from '../../../components/ui/ModalShell';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import SelectField from '../../../components/ui/SelectField';
import Switch from '../../../components/ui/Switch';
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

  const { register, handleSubmit, reset, control, formState: { errors } } =
    useForm<UserFormValues>({
      resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema) as Resolver<UserFormValues>,
      defaultValues,
    })

  // Limpiar el form inmediatamente cuando cambia el usuario objetivo
  useEffect(() => {
    reset(defaultValues);
  }, [userId, reset]);

  useEffect(() => {
    if (!open) return;
    if (isEditing && userData) {
      reset({ name: userData.name, email: userData.email, roleId: userData.roleId, password: '', confirmPassword: '', isActive: userData.isActive });
    } else if (!isEditing) {
      reset(defaultValues);
    }
  }, [open, userData, isEditing, reset]);

  const mutation = useUserMutation(user, onClose);

  const onSubmit = (values: UserFormValues) => mutation.mutate(values);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar' : 'Nuevo'}
      hideDivider
    >
      {loadingUser ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col gap-3">
            <Input
              label="Nombre Completo"
              inputKind="letters"
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
            <Controller
              name="roleId"
              control={control}
              render={({ field }) => (
                <SelectField
                  {...field}
                  label="Rol"
                  options={(roles ?? []).map((role) => ({ value: role.id, label: role.name }))}
                  placeholder={rolesLoading ? 'Cargando roles…' : 'Selecciona un rol'}
                  disabled={rolesLoading}
                  loading={rolesLoading}
                  required
                  error={errors.roleId?.message}
                />
              )}
            />
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
              <Switch
                label="Usuario activo"
                className="justify-between rounded-md border border-border bg-bg/50 px-3 py-2"
                {...register('isActive')}
              />
            )}

            <div className="mt-1 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                aria-label="Cancelar"
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary-container text-primary material-state hover:bg-primary/20 active:bg-primary/25 material-focus"
              >
                <X size={18} />
              </button>
              <Button
                type="submit"
                label={isEditing ? 'Guardar cambios' : 'Crear Usuario'}
                isLoading={mutation.isPending}
              />
            </div>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
