import { useMemo, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModulePermissions } from '../../../hooks/useModulePermissions';
import { useRoles } from '../hooks/useRoles';
import { useRoleMutation } from '../hooks/useRoleMutation';
import DlgRole from '../components/DlgRole';
import type { RoleItem } from '../types';
import Button from '../../../components/ui/Button';
import SelectField from '../../../components/ui/SelectField';
import CollapsibleSearchInput from '../../../components/ui/CollapsibleSearchInput';
import FilterPopover from '../../../components/ui/FilterPopover';
import GenericTable from '../../../components/ui/Table';
import StatusBadge from '../../../components/ui/StatusBadge';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import ActionsMenu from '../../../components/ui/ActionsMenu';

const STATUS_OPTIONS = [{ value: '', label: 'Estado: Todos' }, { value: 'true', label: 'Activo' }, { value: 'false', label: 'Inactivo' }];
const ICON_BUTTON_CLASS = 'h-10 w-10 rounded-full p-0';
const MENU_ITEM_CLASS =
  'flex min-h-10 w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm text-text hover:bg-primary/8 hover:text-primary material-state';

function getColumns(
  canEdit: boolean,
  canDelete: boolean,
  onOpen: (role: RoleItem) => void,
  onEdit: (role: RoleItem) => void,
  onDeleteRequest: (role: RoleItem) => void,
): ColumnDef<RoleItem>[] {
  const columns: ColumnDef<RoleItem>[] = [
    {
      accessorKey: 'name',
      header: 'Rol',
      cell: ({ getValue }) => (
        <span className="truncate font-semibold text-text">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Descripción',
      cell: ({ getValue }) => (
        <span className="line-clamp-1 text-secondary">{getValue<string>() || 'Sin descripción'}</span>
      ),
    },
    {
      accessorKey: 'usersCount',
      header: 'Usuarios',
      cell: ({ getValue }) => {
        const count = getValue<number>();
        return <span className="text-text">{count} usuario{count !== 1 ? 's' : ''}</span>;
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Estado',
      cell: ({ getValue }) => <StatusBadge active={getValue<boolean>()} />,
    },
  ];

  if (!canEdit && !canDelete) return columns;

  return [
    ...columns,
    {
      id: 'actions',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <ActionsMenu label="Más acciones" buttonClassName={ICON_BUTTON_CLASS}>
            <button type="button" className={MENU_ITEM_CLASS} onClick={() => onOpen(row.original)}>
              <ShieldCheck size={16} />
              Editar permisos
            </button>
          </ActionsMenu>
          {canEdit && (
            <Button
              type="button"
              label=""
              icon={Pencil}
              variant="ghost"
              aria-label="Editar rol"
              className={ICON_BUTTON_CLASS}
              onClick={() => onEdit(row.original)}
            />
          )}
          {canDelete && (
            <Button
              type="button"
              label=""
              icon={Trash2}
              variant="ghost"
              aria-label="Eliminar rol"
              className={`${ICON_BUTTON_CLASS} text-red-500 hover:bg-red-500/10`}
              onClick={() => onDeleteRequest(row.original)}
            />
          )}
        </div>
      ),
    },
  ];
}

export default function RoleList() {
  const { canCreate, canEdit, canDelete } = useModulePermissions('/roles');
  const { roles, isLoading } = useRoles();
  const navigate = useNavigate();

  const [dlg, setDlg] = useState<{ open: boolean; role?: RoleItem }>({ open: false });
  const [deleteDlg, setDeleteDlg] = useState<{ open: boolean; role?: RoleItem }>({ open: false });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'true' | 'false'>('');

  const openCreate = () => setDlg({ open: true, role: undefined });
  const openEdit = (role: RoleItem) => setDlg({ open: true, role });
  const closeDlg = () => setDlg((prev) => ({ ...prev, open: false }));

  const openDeleteDlg = (role: RoleItem) => setDeleteDlg({ open: true, role });
  const closeDeleteDlg = () => setDeleteDlg((prev) => ({ ...prev, open: false }));

  const { remove } = useRoleMutation(closeDeleteDlg);
  const handleDelete = () => {
    if (deleteDlg.role) remove.mutate(deleteDlg.role.id);
  };

  const filteredRoles = useMemo(() => {
    let list = roles;
    if (statusFilter !== '') list = list.filter((r) => r.isActive === (statusFilter === 'true'));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q));
    }
    return list;
  }, [roles, statusFilter, search]);

  const columns = useMemo(
    () => getColumns(canEdit, canDelete, (role) => navigate(`/roles/${role.id}`), openEdit, openDeleteDlg),
    [canEdit, canDelete, navigate],
  );

  return (
    <div className="w-full">
      <DlgRole open={dlg.open} onClose={closeDlg} role={dlg.role} />

      <ConfirmDialog
        open={deleteDlg.open}
        onClose={closeDeleteDlg}
        onConfirm={handleDelete}
        title="Eliminar rol"
        description={deleteDlg.role ? `¿Seguro que querés eliminar el rol "${deleteDlg.role.name}"? Esta acción no se puede deshacer.` : undefined}
        confirmLabel="Eliminar"
        isLoading={remove.isPending}
      />

      <div className="mb-6 flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Roles</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CollapsibleSearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar rol..."
            className="sm:w-56"
          />
          <FilterPopover activeCount={statusFilter !== '' ? 1 : 0}>
            <SelectField
              aria-label="Filtrar roles por estado"
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as '' | 'true' | 'false')}
              name="statusFilter"
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

      <GenericTable<RoleItem>
        columns={columns}
        data={filteredRoles}
        isLoading={isLoading}
        page={0}
        pageCount={1}
        onPageChange={() => {}}
        showSearch={false}
        summary={`${filteredRoles.length} rol${filteredRoles.length !== 1 ? 'es' : ''} en total`}
        mobileTitle={(role) => role.name}
        mobileSubtitle={(role) => role.description || 'Sin descripción'}
        mobileBadges={(role) => <StatusBadge active={role.isActive} />}
        mobileFields={[
          {
            label: 'Usuarios',
            value: (role) => `${role.usersCount} usuario${role.usersCount !== 1 ? 's' : ''}`,
          },
        ]}
        mobileActions={
          canEdit || canDelete
            ? (role) => (
              <div className="flex items-center gap-1">
                <ActionsMenu label="Más acciones" buttonClassName={ICON_BUTTON_CLASS}>
                  <button type="button" className={MENU_ITEM_CLASS} onClick={() => navigate(`/roles/${role.id}`)}>
                    <ShieldCheck size={16} />
                    Editar permisos
                  </button>
                </ActionsMenu>
                {canEdit && (
                  <Button
                    type="button"
                    label=""
                    icon={Pencil}
                    variant="ghost"
                    aria-label="Editar rol"
                    className={ICON_BUTTON_CLASS}
                    onClick={() => openEdit(role)}
                  />
                )}
                {canDelete && (
                  <Button
                    type="button"
                    label=""
                    icon={Trash2}
                    variant="ghost"
                    aria-label="Eliminar rol"
                    className={`${ICON_BUTTON_CLASS} text-red-500 hover:bg-red-500/10`}
                    onClick={() => openDeleteDlg(role)}
                  />
                )}
              </div>
            )
            : undefined
        }
      />
    </div>
  );
}
