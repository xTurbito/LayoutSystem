namespace apilayout.Application.DTOs.Users;

public record CreateUserDto(
    string Name,
    string Email,
    string Password,
    Guid RoleId
);