namespace apilayout.Application.DTOs.Users;
public record UserListDto(
    Guid Id,
    string Name,
    string Email,
    string Role,
    bool IsActive
);