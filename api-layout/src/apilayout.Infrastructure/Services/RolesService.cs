using System.Text.Json;
using apilayout.Application.Interfaces;
using apilayout.Application.Common;
using apilayout.Application.DTOs.Roles;
using apilayout.Domain.Entities;
using apilayout.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using apilayout.Infrastructure.Data;


namespace apilayout.Infrastructure.Services;


public class RolesService(AppDbContext db, IAuditLogService auditLog, ICurrentUserContext currentUser) : IRolesService
{
    public async Task<Result<List<RolesSelectDto>>> GetActiveRolesAsync(CancellationToken ct = default)
    {
        var roles = await db.Roles.AsNoTracking()
            .Select(r => new RolesSelectDto(r.Id, r.Name))
            .ToListAsync(ct);

        return Result<List<RolesSelectDto>>.Success(roles);
    }

    public async Task<Result<List<RoleListDto>>> GetAllRolesAsync(CancellationToken ct = default)
    {
        var roles = await db.Roles.AsNoTracking()
            .Select(r => new RoleListDto(
                r.Id,
                r.Name,
                r.Description,
                r.IsActive,
                r.Users.Count()))
            .ToListAsync(ct);

        return Result<List<RoleListDto>>.Success(roles);
    }

    public async Task<Result> CreateRoleAsync(CreateRoleDto dto, CancellationToken ct = default)
    {
        var role = new Role
        {
            Name = dto.Name,
            Description = dto.Description
        };

        db.Roles.Add(role);
        await db.SaveChangesAsync(ct);

        await auditLog.LogAsync(new AuditLogEntry(
            AuditAction.Create,
            currentUser.Email ?? "unknown",
            currentUser.UserId,
            EntityName: "Role",
            EntityId: role.Id.ToString(),
            Details: JsonSerializer.Serialize(new { name = role.Name }),
            IpAddress: currentUser.IpAddress), ct);

        return Result.Success();
    }

    public async Task<Result<RoleActivitiesResponse>> GetRoleActivitiesAsync(Guid roleId, CancellationToken ct = default)
    {
        var role = await db.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == roleId, ct);

        if (role is null)
            return Result<RoleActivitiesResponse>.Failure("Rol no encontrado.");

        var usersCount = await db.Users.CountAsync(u => u.RoleId == roleId, ct);

        var roleDto = new RoleDetailDto(
            role.Id,
            role.Name,
            role.Description,
            role.IsActive,
            usersCount
        );

        // Traer todos los módulos activos del sistema
        var allModules = await db.Modules
            .AsNoTracking()
            .Where(m => m.IsActive)
            .OrderBy(m => m.Order)
            .ToListAsync(ct);

        // Traer los permisos que este rol ya tiene
        var rolePermissions = await db.Set<RoleModule>()
            .AsNoTracking()
            .Where(rm => rm.RoleId == roleId)
            .ToDictionaryAsync(rm => rm.ModuleId, rm => rm.Actions, ct);

        var modules = allModules.Select(m => new RoleModulePermissionDto(
            m.Id,
            m.Route!.TrimStart('/'),
            m.Name,
            m.Description,
            m.Icon ?? string.Empty,
            rolePermissions.TryGetValue(m.Id, out var actions) ? (int)actions : 0
        )).ToList();

        return Result<RoleActivitiesResponse>.Success(new RoleActivitiesResponse(roleDto, modules));
    }

    public async Task<Result> UpdatePermissionAsync(Guid roleId, UpdateRolePermissionDto dto, CancellationToken ct = default)
    {
        var role = await db.Roles.FindAsync([roleId], ct);
        if (role is null)
            return Result.Failure("Rol no encontrado.");

        if (role.Name.Equals("Admin", StringComparison.OrdinalIgnoreCase))
            return Result.Failure("No se pueden modificar los permisos del rol Admin.");

        var existing = await db.Set<RoleModule>()
            .FirstOrDefaultAsync(rm => rm.RoleId == roleId && rm.ModuleId == dto.ModuleId, ct);

        if (existing is not null)
        {
            if (dto.Actions == 0)
                db.Set<RoleModule>().Remove(existing);
            else
                existing.Actions = (ModuleAction)dto.Actions;
        }
        else if (dto.Actions > 0)
        {
            db.Set<RoleModule>().Add(new RoleModule
            {
                RoleId = roleId,
                ModuleId = dto.ModuleId,
                Actions = (ModuleAction)dto.Actions,
            });
        }

        await db.SaveChangesAsync(ct);
        return Result.Success();
    }

    public async Task<Result> UpdateRoleAsync(Guid roleId, UpdateRoleDto dto, CancellationToken ct = default)
    {
        var role = await db.Roles.FindAsync([roleId], ct);
        if (role is null)
            return Result.Failure("Rol no encontrado.");

        if (role.Name.Equals("Admin", StringComparison.OrdinalIgnoreCase))
            return Result.Failure("El rol Admin no puede ser modificado.");

        if (await db.Roles.AnyAsync(r => r.Name == dto.Name && r.Id != roleId, ct))
            return Result.Failure("Ya existe un rol con ese nombre.");

        role.Name = dto.Name;
        role.Description = dto.Description;
        await db.SaveChangesAsync(ct);

        await auditLog.LogAsync(new AuditLogEntry(
            AuditAction.Edit,
            currentUser.Email ?? "unknown",
            currentUser.UserId,
            EntityName: "Role",
            EntityId: role.Id.ToString(),
            Details: JsonSerializer.Serialize(new { name = role.Name }),
            IpAddress: currentUser.IpAddress), ct);

        return Result.Success();
    }

    public async Task<Result> DeleteRoleAsync(Guid roleId, CancellationToken ct = default)
    {
        var role = await db.Roles.FindAsync([roleId], ct);
        if (role is null)
            return Result.Failure("Rol no encontrado.");

        if (role.Name.Equals("Admin", StringComparison.OrdinalIgnoreCase))
            return Result.Failure("El rol Admin no puede ser eliminado.");

        if (await db.Users.AnyAsync(u => u.RoleId == roleId, ct))
            return Result.Failure("No se puede eliminar un rol que tiene usuarios asignados.");

        role.IsDeleted = true;
        role.DeletedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        await auditLog.LogAsync(new AuditLogEntry(
            AuditAction.Delete,
            currentUser.Email ?? "unknown",
            currentUser.UserId,
            EntityName: "Role",
            EntityId: roleId.ToString(),
            Details: JsonSerializer.Serialize(new { name = role.Name }),
            IpAddress: currentUser.IpAddress), ct);

        return Result.Success();
    }
}

