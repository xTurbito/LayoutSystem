using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace apilayout.Application.DependencyInjection;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Registra todos los validators del ensamblado de Application automáticamente.
        // Cuando agregues un validator nuevo, no necesitas registrarlo aquí manualmente.
        services.AddValidatorsFromAssemblyContaining<ApplicationAssemblyMarker>();

        return services;
    }
}

// Clase vacía que sirve como "anchor" para localizar el ensamblado de Application.
// Más limpio que usar typeof(AlgunaClaseAleatoria).
internal sealed class ApplicationAssemblyMarker;
