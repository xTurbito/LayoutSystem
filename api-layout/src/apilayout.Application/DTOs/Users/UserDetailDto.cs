namespace apilayout.Application.DTOs.Users;


public record UserDetailDto(
    Guid Id,
    string Name,
    string Email,
    bool IsActive,
    Guid RoleId
);