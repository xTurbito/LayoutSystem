import { useState } from 'react';
import { Plus, Shield, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModulePermissions } from '../../../hooks/useModulePermissions';
import { useRoles } from '../hooks/useRoles';
import DlgRole from '../components/DlgRole';
import type { RoleItem } from '../types';
import DlgDelete from '../components/DlgDelete';
import Button from '../../../components/ui/Button';
import StatusBadge from '../../../components/ui/StatusBadge';

interface RoleCardProps {
  role: RoleItem;
  canEdit: boolean;
  canDelete: boolean;
  onOpen: (role: RoleItem) => void;
  onEdit: (role: RoleItem) => void;
  onDelete: (role: RoleItem) => void;
}

function RoleCard({ role, canEdit, canDelete, onOpen, onEdit, onDelete }: RoleCardProps) {
  return (
    <article
      className="group rounded-xl border border-border bg-surface p-4 shadow-[0_18px_45px_rgba(63,73,246,0.08)] transition-[border-color,box-shadow,transform] hover:border-primary/35 hover:shadow-[0_20px_52px_rgba(63,73,246,0.12)] sm:p-5"
    >
      <button
        type="button"
        onClick={() => onOpen(role)}
        className="w-full text-left cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
            <Shield size={18} className="text-primary" />
          </div>
          <StatusBadge active={role.isActive} />
        </div>

        <div className="mt-4 min-h-[56px]">
          <p className="font-extrabold text-text text-base leading-tight">{role.name}</p>
          <p className="text-sm text-secondary mt-1 line-clamp-2">
            {role.description || 'Sin descripción'}
          </p>
        </div>

        <div className="mt-4 rounded-md bg-bg/70 px-3 py-2">
          <span className="text-xs font-semibold text-secondary">
            {role.usersCount} usuario{role.usersCount !== 1 ? 's' : ''}
          </span>
        </div>
      </button>

      {(canEdit || canDelete) && (
        <div className="mt-3 flex items-center justify-end gap-1 border-t border-border pt-3 sm:opacity-80 sm:transition-opacity sm:group-hover:opacity-100">
          {canEdit && (
            <Button
              type="button"
              label=""
              icon={Pencil}
              variant="ghost"
              aria-label="Editar rol"
              className="p-2 rounded"
              onClick={() => onEdit(role)}
            />
          )}
          {canDelete && (
            <Button
              type="button"
              label=""
              icon={Trash2}
              variant="ghost"
              aria-label="Eliminar rol"
              className="p-2 rounded text-red-500 hover:bg-red-500/10"
              onClick={() => onDelete(role)}
            />
          )}
        </div>
      )}
    </article>
  );
}

export default function RoleList() {
  const { canCreate, canEdit, canDelete } = useModulePermissions('/roles');
  const { roles, isLoading } = useRoles();
  const navigate = useNavigate();

  const [showDlg, setShowDlg] = useState(false);
  const [showDlgDelete, setShowDlgDelete] = useState(false);
  const [selected, setSelected] = useState<RoleItem | undefined>(undefined);

  const openCreate = () => { setSelected(undefined); setShowDlg(true); };

  const openEdit = (role: RoleItem) => {
    setSelected(role);
    setShowDlg(true);
  };

  const openDelete = (role: RoleItem) => {
    setSelected(role);
    setShowDlgDelete(true);
  };

  return (
    <div className="w-full">

      <DlgRole open={showDlg} onClose={() => setShowDlg(false)} role={selected} />
      <DlgDelete open={showDlgDelete} onClose={() => setShowDlgDelete(false)} role={selected} />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-text mb-1">Gestión de Roles</h1>
          <p className="text-secondary text-base font-normal">
            Visualiza y administra los roles del sistema.
          </p>
        </div>
        {canCreate && (
          <Button
            type="button"
            label="Nuevo Rol"
            icon={Plus}
            variant="primary"
            onClick={openCreate}
          />
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-border" />
              <div className="h-4 bg-border rounded w-3/4" />
              <div className="h-3 bg-border rounded w-full" />
              <div className="h-10 bg-border rounded-md mt-3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {roles.map(role => (
            <RoleCard
              key={role.id}
              role={role}
              canEdit={canEdit}
              canDelete={canDelete}
              onOpen={(item) => navigate(`/roles/${item.id}`)}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </div>
      )}

    </div>
  );
}
