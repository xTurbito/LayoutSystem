# Cómo dar de alta un nuevo módulo — Backend (.NET)

Este template sigue Clean Architecture. Cada capa tiene una responsabilidad clara:
- **Domain** → entidades y enums (el modelo de negocio, sin dependencias externas)
- **Application** → contratos (interfaces), DTOs y validaciones de formato
- **Infrastructure** → implementaciones concretas (base de datos, servicios)
- **Api** → endpoints HTTP, autorización

Seguí este orden: las capas superiores dependen de las inferiores, nunca al revés.

---

## Paso 1 — DTOs (`Application/DTOs/{Modulo}/`)

Los DTOs son los contratos de entrada y salida de tu API. **Nunca expongas entidades de dominio directamente.**

```csharp
// Application/DTOs/Productos/ProductoListDto.cs
namespace apilayout.Application.DTOs.Productos;

public record ProductoListDto(Guid Id, string Nombre, decimal Precio, bool IsActive);

// Application/DTOs/Productos/CreateProductoDto.cs
public class CreateProductoDto
{
    public required string Nombre { get; set; }
    public required decimal Precio { get; set; }
}

// Application/DTOs/Productos/UpdateProductoDto.cs
public class UpdateProductoDto
{
    public required Guid Id { get; set; }
    public required string Nombre { get; set; }
    public required decimal Precio { get; set; }
}
```

> **¿Por qué records para los Dto de salida?** Son inmutables por defecto y más concisos. Para los de entrada usamos `class` porque necesitamos `required`.

---

## Paso 2 — Validator (`Application/Validators/{Modulo}/`)

FluentValidation valida **formato y estructura**. Las reglas de negocio (unicidad, FKs) van en el Service.

```csharp
// Application/Validators/Productos/CreateProductoValidator.cs
using FluentValidation;
using apilayout.Application.DTOs.Productos;

namespace apilayout.Application.Validators.Productos;

public class CreateProductoValidator : AbstractValidator<CreateProductoDto>
{
    public CreateProductoValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es requerido.")
            .MaximumLength(200).WithMessage("Máximo 200 caracteres.");

        RuleFor(x => x.Precio)
            .GreaterThan(0).WithMessage("El precio debe ser mayor a 0.");
    }
}
```

> El validator **se registra automáticamente** gracias a `AddValidatorsFromAssemblyContaining` en `ApplicationServiceExtensions`. No necesitás hacer nada más.

---

## Paso 3 — Interface (`Application/Interfaces/IProductoService.cs`)

Define el contrato del servicio. Application solo conoce la interfaz, nunca la implementación.

```csharp
using apilayout.Application.Common;
using apilayout.Application.DTOs.Productos;

namespace apilayout.Application.Interfaces;

public interface IProductoService
{
    Task<Result<List<ProductoListDto>>> GetAllAsync(CancellationToken ct = default);
    Task<Result> CreateAsync(CreateProductoDto dto, CancellationToken ct = default);
    Task<Result> UpdateAsync(UpdateProductoDto dto, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct = default);
}
```

> **`Result<T>`** es el patrón estándar del proyecto. Evita lanzar excepciones para flujo de negocio — en su lugar retornás `Result.Failure("mensaje")`.

---

## Paso 4 — Service (`Infrastructure/Services/ProductoService.cs`)

La implementación concreta. Accede a la BD vía `AppDbContext`. Aplica reglas de negocio.

```csharp
using apilayout.Application.Common;
using apilayout.Application.DTOs.Productos;
using apilayout.Application.Interfaces;
using apilayout.Domain.Entities;
using apilayout.Domain.Enums;
using apilayout.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace apilayout.Infrastructure.Services;

public class ProductoService(AppDbContext db, IAuditLogService auditLog, ICurrentUserContext currentUser) : IProductoService
{
    public async Task<Result<List<ProductoListDto>>> GetAllAsync(CancellationToken ct = default)
    {
        var items = await db.Productos
            .AsNoTracking()
            .Select(p => new ProductoListDto(p.Id, p.Nombre, p.Precio, p.IsActive))
            .ToListAsync(ct);

        return Result<List<ProductoListDto>>.Success(items);
    }

    public async Task<Result> CreateAsync(CreateProductoDto dto, CancellationToken ct = default)
    {
        // Regla de negocio: unicidad
        if (await db.Productos.AnyAsync(p => p.Nombre == dto.Nombre, ct))
            return Result.Failure("Ya existe un producto con ese nombre.");

        var producto = new Producto { Nombre = dto.Nombre, Precio = dto.Precio };
        db.Productos.Add(producto);
        await db.SaveChangesAsync(ct);

        await auditLog.LogAsync(new AuditLogEntry(
            AuditAction.Create,
            currentUser.Email ?? "unknown",
            currentUser.UserId,
            EntityName: "Producto",
            EntityId: producto.Id.ToString(),
            Details: $"{{\"nombre\":\"{producto.Nombre}\"}}",
            IpAddress: currentUser.IpAddress), ct);

        return Result.Success();
    }

    // Implementar UpdateAsync y DeleteAsync siguiendo el mismo patrón...
}
```

---

## Paso 5 — Registrar en DI (`Infrastructure/DependencyInjection/InfrastructureServiceExtensions.cs`)

```csharp
services.AddScoped<IProductoService, ProductoService>();
```

> **`AddScoped`** significa una instancia por request HTTP. Es el lifetime correcto para servicios que usan `DbContext`.

---

## Paso 6 — Seed (`Infrastructure/Data/DbSeeder.cs`)

Agregar el módulo para que aparezca en el sidebar y en el sistema de permisos:

```csharp
// En SeedModulesAsync — agregar al array:
new Module { Name = "Productos", Description = "Gestión de productos", Icon = "package", Route = "/productos", Order = 3 },

// En SeedRoleModulesAsync — asignar al rol Admin:
var adminRole    = await context.Roles.FirstAsync(r => r.Name == "Admin");
var productosModule = await context.Modules.FirstAsync(m => m.Name == "Productos");
var exists = await context.Set<RoleModule>().AnyAsync(rm => rm.RoleId == adminRole.Id && rm.ModuleId == productosModule.Id);
if (!exists)
{
    context.Set<RoleModule>().Add(new RoleModule
    {
        RoleId    = adminRole.Id,
        ModuleId  = productosModule.Id,
        Actions   = ModuleAction.View | ModuleAction.Create | ModuleAction.Edit | ModuleAction.Delete
    });
    await context.SaveChangesAsync();
}
```

> `Icon` debe ser un nombre de icono de **Lucide** en kebab-case (ej. `"package"`, `"bar-chart-2"`). El frontend lo mapea dinámicamente.
> `Route` debe coincidir **exactamente** con la ruta del frontend (con slash inicial).

---

## Paso 7 — Controller (`Api/Controllers/ProductosController.cs`)

```csharp
using apilayout.Application.DTOs.Productos;
using apilayout.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace apilayout.Api.Controllers;

[ApiController]
[Route("api/productos")]
[Authorize]
public class ProductosController(IProductoService productoService) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "Productos.View")]
    public async Task<IActionResult> GetAll(CancellationToken ct = default)
    {
        var result = await productoService.GetAllAsync(ct);
        return Ok(result.Value);
    }

    [HttpPost]
    [Authorize(Policy = "Productos.Create")]
    public async Task<IActionResult> Create([FromBody] CreateProductoDto dto, CancellationToken ct = default)
    {
        var result = await productoService.CreateAsync(dto, ct);
        if (!result.IsSuccess) return BadRequest(result.Error);
        return Ok();
    }
}
```

> El formato de la policy es `"{NombreModulo}.{Accion}"` donde `NombreModulo` es el `Route` del módulo sin slash y con la primera letra en mayúscula. El `ModuleAuthorizationHandler` lo resuelve automáticamente.

---

## Paso 8 — Migración de BD

```bash
cd api-layout/src
dotnet ef migrations add Add{Modulo} --project apilayout.Infrastructure --startup-project apilayout.Api
dotnet ef database update --project apilayout.Infrastructure --startup-project apilayout.Api
```

Solo necesitás migración si agregaste una **nueva entidad o columna**. Si el módulo solo usa tablas existentes, saltá este paso.

---

## Checklist rápido

- [ ] DTOs en `Application/DTOs/{Modulo}/`
- [ ] Validator en `Application/Validators/{Modulo}/`
- [ ] Interface en `Application/Interfaces/I{Modulo}Service.cs`
- [ ] Service en `Infrastructure/Services/{Modulo}Service.cs`
- [ ] Registrar en `InfrastructureServiceExtensions.cs`
- [ ] Seed módulo en `DbSeeder.cs` (SeedModulesAsync + SeedRoleModulesAsync)
- [ ] Controller en `Api/Controllers/{Modulo}Controller.cs`
- [ ] Migración si hay entidad nueva
