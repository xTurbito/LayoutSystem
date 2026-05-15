using System.Text;
using apilayout.Api.Authorization;
using apilayout.Api.Middleware;
using apilayout.Application.DependencyInjection;
using apilayout.Infrastructure.Data;
using apilayout.Infrastructure.DependencyInjection;
using apilayout.Infrastructure.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Scalar.AspNetCore;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((ctx, services, config) =>
        config
            .ReadFrom.Configuration(ctx.Configuration)
            .ReadFrom.Services(services)
            .WriteTo.Console()
            .WriteTo.File(
                path: "logs/log-.txt",
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 30,
                restrictedToMinimumLevel: Serilog.Events.LogEventLevel.Error));

    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);
    builder.Services.AddControllers();

    builder.Services.AddOpenApi(options =>
    {
        options.AddDocumentTransformer((doc, context, ct) =>
         {
             doc.Info.Title = "LayoutSystem API";
             doc.Info.Version = "v1";
             doc.Info.Description = "Base template API — Clean Architecture + JWT Auth";
             return Task.CompletedTask;
         });

        options.AddDocumentTransformer<BearerSecuritySchemeTransformer>();
    });


    var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()!;
    if (!builder.Environment.IsDevelopment())
    {
        if (string.IsNullOrWhiteSpace(jwtOptions.Key) || jwtOptions.Key == "REPLACE_WITH_SECRET_MIN_32_CHARS" || jwtOptions.Key.Length < 32)
            throw new InvalidOperationException("Jwt:Key must be a secure secret of at least 32 characters. Set it via environment variable or user secrets.");
    }

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtOptions.Issuer,
                ValidAudience = jwtOptions.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key))
            };
        });

    builder.Services.AddAuthorization();

    builder.Services.AddRateLimiter(options =>
    {
        var loginWindow = builder.Configuration.GetValue<int>("RateLimit:LoginWindowSeconds");
        var loginMaxReqs = builder.Configuration.GetValue<int>("RateLimit:LoginMaxRequests");
        var refreshWindow = builder.Configuration.GetValue<int>("RateLimit:RefreshWindowSeconds");
        var refreshMaxReqs = builder.Configuration.GetValue<int>("RateLimit:RefreshMaxRequests");

        options.AddFixedWindowLimiter("login", opt =>
        {
            opt.Window = TimeSpan.FromSeconds(loginWindow > 0 ? loginWindow : 60);
            opt.PermitLimit = loginMaxReqs > 0 ? loginMaxReqs : 5;
            opt.QueueLimit = 0;
            opt.AutoReplenishment = true;
        });

        options.AddFixedWindowLimiter("refresh", opt =>
        {
            opt.Window = TimeSpan.FromSeconds(refreshWindow > 0 ? refreshWindow : 60);
            opt.PermitLimit = refreshMaxReqs > 0 ? refreshMaxReqs : 20;
            opt.QueueLimit = 0;
            opt.AutoReplenishment = true;
        });

        options.OnRejected = async (context, token) =>
        {
            context.HttpContext.Response.StatusCode = 429;
            await context.HttpContext.Response.WriteAsJsonAsync(
                new { message = "Demasiados intentos. Intenta de nuevo en un momento." }, token);
        };
    });


    builder.Services.AddSingleton<IAuthorizationPolicyProvider, ModuleAuthorizationPolicyProvider>();
    builder.Services.AddScoped<IAuthorizationHandler, ModuleAuthorizationHandler>();

    var allowedOrigins = builder.Configuration
        .GetSection("Cors:AllowedOrigins")
        .Get<string[]>()!;

    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
        {
            policy.WithOrigins(allowedOrigins)
                  .WithHeaders("Content-Type", "Authorization")
                  .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE")
                  .AllowCredentials();
        });
    });

    var app = builder.Build();

    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await DbSeeder.SeedAsync(db);
    }

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
        app.MapScalarApiReference(options =>
        {
            options.Title = "LayoutSystem API";
            options.Theme = ScalarTheme.DeepSpace;
        });
    }


    app.UseForwardedHeaders(new ForwardedHeadersOptions
    {
        ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
    });
    app.UseHttpsRedirection();
    app.Use(async (ctx, next) =>
    {
        ctx.Response.Headers.Append("X-Content-Type-Options", "nosniff");
        ctx.Response.Headers.Append("X-Frame-Options", "DENY");
        ctx.Response.Headers.Append("Referrer-Policy", "no-referrer");
        await next();
    });
    app.UseMiddleware<ExceptionMiddleware>();
    app.UseCors();
    app.UseRateLimiter();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    await Log.CloseAndFlushAsync();
}
