# LayoutSystem

Starter kit full-stack para construir sistemas administrativos con autenticacion, roles, permisos por modulo y una base lista para escalar.

LayoutSystem no busca ser una aplicacion cerrada. Es una base reutilizable para crear forks por proyecto: paneles internos, backoffices, SaaS verticales, CRMs ligeros, sistemas operativos de negocio o cualquier producto que necesite usuarios, permisos, auditoria y modulos administrativos desde el dia uno.

## Vision

La mayoria de productos administrativos comparten una capa comun: login, usuarios, roles, permisos, rutas protegidas, tablas, formularios, validaciones, auditoria, manejo de sesion y estructura modular.

LayoutSystem empaqueta esa base para que el siguiente proyecto empiece desde una arquitectura ordenada, no desde una carpeta vacia.

## Stack

### Backend

- .NET 10 Web API
- Clean Architecture
- Entity Framework Core 10
- PostgreSQL con Npgsql
- JWT access tokens
- Refresh token en cookie HttpOnly
- BCrypt para password hashing
- FluentValidation
- Serilog
- Scalar / OpenAPI
- Rate limiting
- Security headers

### Frontend

- React 19
- TypeScript
- Vite 7
- React Router
- TanStack Query v5
- TanStack Table v8
- React Hook Form
- Zod
- Tailwind CSS 4
- Axios
- Lucide React
- Sonner

## Que incluye

- Login con JWT y renovacion automatica de token
- Refresh tokens rotados y almacenados como hash
- Cookie HttpOnly para refresh token
- Control de acceso por rol y modulo
- Acciones por modulo: `View`, `Create`, `Edit`, `Delete`, `Export`
- Sidebar dinamico segun permisos
- Rutas protegidas en frontend
- Politicas de autorizacion en backend
- CRUD de usuarios
- CRUD de roles
- Asignacion de permisos por modulo
- Perfil de usuario
- Cambio de contrasena
- Revocacion de tokens ante eventos sensibles
- Audit log
- Soft delete
- Paginacion, busqueda y filtros
- Hooks genericos para listas y mutaciones CRUD
- Manejo centralizado de errores HTTP
- Seeding idempotente
- Configuracion segura con user-secrets y variables de entorno

## Arquitectura

```txt
api-layout/
  src/
    apilayout.Domain/          Entidades, enums y reglas base del dominio
    apilayout.Application/     DTOs, interfaces, validators y modelos comunes
    apilayout.Infrastructure/  EF Core, servicios, migraciones y persistencia
    apilayout.Api/             Controllers, middleware, auth y OpenAPI

front-layout/
  src/
    api/                       Cliente HTTP e interceptores
    components/                UI reutilizable y layout
    context/                   AuthContext
    hooks/                     Hooks compartidos
    modules/                   Modulos funcionales
    router/                    Rutas protegidas y lazy loading
```

## Decisiones de diseno

- Separacion por capas para que el dominio no dependa de infraestructura.
- Frontend organizado por modulo para evitar una carpeta global de componentes mezclados con logica de negocio.
- Permisos enviados en el token para construir navegacion y proteger vistas.
- Backend como fuente de verdad para autorizacion real.
- Refresh token fuera de JavaScript mediante cookie HttpOnly.
- Access token en memoria para reducir persistencia innecesaria.
- Validaciones declarativas en backend y frontend.
- Auditoria para operaciones relevantes.
- Base preparada para agregar nuevos modulos sin rearmar la aplicacion.

## Primeros pasos

### Backend

Los secretos no se guardan en el repo. `appsettings.json` contiene placeholders; los valores reales deben vivir en user-secrets durante desarrollo o en variables de entorno en produccion.

```bash
cd api-layout/src/apilayout.Api

dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:Default" "Host=localhost;Port=5432;Database=layoutsystem;Username=TU_USER;Password=TU_PASS"
dotnet user-secrets set "Jwt:Key" "un-secreto-de-minimo-32-caracteres"

dotnet ef database update --project ../apilayout.Infrastructure --startup-project .
dotnet run
```

En desarrollo, la documentacion de la API queda disponible mediante Scalar.

### Frontend

```bash
cd front-layout
cp .env.example .env
npm install
npm run dev
```

Por defecto el frontend corre en:

```txt
http://localhost:5173
```

## Variables importantes

### Backend

```txt
ConnectionStrings:Default
Jwt:Key
Jwt:Issuer
Jwt:Audience
Jwt:ExpiresInMinutes
Jwt:RefreshExpiresInDays
Cors:AllowedOrigins
```

En produccion, las variables de entorno reemplazan `:` por `__`:

```bash
export ConnectionStrings__Default="Host=...;Password=..."
export Jwt__Key="..."
```

### Frontend

```txt
VITE_API_URL=http://localhost:5000
```

## Credenciales por defecto

El seeder crea un usuario administrador para desarrollo:

```txt
Email: correo@correo.com
Password: password
```

Cambia estas credenciales antes de usar la base en un entorno real.

## Roadmap natural

- Modulos de negocio especificos por fork.
- Multi-tenant.
- Invitaciones de usuarios.
- Recuperacion de contrasena.
- Permisos por organizacion o sucursal.
- Dashboard con metricas operativas.
- Notificaciones.
- Jobs en background.
- Exportaciones.
- Integracion con storage externo.
- Plantillas visuales por vertical.

## Estado

LayoutSystem es un starter kit en evolucion. La base ya incluye seguridad, permisos, auth, auditoria, frontend modular y backend por capas; cada fork puede especializar dominio, UI y reglas de negocio sin empezar desde cero.
