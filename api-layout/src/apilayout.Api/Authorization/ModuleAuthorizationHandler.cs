using System.Text.Json;
using apilayout.Application.DTOs.Auth;
using Microsoft.AspNetCore.Authorization;

namespace apilayout.Api.Authorization;

public class ModuleAuthorizationHandler : AuthorizationHandler<ModuleRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ModuleRequirement requirement)
    {
        var modulesClaim = context.User.FindFirst("modules")?.Value;
        if (modulesClaim is null)
            return Task.CompletedTask;

        List<ModulePermissionDto>? modules;
        try { modules = JsonSerializer.Deserialize<List<ModulePermissionDto>>(modulesClaim); }
        catch { return Task.CompletedTask; }

        var module = modules?.FirstOrDefault(m =>
            m.Name.Equals(requirement.Module, StringComparison.OrdinalIgnoreCase));

        if (module is not null && module.Actions.Contains(requirement.Action, StringComparer.OrdinalIgnoreCase))
            context.Succeed(requirement);

        return Task.CompletedTask;
    }
}
