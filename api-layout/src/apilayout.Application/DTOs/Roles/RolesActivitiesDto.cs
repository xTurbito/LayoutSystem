using apilayout.Domain.Entities;

namespace apilayout.Application.DTOs.Roles;


public record RoleActivitiesResponse(
    RoleDetailDto Role,
    IEnumerable<RoleModulePermissionDto> Modules
);

public record RoleDetailDto(
    Guid Id,
    string Name,
    string? Description,
    bool IsActive,
    int UserCount
);

public record RoleModulePermissionDto(
    Guid Id,
    string Key,
    string Name,
    string? Description,
    string Icon,
    int Actions
);