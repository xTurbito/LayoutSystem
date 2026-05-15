# LayoutSystem

Template fullstack para sistemas de gestión con autenticación, roles y permisos por módulo. Pensado para usarse como base y escalar según el proyecto.

---

## Stack

### Backend — .NET 10
| | |
|---|---|
| Framework | ASP.NET Core 10 |
| ORM | Entity Framework Core 10 |
| Base de datos | PostgreSQL (Npgsql) |
| Autenticación | JWT + Refresh Token (httpOnly cookie) |
| Documentación | Scalar / OpenAPI |
| Logs | Serilog (consola + archivo rotativo) |
| Hashing | BCrypt.Net |

### Frontend — React 19 + TypeScript
| | |
|---|---|
| Build tool | Vite 7 |
| Estilos | Tailwind CSS 4 |
| State / fetching | TanStack Query v5 |
| Tablas | TanStack Table v8 |
| Formularios | React Hook Form + Zod |
| HTTP | Axios |
| Iconos | Lucide React |
| Notificaciones | Sonner |

---

## Arquitectura

### Backend — Clean Architecture

```
apilayout.Api            → Controllers, Middleware, configuración HTTP
apilayout.Application    → DTOs, Interfaces, Validators, lógica de negocio
apilayout.Domain         → Entidades, Enums, BaseEntity
apilayout.Infrastructure → EF Core, Repositories, Servicios, Migraciones
```

Las capas internas (Domain, Application) no dependen de nada externo. La infraestructura implementa las interfaces definidas en Application.

### Frontend — Feature-based

```
src/
├── components/ui/     → Componentes reutilizables (Button, Input, Table, Modal…)
├── modules/           → Cada módulo agrupa su página, hooks, api, schemas y tipos
│   ├── dashboard/
│   ├── roles/
│   ├── users/
│   └── profile/
├── hooks/             → Hooks genéricos (useListQuery, useCrudMutation…)
├── context/           → AuthContext
└── router/            → Rutas protegidas por permisos
```

---

## Funcionalidades incluidas

- Login con JWT y renovación automática de token
- Control de acceso por rol y módulo (View / Create / Edit / Delete / Export)
- CRUD de usuarios y roles
- Soft delete (borrado lógico)
- Audit log de acciones
- Paginación, búsqueda y filtros en tablas
- Rate limiting en endpoints de autenticación
- Perfil de usuario con cambio de contraseña

---

## Primeros pasos

### Backend

```bash
# 1. Configurar base de datos en appsettings.json
# 2. Aplicar migraciones
dotnet ef database update --project src/apilayout.Infrastructure --startup-project src/apilayout.Api

# 3. Levantar API (puerto 5069 por defecto)
cd src/apilayout.Api
dotnet run
```

> En producción es obligatorio cambiar `Jwt:Key` por un secreto seguro de al menos 32 caracteres, ya sea en variables de entorno o en `appsettings.Production.json`.

### Frontend

```bash
cd front-layout
cp .env.example .env      # ajustar VITE_API_URL si es necesario
npm install
npm run dev               # http://localhost:5173
```

---

## Credenciales por defecto

| Campo | Valor |
|---|---|
| Email | `correo@correo.com` |
| Contraseña | `password` |

Cambiar antes de pasar a producción.
