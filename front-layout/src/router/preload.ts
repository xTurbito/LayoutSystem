// Mapa ruta → import() perezoso, con el MISMO specifier que router/index.tsx usa en
// sus lazy(): Vite resuelve ambos al mismo chunk, así que llamar esto antes de navegar
// deja el chunk ya en caché del navegador (Sidebar dispara esto en onMouseEnter/onFocus).
//
// Cada fork agrega aquí sus propias rutas conforme suma módulos — es solo un mapa de
// datos, sin mecanismo que tocar.
const ROUTE_PRELOADERS: Record<string, () => void> = {
  '/dashboard': () => void import('../modules/dashboard/pages/DashboardPage'),
  '/usuarios': () => void import('../modules/users/pages/UserList'),
  '/roles': () => void import('../modules/roles/pages/RoleList'),
  '/perfil': () => void import('../modules/profile/pages/ProfilePage'),
};

export function preloadRoute(route: string) {
  ROUTE_PRELOADERS[route]?.();
}
