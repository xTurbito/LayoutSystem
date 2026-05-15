import { useAuth } from '../context/AuthContext';
import { ModuleAction, hasAction } from '../types';

/**
 * Retorna los permisos del usuario autenticado para un módulo dado.
 * Se usa pasando la ruta del módulo, ej: useModulePermissions('/usuarios')
 *
 * Los permisos son flags de bits en el backend (Ver=1, Crear=2, Editar=4, etc.)
 * hasAction hace un AND a nivel de bits para verificar si el flag está activo.
 */
export function useModulePermissions(route: string) {
  const { user } = useAuth();
  const mod = user?.role.modules.find(m => m.route === route);

  return {
    canView:   mod ? hasAction(mod.actions, ModuleAction.View)   : false,
    canCreate: mod ? hasAction(mod.actions, ModuleAction.Create) : false,
    canEdit:   mod ? hasAction(mod.actions, ModuleAction.Edit)   : false,
    canDelete: mod ? hasAction(mod.actions, ModuleAction.Delete) : false,
    canExport: mod ? hasAction(mod.actions, ModuleAction.Export) : false,
  };
}
