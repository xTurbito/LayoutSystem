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

Los secretos **no se guardan en el repo**. `appsettings.json` solo tiene placeholders;
los valores reales se cargan desde user-secrets (desarrollo) o variables de entorno (producción).

```bash
cd api-layout/src/apilayout.Api

# 1. Inicializar user-secrets — genera un UserSecretsId único en el .csproj
dotnet user-secrets init

# 2. Configurar los secretos (viven fuera del repo, en tu carpeta de usuario)
dotnet user-secrets set "ConnectionStrings:Default" "Host=localhost;Port=5432;Database=layoutsystem;Username=TU_USER;Password=TU_PASS"
dotnet user-secrets set "Jwt:Key" "un-secreto-de-minimo-32-caracteres"

# 3. Aplicar migraciones
dotnet ef database update --project ../apilayout.Infrastructure --startup-project .

# 4. Levantar API (http://localhost:5000)
dotnet run
```

#### Secretos y configuración

| | Desarrollo | Producción |
|---|---|---|
| Cómo se cargan | user-secrets (automático en entorno `Development`) | variables de entorno |
| Dónde viven | `~/.microsoft/usersecrets/{UserSecretsId}/secrets.json` | el entorno del servidor |
| En el repo | solo placeholders en `appsettings.json` | — |

El `UserSecretsId` del `.csproj` es el único enlace: .NET arma con él la ruta del archivo
de secretos y lo carga solo. No se commitea ningún valor real, únicamente ese ID.

En producción las variables de entorno reemplazan `:` por `__`:

```bash
export ConnectionStrings__Default="Host=...;Password=..."
export Jwt__Key="..."
```

Comandos de user-secrets (ejecutar desde `api-layout/src/apilayout.Api`):

```bash
dotnet user-secrets list                 # ver todos
dotnet user-secrets set "Clave" "valor"   # agregar o cambiar
dotnet user-secrets remove "Clave"        # borrar uno
```

> `Jwt:Key` debe tener mínimo 32 caracteres. La API valida esto al arrancar y se detiene si no se cumple.

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
