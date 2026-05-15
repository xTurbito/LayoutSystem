namespace apilayout.Application.DTOs.Auth;

public record LoginResponse(
    string Token,
    DateTime ExpiresAt,
    string RefreshToken,
    DateTime RefreshTokenExpiresAt,
    Guid UserId,
    string Name,
    string Email,
    string Role,
    List<ModulePermissionDto> Modules);
