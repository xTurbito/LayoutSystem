import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Shield } from 'lucide-react';
import ModalShell from '../../../components/ui/ModalShell';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useRoleMutation } from '../hooks/useRoleMutation';
import type { CreateRoleDTO, RoleItem } from '../types';
import { zodResolver } from '@hookform/resolvers/zod';
import type { RoleFormValues } from '../schemas';
import { roleSchema } from '../schemas';

interface DlgRoleProps {
  open: boolean;
  onClose: () => void;
  role?: RoleItem;
}

export default function DlgRole({ open, onClose, role }: DlgRoleProps) {
  const isEdit = !!role;
  const { create, update } = useRoleMutation(onClose);
  const mutation = isEdit ? update : create;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoleFormValues>({
    defaultValues: { name: '', description: '' }, resolver: zodResolver(roleSchema)
  });

   useEffect(() => {
    if (open) {
      reset({ name: role?.name ?? '', description: role?.description ?? '' });
    } else {
      reset({ name: '', description: '' });
    }
  }, [open, role?.id, reset]);

  const onSubmit = (data: CreateRoleDTO) => {
    if (isEdit) {
      update.mutate({ id: role.id, data });
    } else {
      create.mutate(data);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Rol' : 'Nuevo Rol'}
      icon={<Shield className="w-8 h-8 text-indigo-600 bg-indigo-100 rounded-lg p-1.5" />}
      description={isEdit ? 'Modifica el nombre o descripción del rol.' : 'Ingresa el nombre del nuevo rol.'}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-3">
          <Input
            label="Nombre del Rol"
            placeholder="Ej: Supervisor"
            errorMessage={errors.name?.message}
            maxLength={50}
            {...register('name')}
          />
          <Input
            label="Descripción"
            placeholder="Ej: Escribe algo..."
            errorMessage={errors.description?.message}
            maxLength={200}
            {...register('description')}
          />
          <Button
            type="submit"
            label={isEdit ? 'Guardar cambios' : 'Crear Rol'}
            fullWidth
            isLoading={mutation.isPending}
            className="mt-1"
          />
        </div>
      </form>
    </ModalShell>
  );
}
