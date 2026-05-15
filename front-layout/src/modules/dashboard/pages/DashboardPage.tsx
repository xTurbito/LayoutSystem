import { useAuth } from '../../../context/AuthContext';

function countBits(n: number): number {
  let count = 0;
  let v = n;
  while (v > 0) { count += v & 1; v >>= 1; }
  return count;
}

export function DashboardPage() {
  const { user } = useAuth();

  const activeModules = user?.role.modules.filter((m) => m.isActive && m.actions > 0) ?? [];
  const totalPermissions = activeModules.reduce((sum, m) => sum + countBits(m.actions), 0);

  const stats = [
    {
      label: 'Módulos activos',
      value: activeModules.length,
      description: 'Secciones a las que tienes acceso',
    },
    {
      label: 'Rol asignado',
      value: user?.role.name ?? '—',
      description: 'Perfil de permisos de tu cuenta',
    },
    {
      label: 'Permisos totales',
      value: totalPermissions,
      description: 'Acciones disponibles en todos los módulos',
    },
  ];

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h2 className="text-xl font-bold text-text">Dashboard</h2>
        <p className="text-sm text-secondary mt-0.5">
          Bienvenido, <span className="font-medium text-text">{user?.name}</span>. Aquí tienes un resumen de tu acceso.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-1"
          >
            <span className="text-xs font-medium text-secondary uppercase tracking-wide">{stat.label}</span>
            <span className="text-3xl font-black text-text">{stat.value}</span>
            <span className="text-xs text-secondary">{stat.description}</span>
          </div>
        ))}
      </div>

      {/* Módulos con acceso */}
      {activeModules.length > 0 && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-text">Módulos disponibles</h3>
          </div>
          <ul className="divide-y divide-border">
            {activeModules.map((mod) => (
              <li key={mod.route} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-text">{mod.name}</span>
                <span className="text-xs text-secondary bg-bg px-2 py-0.5 rounded-full border border-border">
                  {countBits(mod.actions)} acción{countBits(mod.actions) !== 1 ? 'es' : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}
