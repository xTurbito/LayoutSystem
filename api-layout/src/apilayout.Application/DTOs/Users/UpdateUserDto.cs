namespace apilayout.Application.DTOs.Users;

public class UpdateUserDto
{
    public required string Name { get; set; }
    public required string Email { get; set; }
    public required Guid RoleId { get; set; }

    public string? Password { get; set; }

    public bool IsActive {get; set;}
}
