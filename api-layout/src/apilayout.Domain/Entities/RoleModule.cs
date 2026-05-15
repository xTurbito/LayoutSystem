using apilayout.Domain.Enums;

namespace apilayout.Domain.Entities;

public class RoleModule
{
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;

    public Guid ModuleId { get; set; }
    public Module Module { get; set; } = null!;

    public ModuleAction Actions { get; set; } = ModuleAction.None;
}
