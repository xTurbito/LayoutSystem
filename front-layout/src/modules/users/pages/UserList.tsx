import { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus } from 'lucide-react';
import clsx from 'clsx';
import GenericTable from '../../../components/ui/Table';
import GenericSelect from '../../../components/ui/Select';
import { useModulePermissions } from '../../../hooks/useModulePermissions';
import { useUsers } from '../hooks/useUsers';
import type { UserItem } from '../types';
import DlgUser from '../components/DlgUser';
import Button from '../../../components/ui/Button';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const roleBadge: Record<string, string> = {
  ADMIN: 'bg-indigo-100 text-indigo-700',
  USUARIO: 'bg-border text-secondary',
};

function getColumns(canEdit: boolean, onEdit: (user: UserItem) => void): ColumnDef<UserItem>[] {
  const baseColumns: ColumnDef<UserItem>[] = [
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: ({ getValue }) => (
        <span className="font-semibold text-text">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ getValue }) => (
        <span className="text-secondary">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ getValue }) => {
        const value = getValue<string>();
        return (
          <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', roleBadge[value] ?? roleBadge['USUARIO'])}>
            {value}
          </span>
        );
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Estado',
      cell: ({ getValue }) => {
        const value = getValue<boolean>();
        return (
          <span className={clsx('inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold', value ? 'bg-green-500 text-white' : 'bg-border text-secondary')}>
            {value ? 'Activo' : 'Inactivo'}
          </span>
        );
      },
    },
  ];

  if (!canEdit) return baseColumns;

  return [
    ...baseColumns,
    {
      id: 'actions',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {canEdit && (
            <Button
              type="button"
              label=""
              icon={Pencil}
              variant="ghost"
              aria-label="Editar usuario"
              className="p-1.5 rounded"
              onClick={() => onEdit(row.original)}
            />
          )}
        </div>
      ),
    },
  ];
}

export default function UserList() {
  const { canCreate, canEdit } = useModulePermissions('/usuarios');
  const users = useUsers();

  const [showDlg, setShowDlg] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | undefined>(undefined);

  function openCreate() {
    setEditUser(undefined);
    setShowDlg(true);
  }

  function openEdit(u: UserItem) {
    setEditUser(u);
    setShowDlg(true);
  }

  const columns = useMemo(
    () => getColumns(canEdit, openEdit),
    [canEdit]
  );

  return (
    <div className="w-full">

      <DlgUser open={showDlg} onClose={() => setShowDlg(false)} user={editUser} />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-text mb-1">Gestión de Usuarios</h1>
          <p className="text-secondary text-base font-normal">
            Visualiza y administra a todos los usuarios registrados en el sistema.
          </p>
        </div>
      </div>

      <GenericTable<UserItem>
        columns={columns}
        data={users.items}
        isLoading={users.isLoading}
        isFetching={users.isFetching}
        page={users.page}
        pageCount={users.pageCount}
        onPageChange={users.onPageChange}
        onSearchChange={users.onSearchChange}
        searchPlaceholder="Buscar..."
        summary={`${users.totalCount} usuarios en total`}
        filters={
          <>
            <GenericSelect
              value={users.statusFilter}
              onChange={e => users.onStatusChange(e.target.value as '' | 'true' | 'false')}
              name="statusFilter"
            >
              <option value="">Estado: Todos</option>
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </GenericSelect>
            <GenericSelect
              value={users.pageSize}
              onChange={e => users.onPageSizeChange(Number(e.target.value))}
              name="pageSize"
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size} por página</option>
              ))}
            </GenericSelect>
          </>
        }
        actions={
          canCreate && (
            <Button
              type="button"
              label="Añadir Nuevo Usuario"
              icon={Plus}
              variant="primary"
              fullWidth
              onClick={openCreate}
            />
          )
        }
      />

    </div>
  );
}
