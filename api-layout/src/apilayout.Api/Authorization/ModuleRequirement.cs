using Microsoft.AspNetCore.Authorization;

namespace apilayout.Api.Authorization;

public class ModuleRequirement(string module, string action) : IAuthorizationRequirement
{
    public string Module { get; } = module;
    public string Action { get; } = action;
}
