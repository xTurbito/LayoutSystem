using System.Text.Json;
using apilayout.Application.Interfaces;
using apilayout.Application.Common;
using apilayout.Application.DTOs.Users;
using apilayout.Domain.Entities;
using apilayout.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using apilayout.Infrastructure.Data;

namespace apilayout.Infrastructure.Services;

public class UserService(AppDbContext db, IAuditLogService auditLog, ICurrentUserContext currentUser) : IUserService
{

    public async Task<Result<PagedResult<UserListDto>>> GetUsersAsync(int page, int pageSize, string? search = null, bool? isActive = null, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        IQueryable<User> query = db.Users.AsNoTracking().Include(u => u.Role);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(u => EF.Functions.Like(u.Name, $"%{search}%") ||
                                     EF.Functions.Like(u.Email, $"%{search}%"));

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        var totalCount = await query.CountAsync(ct);

        var items = await query
            .OrderBy(u => u.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserListDto(
                u.Id,
                u.Name,
                u.Email,
                u.Role.Name,
                u.IsActive))
            .ToListAsync(ct);

        return Result<PagedResult<UserListDto>>.Success(new PagedResult<UserListDto>(items, totalCount, page, pageSize));
    }

    public async Task<Result> CreateUserAsync(CreateUserDto dto, CancellationToken ct = default)
    {
        if (!await db.Roles.AnyAsync(r => r.Id == dto.RoleId, ct))
            return Result.Failure("El rol especificado no existe.");

        if (await db.Users.AnyAsync(u => u.Email == dto.Email, ct))
            return Result.Failure("Email ya está en uso.");

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            RoleId = dto.RoleId,
            IsActive = true
        };

        db.Users.Add(user);
        await db.SaveChangesAsync(ct);

        await auditLog.LogAsync(new AuditLogEntry(
            AuditAction.Create,
            currentUser.Email ?? "unknown",
            currentUser.UserId,
            EntityName: "User",
            EntityId: user.Id.ToString(),
            Details: JsonSerializer.Serialize(new { name = user.Name, email = user.Email }),
            IpAddress: currentUser.IpAddress), ct);

        return Result.Success();
    }

    public async Task<Result<UserDetailDto>> GetUserByIdAsync(Guid id, CancellationToken ct = default)
    {
        var user = await db.Users.AsNoTracking().Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user == null)
            return Result<UserDetailDto>.Failure("Usuario no encontrado.");

        var dto = new UserDetailDto(
            user.Id,
            user.Name,
            user.Email,
            user.IsActive,
            user.Role.Id
        );

        return Result<UserDetailDto>.Success(dto);
    }

    public async Task<Result> UpdateUserAsync(Guid id, UpdateUserDto dto, CancellationToken ct = default)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user == null)
            return Result.Failure("Usuario no encontrado.");

        if (!await db.Roles.AnyAsync(r => r.Id == dto.RoleId, ct))
            return Result.Failure("El rol especificado no existe.");

        if (await db.Users.AnyAsync(u => u.Email == dto.Email && u.Id != id, ct))
            return Result.Failure("El Email ya está en uso por otro usuario.");

        user.Name = dto.Name;
        user.Email = dto.Email;
        user.RoleId = dto.RoleId;
        user.IsActive = dto.IsActive;

        if (!string.IsNullOrWhiteSpace(dto.Password))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        await db.SaveChangesAsync(ct);

        await auditLog.LogAsync(new AuditLogEntry(
            AuditAction.Edit,
            currentUser.Email ?? "unknown",
            currentUser.UserId,
            EntityName: "User",
            EntityId: id.ToString(),
            Details: JsonSerializer.Serialize(new { name = user.Name, email = user.Email }),
            IpAddress: currentUser.IpAddress), ct);

        return Result.Success();
    }

    public async Task<Result> UpdateProfileAsync(Guid id, UpdateProfileDto dto, CancellationToken ct = default)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user == null)
            return Result.Failure("Usuario no encontrado.");

        if (await db.Users.AnyAsync(u => u.Email == dto.Email && u.Id != id, ct))
            return Result.Failure("El email ya está en uso por otro usuario.");

        user.Name = dto.Name;
        user.Email = dto.Email;
        await db.SaveChangesAsync(ct);

        await auditLog.LogAsync(new AuditLogEntry(
            AuditAction.Edit,
            currentUser.Email ?? "unknown",
            currentUser.UserId,
            EntityName: "User",
            EntityId: id.ToString(),
            Details: JsonSerializer.Serialize(new { name = user.Name, email = user.Email }),
            IpAddress: currentUser.IpAddress), ct);

        return Result.Success();
    }

    public async Task<Result> ChangePasswordAsync(Guid id, ChangePasswordDto dto, CancellationToken ct = default)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);
        if (user == null)
            return Result.Failure("Usuario no encontrado.");

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            return Result.Failure("La contraseña actual es incorrecta.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await db.SaveChangesAsync(ct);

        await auditLog.LogAsync(new AuditLogEntry(
            AuditAction.Edit,
            currentUser.Email ?? "unknown",
            currentUser.UserId,
            EntityName: "User",
            EntityId: id.ToString(),
            Details: "{\"action\":\"change_password\"}",
            IpAddress: currentUser.IpAddress), ct);

        return Result.Success();
    }
}
