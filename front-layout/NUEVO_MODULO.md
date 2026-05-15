# Cómo dar de alta un nuevo módulo — Frontend (React)

El frontend sigue una estructura modular: cada módulo de negocio vive en `src/modules/{nombre}/` y es completamente autocontenido. El sidebar y las rutas se actualizan en dos archivos centrales.

La separación de responsabilidades es:
- **`src/api/`** → llamadas HTTP (solo axios, sin lógica)
- **`hooks/`** → lógica de server state con TanStack Query
- **`pages/`** → vistas que consumen los hooks
- **`components/`** → piezas visuales reutilizables del módulo

---

## Paso 1 — API client (`src/api/{modulo}.ts`)

Define todas las llamadas al backend. Nada de lógica aquí, solo HTTP.

```ts
// src/api/productos.ts
import { apiClient } from './client';
import type { ProductoItem, CreateProductoDTO } from '../modules/productos/types';

export const productosApi = {
  getAll: () =>
    apiClient.get<ProductoItem[]>('/api/productos').then(r => r.data),

  create: (data: CreateProductoDTO) =>
    apiClient.post<ProductoItem>('/api/productos', data).then(r => r.data),

  update: (data: UpdateProductoDTO) =>
    apiClient.put(`/api/productos/${data.id}`, data).then(r => r.data),

  remove: (id: string) =>
    apiClient.delete(`/api/productos/${id}`).then(r => r.data),
};
```

---

## Paso 2 — Types (`src/modules/{modulo}/types.ts`)

Tipado que refleja lo que el backend devuelve. Un tipo por DTO del backend.

```ts
// src/modules/productos/types.ts
export interface ProductoItem {
  id: string;
  nombre: string;
  precio: number;
  isActive: boolean;
}

export interface CreateProductoDTO {
  nombre: string;
  precio: number;
}

export interface UpdateProductoDTO {
  id: string;
  nombre: string;
  precio: number;
}
```

---

## Paso 3 — Hook de lista (`src/modules/{modulo}/hooks/use{Modulo}s.ts`)

Encapsula el `useQuery`. Los componentes nunca llaman a TanStack Query directamente.

```ts
// src/modules/productos/hooks/useProductos.ts
import { useQuery } from '@tanstack/react-query';
import { productosApi } from '../../../api/productos';

export function useProductos() {
  return useQuery({
    queryKey: ['productos'],
    queryFn: productosApi.getAll,
  });
}
```

> **¿Por qué un hook por módulo?** Centraliza el `queryKey`, facilita invalidaciones y hace que los componentes sean más simples de leer.

---

## Paso 4 — Hook de mutaciones (`src/modules/{modulo}/hooks/use{Modulo}Mutation.ts`)

Encapsula create/update/delete con invalidación automática del cache.

```ts
// src/modules/productos/hooks/useProductoMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productosApi } from '../../../api/productos';
import type { CreateProductoDTO, UpdateProductoDTO } from '../types';

export function useProductoMutation() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['productos'] });

  const create = useMutation({
    mutationFn: (data: CreateProductoDTO) => productosApi.create(data),
    onSuccess: () => { toast.success('Producto creado'); invalidate(); },
    onError:   () => toast.error('Error al crear el producto'),
  });

  const update = useMutation({
    mutationFn: (data: UpdateProductoDTO) => productosApi.update(data),
    onSuccess: () => { toast.success('Producto actualizado'); invalidate(); },
    onError:   () => toast.error('Error al actualizar el producto'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => productosApi.remove(id),
    onSuccess: () => { toast.success('Producto eliminado'); invalidate(); },
    onError:   () => toast.error('Error al eliminar el producto'),
  });

  return { create, update, remove };
}
```

---

## Paso 5 — Página de lista (`src/modules/{modulo}/pages/{Modulo}List.tsx`)

La página principal del módulo. Usa los hooks, `useModulePermissions` para permisos, y los componentes UI compartidos.

```tsx
// src/modules/productos/pages/ProductoList.tsx
import { useState } from 'react';
import { useModulePermissions } from '../../../hooks/useModulePermissions';
import { useProductos } from '../hooks/useProductos';
import { PaginationTable } from '../../../components/ui/PaginationTable';
import { Button } from '../../../components/ui/Button';
import { SearchInput } from '../../../components/ui/SearchInput';

export default function ProductoList() {
  const { canCreate, canEdit, canDelete } = useModulePermissions('/productos');
  const { data: productos = [], isLoading } = useProductos();
  const [search, setSearch] = useState('');

  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'nombre',  label: 'Nombre' },
    { key: 'precio',  label: 'Precio' },
  ];

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-primary">Productos</h1>
          <p className="text-secondary text-base">Gestión de productos del sistema.</p>
        </div>
        {canCreate && <Button onClick={() => {}}>Nuevo producto</Button>}
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Buscar producto..." />

      <PaginationTable
        data={filtered}
        columns={columns}
        isLoading={isLoading}
        // renderActions={canEdit || canDelete ? (row) => <></> : undefined}
      />
    </div>
  );
}
```

> **`useModulePermissions('/productos')`** — el argumento es el `Route` del módulo tal como está en el seed del backend (con slash inicial). Retorna `{ canView, canCreate, canEdit, canDelete, canExport }`.

---

## Paso 6 — Icono en el iconMapper (`src/components/lib/iconMapper.ts`)

El sidebar y RoleActivities usan `getIcon()` del mismo mapa central. Solo necesitás agregar el ícono ahí.

```ts
// src/modules/lib/iconMapper.ts
import { Package } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  // ... íconos existentes
  package: Package,   // ← agregar esta línea
};
```

> La `key` debe coincidir exactamente con el `Icon` que pusiste en el seed del backend.

---

## Paso 7 — Ruta (`src/router/index.tsx`)

Agregar el import lazy y la ruta dentro de `ModuleGuard`:

```tsx
// Imports lazy al inicio del archivo
const ProductoList = lazy(() => import('../modules/productos/pages/ProductoList'));

// Dentro del array de children de ModuleGuard:
{ path: 'productos', element: <Suspense fallback={<PageLoader />}><ProductoList /></Suspense> },
```

> La ruta va sin slash inicial (`'productos'`), pero el `Route` del seed va con slash (`'/productos'`). Es la convención de React Router v6.

---

## Checklist rápido

- [ ] `src/api/productos.ts`
- [ ] `src/modules/productos/types.ts`
- [ ] `src/modules/productos/hooks/useProductos.ts`
- [ ] `src/modules/productos/hooks/useProductoMutation.ts`
- [ ] `src/modules/productos/pages/ProductoList.tsx`
- [ ] Icono en `ICON_MAP` de `Sidebar.tsx`
- [ ] Ruta en `router/index.tsx` dentro de `ModuleGuard`

---

## Componentes UI disponibles

| Componente       | Uso                                              |
|------------------|--------------------------------------------------|
| `Button`         | Botones de acción                                |
| `Input`          | Campos de texto                                  |
| `Select`         | Dropdowns                                        |
| `FormField`      | Wrapper de label + input con manejo de errores   |
| `SearchInput`    | Input de búsqueda con debounce                   |
| `Table`          | Tabla básica                                     |
| `PaginationTable`| Tabla con paginación integrada                   |
| `ModalShell`     | Wrapper estándar para modales                    |
