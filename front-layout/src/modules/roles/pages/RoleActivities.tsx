import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, ShieldCheck, ChevronDown, ArrowLeft, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { getIcon } from '../../../components/lib/iconMapper';
import { useRoleActivities } from '../hooks/useRoleActivities';
import { useModulePermissions } from '../../../hooks/useModulePermissions';

export default function RoleActivities() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canEdit } = useModulePermissions('/roles');

  const {
    role,
    modules,
    expandedModules,
    isLoading,
    isSaving,
    savingPermission,
    toggleModule,
    expandAll,
    collapseAll,
    hasPermission,
    togglePermission,
  } = useRoleActivities(id);

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="bg-surface border border-border rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-border rounded w-1/3 mb-3" />
          <div className="h-4 bg-border rounded w-2/3" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-lg p-4 animate-pulse">
            <div className="h-8 bg-border rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!role) {
    return (
      <div className="w-full bg-surface border border-border rounded-lg p-6 text-center">
        <p className="text-secondary">No se encontró el rol</p>
      </div>
    );
  }

  const allExpanded = expandedModules.size === modules.length;
  const isSuperAdmin = role.name.toLowerCase() === 'admin';

  return (
    <div className="w-full">

      <div className="mb-6 flex items-end justify-between gap-3 rounded-[var(--radius-card)] border border-border bg-surface px-5 py-4">
        <div>
          <button
            type="button"
            onClick={() => navigate('/roles')}
            className="mb-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-semibold text-secondary transition-colors hover:bg-primary/8 hover:text-text cursor-pointer"
          >
            <ArrowLeft size={14} />
            Volver a roles
          </button>
          <h1 className="mb-1 text-2xl font-bold text-text">Permisos del Rol</h1>
          <p className="max-w-2xl text-sm leading-6 text-secondary">
            Gestiona los módulos y actividades permitidas para este rol.
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg p-5 sm:p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h2
              className="text-xl font-bold text-text mb-1"
            >
              {role.name}
            </h2>
            <p className="text-sm text-secondary">
              {role.description || 'Sin descripción'}
            </p>
            {isSuperAdmin && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-error/25 bg-error-container px-3 py-1 text-xs font-semibold text-error">
                <AlertTriangle className="h-3.5 w-3.5" />
                Este rol es protegido y no puede ser modificado
              </p>
            )}
          </div>
          <div className="shrink-0 ml-4">
            <div className="w-11 h-11 bg-primary/8 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', role.isActive ? 'bg-primary/10 text-primary' : 'bg-border text-secondary')}>
            {role.isActive ? 'Activo' : 'Inactivo'}
          </span>
          {role.userCount !== undefined && (
            <span className="text-xs text-secondary">
              {role.userCount} usuario{role.userCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-1 mt-8 mb-4">
        <h3 className="text-sm font-semibold text-secondary uppercase">
          Módulos del Sistema
        </h3>
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-3 text-xs font-bold text-secondary">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Guardando
            </span>
          )}
          <button
            type="button"
            onClick={allExpanded ? collapseAll : expandAll}
            className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-secondary transition-colors hover:bg-primary/8 hover:text-text cursor-pointer"
          >
            {allExpanded ? 'Colapsar todos' : 'Expandir todos'}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {modules.map((module) => {
          const Icon = getIcon(module.icon);
          const isExpanded = expandedModules.has(module.id);
          const panelId = `role-module-${module.id}`;

          return (
            <div key={module.id} className="bg-surface border border-border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleModule(module.id)}
                aria-expanded={isExpanded}
                aria-controls={panelId}
                className="flex w-full min-h-[64px] items-center justify-between gap-3 border-b border-border p-4 text-left transition-colors hover:bg-primary/6 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-inset"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/8 text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-text">{module.name}</span>
                    {module.description && (
                      <span className="text-xs text-secondary">{module.description}</span>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={clsx('w-5 h-5 text-secondary transition-transform duration-300', isExpanded && 'rotate-180')}
                />
              </button>

              {isExpanded && (
                <div id={panelId} className="px-4 py-3 space-y-2 bg-bg/50 sm:px-6 sm:py-4">
                  {module.activities.map((activity) => {
                    const isEnabled = hasPermission(module.key, activity.key);
                    const permissionKey = `${module.id}:${activity.key}`;
                    const isThisSaving = savingPermission === permissionKey;

                    return (
                      <div key={activity.id} className="flex items-center justify-between gap-4 rounded-lg px-2 py-2.5 select-none">
                        <div className="flex min-w-0 flex-col">
                          <span className="text-sm font-medium text-text">{activity.name}</span>
                          {activity.description && (
                            <span className="text-xs text-secondary">{activity.description}</span>
                          )}
                        </div>

                        {canEdit && (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isEnabled}
                            aria-busy={isThisSaving || undefined}
                            aria-label={`${isEnabled ? 'Desactivar' : 'Activar'} ${activity.name}`}
                            onClick={() => togglePermission(module.id, module.key, activity.key)}
                            disabled={isSaving || isSuperAdmin}
                            className={clsx('relative cursor-pointer inline-flex h-11 w-[52px] shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed', isEnabled ? 'bg-primary' : 'bg-border')}
                          >
                            {isThisSaving ? (
                              <Loader2 className="mx-auto h-4 w-4 animate-spin text-on-primary" />
                            ) : (
                              <span
                                className={clsx('inline-block h-5 w-5 transform rounded-full bg-surface ring-1 ring-secondary/30 shadow-sm transition-transform duration-300', isEnabled ? 'translate-x-6' : 'translate-x-1.5')}
                              />
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
