namespace apilayout.Application.DTOs.Roles;

public class UpdateRolePermissionDto
{
    public required Guid ModuleId { get; set; }
    public required int Actions { get; set; }
}
