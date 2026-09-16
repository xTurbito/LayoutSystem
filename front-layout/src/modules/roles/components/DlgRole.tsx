import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
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
    if (!open) return;
    reset({ name: role?.name ?? '', description: role?.description ?? '' });
  }, [open, role?.description, role?.id, role?.name, reset]);

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
      title={isEdit ? 'Editar' : 'Nuevo'}
      hideDivider
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col gap-3">
          <Input
            label="Nombre del Rol"
            inputKind="letters"
            placeholder="Ej: Supervisor"
            errorMessage={errors.name?.message}
            maxLength={50}
            {...register('name')}
          />
          <Input
            label="Descripción"
            placeholder="Ej: Escribe algo…"
            errorMessage={errors.description?.message}
            maxLength={200}
            {...register('description')}
          />
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
              label={isEdit ? 'Guardar cambios' : 'Crear Rol'}
              isLoading={mutation.isPending}
            />
          </div>
        </div>
      </form>
    </ModalShell>
  );
}
