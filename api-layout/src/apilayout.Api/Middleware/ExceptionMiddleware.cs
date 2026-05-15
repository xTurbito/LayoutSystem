using System.Text.Json;

namespace apilayout.Api.Middleware;

public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);
            await WriteErrorResponseAsync(context);
        }
    }

    private static Task WriteErrorResponseAsync(HttpContext context)
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        var body = JsonSerializer.Serialize(new
        {
            message = "Ocurrió un error inesperado.",
            code = "INTERNAL_SERVER_ERROR"
        });

        return context.Response.WriteAsync(body);
    }
}
