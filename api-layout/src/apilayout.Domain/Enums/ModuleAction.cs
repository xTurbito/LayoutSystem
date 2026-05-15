namespace apilayout.Domain.Enums;

[Flags]
public enum ModuleAction
{
    None   = 0,
    View   = 1 << 0,  // 1
    Create = 1 << 1,  // 2
    Edit   = 1 << 2,  // 4
    Delete = 1 << 3,  // 8
    Export = 1 << 4,  // 16
}

