namespace apilayout.Application.DTOs.Roles;

public class CreateRoleDto
{
    public required string Name { get; set; }

    public string? Description { get; set; }
}