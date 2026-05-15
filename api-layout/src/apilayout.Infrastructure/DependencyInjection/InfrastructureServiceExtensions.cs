using apilayout.Application.Interfaces;
using apilayout.Infrastructure.Data;
using apilayout.Infrastructure.Options;
using apilayout.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace apilayout.Infrastructure.DependencyInjection;

public static class InfrastructureServiceExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Default")));

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.AddHttpContextAccessor();
        services.AddScoped<IAuditLogService, AuditLogService>();
        services.AddScoped<ICurrentUserContext, CurrentUserContext>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IRolesService, RolesService>();

        return services;
    }
}
