import { useState } from 'react';
import { Plus, Shield, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useModulePermissions } from '../../../hooks/useModulePermissions';
import { useRoles } from '../hooks/useRoles';
import DlgRole from '../components/DlgRole';
import type { RoleItem } from '../types';
import DlgDelete from '../components/DlgDelete';

export default function RoleList() {
  const { canCreate, canEdit, canDelete } = useModulePermissions('/roles');
  const { roles, isLoading } = useRoles();
  const navigate = useNavigate();

  const [showDlg, setShowDlg] = useState(false);
  const [showDlgDelete, setShowDlgDelete] = useState(false);
  const [selected, setSelected] = useState<RoleItem | undefined>(undefined);


  const openCreate = () => { setSelected(undefined); setShowDlg(true); };


  const openEdit = (e: React.MouseEvent, role: RoleItem) => {
    e.stopPropagation();
    setSelected(role);
    setShowDlg(true);
  };

  const openDelete  = (e: React.MouseEvent, role: RoleItem) => { 
    e.stopPropagation();
    setSelected(role);
    setShowDlgDelete(true)
  };

  return (
    <div className="w-full">

      <DlgRole open={showDlg} onClose={() => setShowDlg(false)} role={selected} />
      <DlgDelete open={showDlgDelete}  onClose={() => setShowDlgDelete(false)} role={selected} />
      <div className="flex items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-text mb-1">Gestión de Roles</h1>
          <p className="text-secondary text-base font-normal">
            Visualiza y administra los roles del sistema.
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover active:scale-95 cursor-pointer text-white text-sm font-semibold px-4 py-2 rounded-lg transition-[colors,transform] whitespace-nowrap"
            onClick={openCreate}
          >
            <Plus size={16} />
            Nuevo Rol
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-border" />
              <div className="h-4 bg-border rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {roles.map(role => (
            <div
              key={role.id}
              onClick={() => navigate(`/roles/${role.id}`)}
              className="group bg-surface border border-border rounded-xl p-5 flex flex-col gap-3 hover:border-primary/40 hover:shadow-sm transition-[border-color,box-shadow] cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
                  <Shield size={18} className="text-primary" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {canEdit && (
                    <button
                      onClick={(e) => openEdit(e, role)}
                      className="p-1.5 rounded-md text-secondary hover:text-text hover:bg-border transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={(e) => openDelete(e, role)}
                      className="p-1.5 rounded-md text-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <p
                  className="font-semibold text-text text-sm leading-tight"
                >
                  {role.name}
                </p>
                {role.description && (
                  <p className="text-xs text-secondary mt-0.5 line-clamp-2">{role.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 mt-auto">
                <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', role.isActive ? 'bg-green-100 text-green-700' : 'bg-border text-secondary')}>
                  {role.isActive ? 'Activo' : 'Inactivo'}
                </span>
                <span className="text-xs text-secondary">
                  {role.usersCount} usuario{role.usersCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
