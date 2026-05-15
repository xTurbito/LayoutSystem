using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using apilayout.Application.Common;
using apilayout.Application.DTOs.Auth;
using apilayout.Application.Interfaces;
using apilayout.Domain.Entities;
using apilayout.Domain.Enums;
using apilayout.Infrastructure.Data;
using apilayout.Infrastructure.Options;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace apilayout.Infrastructure.Services;

public class AuthService(
    AppDbContext db,
    IOptions<JwtOptions> jwtOptions,
    IAuditLogService auditLog,
    ICurrentUserContext currentUser) : IAuthService
{
    private readonly JwtOptions _jwt = jwtOptions.Value;

    public async Task<Result<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var ip = currentUser.IpAddress;

        var user = await db.Users
            .AsNoTracking()
            .Include(u => u.Role)
                .ThenInclude(r => r.RoleModules)
                    .ThenInclude(rm => rm.Module)
            .FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive, ct);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            await auditLog.LogAsync(new AuditLogEntry(
                AuditAction.Login,
                request.Email,
                user?.Id,
                Details: """{"success":false}""",
                IpAddress: ip), ct);

            return Result<LoginResponse>.Failure("Credenciales inválidas.", "INVALID_CREDENTIALS");
        }

        await auditLog.LogAsync(new AuditLogEntry(
            AuditAction.Login,
            user.Email,
            user.Id,
            IpAddress: ip), ct);

        var modules = BuildModules(user);
        var (accessToken, expiresAt) = GenerateAccessToken(user, modules);
        var (refreshTokenEntity, rawRefreshToken) = await CreateRefreshTokenAsync(user.Id, ct);

        return Result<LoginResponse>.Success(BuildResponse(accessToken, expiresAt, rawRefreshToken, refreshTokenEntity.ExpiresAt, user, modules));
    }

    public async Task<Result<LoginResponse>> RefreshAsync(string refreshToken, CancellationToken ct = default)
    {
        var hashedToken = HashToken(refreshToken);

        var existing = await db.RefreshTokens
            .Include(rt => rt.User)
                .ThenInclude(u => u.Role)
                    .ThenInclude(r => r.RoleModules)
                        .ThenInclude(rm => rm.Module)
            .AsNoTracking()
            .FirstOrDefaultAsync(rt => rt.Token == hashedToken, ct);

        if (existing is null || !existing.IsActive || !existing.User.IsActive)
            return Result<LoginResponse>.Failure("Refresh token inválido o expirado.", "INVALID_REFRESH_TOKEN");

        // Atomic CAS: if two concurrent requests arrive with the same token, only one revokes it.
        // The second gets rowsAffected == 0 and fails, preventing token reuse.
        var revoked = await db.RefreshTokens
            .Where(rt => rt.Id == existing.Id && rt.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(rt => rt.RevokedAt, DateTime.UtcNow), ct);

        if (revoked == 0)
            return Result<LoginResponse>.Failure("Refresh token inválido o expirado.", "INVALID_REFRESH_TOKEN");

        var modules = BuildModules(existing.User);
        var (accessToken, expiresAt) = GenerateAccessToken(existing.User, modules);
        var (newRefreshTokenEntity, rawNewToken) = await CreateRefreshTokenAsync(existing.User.Id, ct);

        return Result<LoginResponse>.Success(BuildResponse(accessToken, expiresAt, rawNewToken, newRefreshTokenEntity.ExpiresAt, existing.User, modules));
    }

    public async Task<Result> LogoutAsync(string refreshToken, CancellationToken ct = default)
    {
        var hashedToken = HashToken(refreshToken);

        var existing = await db.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == hashedToken, ct);

        if (existing is null || existing.RevokedAt is not null)
            return Result.Success();

        existing.RevokedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        await auditLog.LogAsync(new AuditLogEntry(
            AuditAction.Logout,
            existing.User.Email,
            existing.UserId,
            IpAddress: currentUser.IpAddress), ct);

        return Result.Success();
    }

    private async Task<(RefreshToken entity, string rawToken)> CreateRefreshTokenAsync(Guid userId, CancellationToken ct)
    {
        await db.RefreshTokens
            .Where(rt => rt.UserId == userId && (rt.RevokedAt != null || rt.ExpiresAt < DateTime.UtcNow))
            .ExecuteDeleteAsync(ct);

        var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        var refreshToken = new RefreshToken
        {
            UserId = userId,
            Token = HashToken(rawToken),
            ExpiresAt = DateTime.UtcNow.AddDays(_jwt.RefreshExpiresInDays)
        };

        db.RefreshTokens.Add(refreshToken);
        await db.SaveChangesAsync(ct);

        return (refreshToken, rawToken);
    }

    private static string HashToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    private (string token, DateTime expiresAt) GenerateAccessToken(User user, List<ModulePermissionDto> modules)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwt.ExpiresInMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new("name", user.Name),
            new("role", user.Role.Name),
            new("modules", JsonSerializer.Serialize(modules))
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _jwt.Issuer,
            audience: _jwt.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    private static List<ModulePermissionDto> BuildModules(User user) =>
        user.Role.RoleModules
            .Where(rm => rm.Module.IsActive)
            .OrderBy(rm => rm.Module.Order)
            .Select(rm => new ModulePermissionDto(
                rm.Module.Name,
                rm.Module.Icon,
                rm.Module.Route,
                rm.Module.Order,
                GetActionNames(rm.Actions)))
            .ToList();

    private static LoginResponse BuildResponse(
        string accessToken, DateTime expiresAt,
        string rawRefreshToken, DateTime refreshTokenExpiresAt,
        User user, List<ModulePermissionDto> modules) =>
        new(
            Token: accessToken,
            ExpiresAt: expiresAt,
            RefreshToken: rawRefreshToken,
            RefreshTokenExpiresAt: refreshTokenExpiresAt,
            UserId: user.Id,
            Name: user.Name,
            Email: user.Email,
            Role: user.Role.Name,
            Modules: modules);

    private static string[] GetActionNames(ModuleAction actions) =>
        Enum.GetValues<ModuleAction>()
            .Where(a => a != ModuleAction.None && actions.HasFlag(a))
            .Select(a => a.ToString())
            .ToArray();
}
