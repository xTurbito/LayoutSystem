using apilayout.Domain.Entities;
using apilayout.Domain.Enums;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;

namespace apilayout.Infrastructure.Data;

public static class DbSeeder
{
    // Orden de ejecución importa: Roles → Modules → Users → RoleModules
    // Cada método es idempotente: solo inserta si el registro no existe todavía.
    public static async Task SeedAsync(AppDbContext context)
    {
        await SeedRolesAsync(context);
        await SeedModulesAsync(context);
        await SeedUsersAsync(context);
        await SeedRoleModulesAsync(context);

    }

    // ─── AGREGAR UN ROL ────────────────────────────────────────────────────────
    // Añade una nueva línea al array. El Name es la clave de idempotencia.
    // Ejemplo:
    //   new Role { Name = "Manager", Description = "Gerente de área" },
    private static async Task SeedRolesAsync(AppDbContext context)
    {
        var roles = new[]
        {
            new Role { Name = "Admin", Description = "Administrador del sistema" },
            new Role { Name = "User", Description = "Usuario estándar" },
        };

        foreach (var role in roles)
        {
            if (!await context.Roles.AnyAsync(r => r.Name == role.Name))
                context.Roles.Add(role);
        }

        await context.SaveChangesAsync();
    }

    // ─── AGREGAR UN MÓDULO ─────────────────────────────────────────────────────
    // Cada módulo aparece en el sidebar del frontend. Campos:
    //   Name        → clave de idempotencia y etiqueta en UI
    //   Icon        → nombre del icono Lucide (string), ej. "bar-chart-2"
    //   Route       → ruta con slash inicial, ej. "/reports"
    //                 ⚠ Debe coincidir con una ruta definida en src/router/index.tsx del frontend
    //   Order       → posición en el sidebar (ascendente)
    // Ejemplo:
    //   new Module { Name = "Reportes", Description = "Reportes del sistema", Icon = "bar-chart-2", Route = "/reports", Order = 2 },
    private static async Task SeedModulesAsync(AppDbContext context)
    {
        var modules = new[]
        {
            new Module { Name = "Usuarios", Description = "Gestión de usuarios", Icon = "users", Route = "/users", Order = 1 },
        };

        foreach (var module in modules)
        {
            if (!await context.Modules.AnyAsync(m => m.Name == module.Name))
                context.Modules.Add(module);
        }

        await context.SaveChangesAsync();
    }

    // ─── AGREGAR UN USUARIO SEED ───────────────────────────────────────────────
    // Para agregar más usuarios seed, replica el bloque if + Add con distinto Email.
    // La contraseña se hashea con BCrypt; nunca guardes el texto plano.
    // Ejemplo:
    //   if (!await context.Users.AnyAsync(u => u.Email == "manager@correo.com"))
    //   {
    //       var managerRole = await context.Roles.FirstAsync(r => r.Name == "Manager");
    //       context.Users.Add(new User { Name = "Manager", Email = "manager@correo.com",
    //           PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"), RoleId = managerRole.Id });
    //       await context.SaveChangesAsync();
    //   }
    private static async Task SeedUsersAsync(AppDbContext context)
    {
        if (await context.Users.AnyAsync(u => u.Email == "correo@correo.com")) return;

        var adminRole = await context.Roles.FirstAsync(r => r.Name == "Admin");

        context.Users.Add(new User
        {
            Name = "Admin",
            Email = "correo@correo.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
            RoleId = adminRole.Id
        });

        await context.SaveChangesAsync();
    }

    // ─── ASIGNAR MÓDULOS A UN ROL ──────────────────────────────────────────────
    // RoleModule vincula un rol con un módulo y define qué acciones puede hacer.
    // Actions usa bitflags (OR para combinar):
    //   ModuleAction.View    = 1   → puede ver el módulo
    //   ModuleAction.Create  = 2   → puede crear registros
    //   ModuleAction.Edit    = 4   → puede editar registros
    //   ModuleAction.Delete  = 8   → puede eliminar registros
    //   ModuleAction.Export  = 16  → puede exportar datos
    //
    // Para asignar un nuevo módulo a un rol existente, copia el bloque exists + Add.
    // Ejemplo — darle al rol "User" acceso de solo lectura al módulo "Reportes":
    //   var userRole    = await context.Roles.FirstAsync(r => r.Name == "User");
    //   var reportsModule = await context.Modules.FirstAsync(m => m.Name == "Reportes");
    //   var exists2 = await context.Set<RoleModule>()
    //       .AnyAsync(rm => rm.RoleId == userRole.Id && rm.ModuleId == reportsModule.Id);
    //   if (!exists2)
    //   {
    //       context.Set<RoleModule>().Add(new RoleModule
    //       {
    //           RoleId = userRole.Id,
    //           ModuleId = reportsModule.Id,
    //           Actions = ModuleAction.View
    //       });
    //       await context.SaveChangesAsync();
    //   }
    private static async Task SeedRoleModulesAsync(AppDbContext context)
    {
        var adminRole = await context.Roles.FirstAsync(r => r.Name == "Admin");
        var usersModule = await context.Modules.FirstAsync(m => m.Name == "Usuarios");

        var exists = await context.Set<RoleModule>()
            .AnyAsync(rm => rm.RoleId == adminRole.Id && rm.ModuleId == usersModule.Id);

        if (!exists)
        {
            context.Set<RoleModule>().Add(new RoleModule
            {
                RoleId = adminRole.Id,
                ModuleId = usersModule.Id,
                Actions = ModuleAction.View | ModuleAction.Create | ModuleAction.Edit | ModuleAction.Delete
            });
            await context.SaveChangesAsync();
        }
    }
}
