import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, ChevronDown, ArrowLeft } from 'lucide-react';
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
    toggleModule,
    expandAll,
    collapseAll,
    hasPermission,
    togglePermission,
  } = useRoleActivities(id);

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="bg-surface border border-border rounded-xl p-6 animate-pulse">
          <div className="h-6 bg-border rounded w-1/3 mb-3" />
          <div className="h-4 bg-border rounded w-2/3" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4 animate-pulse">
            <div className="h-8 bg-border rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!role) {
    return (
      <div className="w-full bg-surface border border-border rounded-xl p-6 text-center">
        <p className="text-secondary">No se encontró el rol</p>
      </div>
    );
  }

  const allExpanded = expandedModules.size === modules.length;
  const isSuperAdmin = role.name.toLowerCase() === 'admin';

  return (
    <div className="w-full">

      <div className="flex items-end justify-between gap-3 mb-6">
        <div>
          <button
            onClick={() => navigate('/roles')}
            className="flex items-center gap-1 text-secondary hover:text-text text-sm mb-2 transition-colors"
          >
            <ArrowLeft size={14} />
            Volver a roles
          </button>
          <h1 className="text-2xl font-black text-text mb-1">Permisos del Rol</h1>
          <p className="text-secondary text-base font-normal">
            Gestiona los módulos y actividades permitidas para este rol.
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
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
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ Este rol es protegido y no puede ser modificado
              </p>
            )}
          </div>
          <div className="shrink-0 ml-4">
            <div className="w-10 h-10 bg-primary/8 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold', role.isActive ? 'bg-green-100 text-green-700' : 'bg-border text-secondary')}>
            {role.isActive ? 'Activo' : 'Inactivo'}
          </span>
          {role.userCount !== undefined && (
            <span className="text-xs text-secondary">
              {role.userCount} usuario{role.userCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-1 mt-8 mb-4">
        <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider">
          Módulos del Sistema
        </h3>
        <button
          onClick={allExpanded ? collapseAll : expandAll}
          className="text-xs text-secondary font-medium hover:text-text hover:underline"
        >
          {allExpanded ? 'Colapsar todos' : 'Expandir todos'}
        </button>
      </div>

      <div className="space-y-3">
        {modules.map((module) => {
          const Icon = getIcon(module.icon);
          const isExpanded = expandedModules.has(module.id);

          return (
            <div key={module.id} className="bg-surface border border-border rounded-xl overflow-hidden">
              <div
                onClick={() => toggleModule(module.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-bg transition-colors border-b border-border select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/8 text-primary">
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
              </div>

              {isExpanded && (
                <div className="px-6 py-4 space-y-4 bg-bg/50">
                  {module.activities.map((activity) => {
                    const isEnabled = hasPermission(module.key, activity.key);

                    return (
                      <div key={activity.id} className="flex items-center justify-between py-2 select-none">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-text">{activity.name}</span>
                          {activity.description && (
                            <span className="text-xs text-secondary">{activity.description}</span>
                          )}
                        </div>

                        {canEdit && (
                          <button
                            onClick={() => togglePermission(module.id, module.key, activity.key)}
                            disabled={isSaving || isSuperAdmin}
                            className={clsx('relative cursor-pointer inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed', isEnabled ? 'bg-green-500' : 'bg-border')}
                          >
                            <span
                              className={clsx('inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300', isEnabled ? 'translate-x-6' : 'translate-x-1')}
                            />
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
