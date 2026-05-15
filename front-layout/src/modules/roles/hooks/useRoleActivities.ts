import { useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ModuleAction, type ModuleActionValue } from '../../../types/index';
import { rolesApi } from '../api';

interface ActivityDef {
  id: string;
  key: string;
  name: string;
  description?: string;
}

const ACTIVITY_DEFS: ActivityDef[] = [
  { id: 'view',   key: 'view',   name: 'Ver'      },
  { id: 'create', key: 'create', name: 'Crear'    },
  { id: 'edit',   key: 'edit',   name: 'Editar'   },
  { id: 'delete', key: 'delete', name: 'Eliminar' },
  { id: 'export', key: 'export', name: 'Exportar' },
];

const ACTION_BIT: Record<string, ModuleActionValue> = {
  view:   ModuleAction.View,
  create: ModuleAction.Create,
  edit:   ModuleAction.Edit,
  delete: ModuleAction.Delete,
  export: ModuleAction.Export,
};

export function useRoleActivities(roleId: string) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  // moduleKey → bitflag actual
  const [permissions, setPermissions] = useState<Record<string, number>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['role-activities', roleId],
    queryFn: () => rolesApi.getActivities(roleId),
    enabled: !!roleId,
  });

  // Sincronizar permisos y expandir todos los módulos al cargar
  useEffect(() => {
    if (data?.modules) {
      const perms: Record<string, number> = {};
      for (const mod of data.modules) {
        perms[mod.key] = mod.actions;
      }
      setPermissions(perms);
      setExpandedModules(new Set(data.modules.map(m => m.id)));
    }
  }, [data]);

  // Adjuntar las actividades estáticas a cada módulo
  const modules = useMemo(
    () => (data?.modules ?? []).map(mod => ({ ...mod, activities: ACTIVITY_DEFS })),
    [data],
  );

  const toggleModule = useCallback((id: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    if (data?.modules) {
      setExpandedModules(new Set(data.modules.map(m => m.id)));
    }
  }, [data]);

  const collapseAll = useCallback(() => setExpandedModules(new Set()), []);

  const hasPermission = useCallback((moduleKey: string, activityKey: string): boolean => {
    const bit = ACTION_BIT[activityKey] ?? ModuleAction.None;
    return ((permissions[moduleKey] ?? 0) & bit) === bit;
  }, [permissions]);

  const mutation = useMutation({
    mutationFn: ({ moduleId, actions }: { moduleId: string; actions: number }) =>
      rolesApi.togglePermission(roleId, moduleId, actions),
    onError: () => {
      toast.error('Error al guardar el permiso');
      // Revertir al estado del servidor
      if (data?.modules) {
        const perms: Record<string, number> = {};
        for (const mod of data.modules) perms[mod.key] = mod.actions;
        setPermissions(perms);
      }
    },
  });

  const togglePermission = useCallback((
    moduleId: string,
    moduleKey: string,
    activityKey: string,
  ) => {
    const bit = ACTION_BIT[activityKey] ?? ModuleAction.None;
    const current = permissions[moduleKey] ?? 0;
    const isEnabled = (current & bit) === bit;
    const newActions = isEnabled ? current & ~bit : current | bit;

    // Optimistic update
    setPermissions(prev => ({ ...prev, [moduleKey]: newActions }));
    mutation.mutate({ moduleId, actions: newActions });
  }, [permissions, mutation]);

  return {
    role: data?.role,
    modules,
    expandedModules,
    isLoading,
    isSaving: mutation.isPending,
    toggleModule,
    expandAll,
    collapseAll,
    hasPermission,
    togglePermission,
  };
}
