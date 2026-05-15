using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace apilayout.Api.Authorization;

public class ModuleAuthorizationPolicyProvider(IOptions<AuthorizationOptions> options)
    : DefaultAuthorizationPolicyProvider(options)
{
    public override async Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        var policy = await base.GetPolicyAsync(policyName);
        if (policy is not null)
            return policy;

        var parts = policyName.Split('.');
        if (parts.Length != 2)
            return null;

        return new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .AddRequirements(new ModuleRequirement(parts[0], parts[1]))
            .Build();
    }
}
