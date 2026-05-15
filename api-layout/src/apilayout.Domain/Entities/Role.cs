using apilayout.Domain.Common;

namespace apilayout.Domain.Entities;

public class Role : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<User> Users { get; set; } = [];
    public ICollection<RoleModule> RoleModules { get; set; } = [];
}
