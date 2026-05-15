import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';


const DashboardPage = lazy(() => import('../modules/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const UserList = lazy(() => import('../modules/users/pages/UserList'));
const RoleList = lazy(() => import('../modules/roles/pages/RoleList'));
const RoleActivities = lazy(() => import('../modules/roles/pages/RoleActivities'));
const ProfilePage = lazy(() => import('../modules/profile/pages/ProfilePage'));

// Layout raíz: provee AuthContext a todo el árbol de rutas
function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

// Redirige al login si no hay sesión activa
function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function PageLoader() {
  return (
    <div className="flex flex-col gap-4 p-6 w-full animate-pulse">
      <div className="h-7 bg-slate-200 rounded w-48" />
      <div className="h-4 bg-slate-200 rounded w-72" />
      <div className="h-64 bg-slate-200 rounded-xl w-full mt-2" />
    </div>
  );
}

// Redirige a 404 si el usuario no tiene acceso (actions === 0) al módulo de la ruta actual
function ModuleGuard() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const mod = user?.role.modules.find(m => m.route === `/${pathname.split('/')[1]}`);
  if (mod && mod.actions === 0) return <Navigate to="/not-found" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <Navigate to="/login" replace />,
    children: [
      { path: '/login', element: <LoginPage /> },
      {
        path: '/',
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { index: true, element: <Navigate to="/dashboard" replace /> },
              {
                element: <ModuleGuard />,
                children: [
                  { path: 'dashboard', element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense> },
                  { path: 'usuarios', element: <Suspense fallback={<PageLoader />}><UserList /></Suspense> },
                  { path: 'roles', element: <Suspense fallback={<PageLoader />}><RoleList /></Suspense> },
                  { path: 'roles/:id', element: <Suspense fallback={<PageLoader />}><RoleActivities /></Suspense> },
                  { path: 'perfil', element: <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense> }
                ],
              },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
