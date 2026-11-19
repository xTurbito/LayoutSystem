import { ModuleAction, hasAction } from '../../types';

export interface NavModuleLike {
  route: string;
  order: number;
  isActive: boolean;
  actions: number;
}

// Any other bit without View (e.g. Create or Export only) would open a screen
// whose list query the backend rejects, so View is what grants the page.
function canOpen(m: NavModuleLike): boolean {
  return m.isActive && hasAction(m.actions, ModuleAction.View);
}

export function canAccessModule(modules: readonly NavModuleLike[] | undefined, segment: string): boolean {
  const mod = modules?.find((m) => m.route === `/${segment}`);
  return !!mod && canOpen(mod);
}

export function getNavModules<T extends NavModuleLike>(modules: readonly T[] | undefined): T[] {
  return (modules ?? []).filter(canOpen).sort((a, b) => a.order - b.order);
}

export const BOTTOM_NAV_MAX = 4;

export function getBottomNavModules<T>(navModules: readonly T[]): T[] {
  return navModules.slice(0, BOTTOM_NAV_MAX);
}
