using System.Security.Claims;
using apilayout.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace apilayout.Infrastructure.Services;

public class CurrentUserContext(IHttpContextAccessor httpContextAccessor) : ICurrentUserContext
{
    public string? Email =>
        httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Email)
        ?? httpContextAccessor.HttpContext?.User.FindFirstValue("email");

    public Guid? UserId
    {
        get
        {
            var idStr = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? httpContextAccessor.HttpContext?.User.FindFirstValue("sub");
            return Guid.TryParse(idStr, out var id) ? id : null;
        }
    }

    public string? IpAddress =>
        httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
}
