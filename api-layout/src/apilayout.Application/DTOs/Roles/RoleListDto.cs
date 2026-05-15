namespace apilayout.Application.DTOs.Roles;

public record RoleListDto(
    Guid Id,
    string Name,
    string? Description,
    bool IsActive,
    int UsersCount
);