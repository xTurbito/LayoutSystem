using apilayout.Domain.Common;

namespace apilayout.Domain.Entities;

public class Module : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? Route { get; set; }
    public int Order { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<RoleModule> RoleModules { get; set; } = [];
}
