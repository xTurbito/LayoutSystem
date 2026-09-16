import { useState, useMemo, useCallback } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus } from 'lucide-react';
import clsx from 'clsx';
import GenericTable from '../../../components/ui/Table';
import SelectField from '../../../components/ui/SelectField';
import CollapsibleSearchInput from '../../../components/ui/CollapsibleSearchInput';
import FilterPopover from '../../../components/ui/FilterPopover';
import StatusBadge from '../../../components/ui/StatusBadge';
import { useModulePermissions } from '../../../hooks/useModulePermissions';
import { useUsers } from '../hooks/useUsers';
import type { UserItem } from '../types';
import DlgUser from '../components/DlgUser';
import Button from '../../../components/ui/Button';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const STATUS_OPTIONS = [{ value: '', label: 'Estado: Todos' }, { value: 'true', label: 'Activo' }, { value: 'false', label: 'Inactivo' }];
const ICON_BUTTON_CLASS = 'h-10 w-10 rounded-full p-0';

const roleBadge: Record<string, string> = {
  ADMIN: 'bg-primary/10 text-primary',
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
      cell: ({ getValue }) => <StatusBadge active={getValue<boolean>()} />,
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
              className={ICON_BUTTON_CLASS}
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
  const [search, setSearch] = useState('');

  const handleSearch = (value: string) => {
    setSearch(value);
    users.onSearchChange(value);
    users.onPageChange(0);
  };

  function openCreate() {
    setEditUser(undefined);
    setShowDlg(true);
  }

  const openEdit = useCallback((u: UserItem) => {
    setEditUser(u);
    setShowDlg(true);
  }, []);

  const columns = useMemo(
    () => getColumns(canEdit, openEdit),
    [canEdit, openEdit]
  );

  return (
    <div className="w-full">

      <DlgUser open={showDlg} onClose={() => setShowDlg(false)} user={editUser} />

      <div className="mb-6 flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Usuarios</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CollapsibleSearchInput
            value={search}
            onChange={handleSearch}
            placeholder="Buscar usuario..."
            className="sm:w-56"
          />
          <FilterPopover activeCount={users.statusFilter !== '' ? 1 : 0}>
            <SelectField
              aria-label="Filtrar usuarios por estado"
              options={STATUS_OPTIONS}
              value={users.statusFilter}
              onChange={value => users.onStatusChange(value as '' | 'true' | 'false')}
              name="statusFilter"
            />
            <SelectField
              aria-label="Usuarios por página"
              options={PAGE_SIZE_OPTIONS.map(size => ({ value: String(size), label: `${size} por página` }))}
              value={String(users.pageSize)}
              onChange={value => users.onPageSizeChange(Number(value))}
              name="pageSize"
            />
          </FilterPopover>

          {canCreate && (
            <Button
              type="button"
              label="Nuevo"
              icon={Plus}
              variant="primary"
              onClick={openCreate}
            />
          )}
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
        showSearch={false}
        summary={`${users.totalCount} usuarios en total`}
        mobileTitle={(user) => user.name}
        mobileSubtitle={(user) => user.email}
        mobileBadges={(user) => <StatusBadge active={user.isActive} />}
        mobileFields={[
          {
            label: 'Rol',
            value: (user) => (
              <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', roleBadge[user.role] ?? roleBadge['USUARIO'])}>
                {user.role}
              </span>
            ),
          },
        ]}
        mobileActions={
          canEdit
            ? (user) => (
                <Button
                  type="button"
                  label=""
                  icon={Pencil}
                  variant="ghost"
                  aria-label="Editar usuario"
                  className={ICON_BUTTON_CLASS}
                  onClick={() => openEdit(user)}
                />
              )
            : undefined
        }
      />

    </div>
  );
}
