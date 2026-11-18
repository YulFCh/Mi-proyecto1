
using System.Security.Cryptography;
using System.Text;

namespace ApiProyecto1.Middleware
{
    public class ApiKeyMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly byte[] _apiKey;

        public ApiKeyMiddleware(
            RequestDelegate next,
            IConfiguration configuration)
        {
            _next = next;

            string? apiKey = configuration["ApiSettings:ApiKey"];

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException(
                    "No se ha configurado el token de acceso a la API."
                );
            }

            _apiKey = Encoding.UTF8.GetBytes(apiKey);
        }

        public async Task InvokeAsync(HttpContext context)
        {
            string path = context.Request.Path.Value ?? "";

            // Permitir Swagger.
            if (path.StartsWith(
                "/swagger",
                StringComparison.OrdinalIgnoreCase))
            {
                await _next(context);
                return;
            }

            // Permitir solicitudes CORS preliminares.
            if (HttpMethods.IsOptions(context.Request.Method))
            {
                await _next(context);
                return;
            }

            string? token = context.Request.Headers["X-API-KEY"]
                .FirstOrDefault();

            if (string.IsNullOrWhiteSpace(token))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";

                await context.Response.WriteAsync(
                    "{\"success\":false,\"message\":\"Token de acceso requerido.\"}"
                );

                return;
            }

            byte[] tokenBytes = Encoding.UTF8.GetBytes(token);

            if (!CryptographicOperations.FixedTimeEquals(
                _apiKey,
                tokenBytes))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";

                await context.Response.WriteAsync(
                    "{\"success\":false,\"message\":\"Token de acceso inválido.\"}"
                );

                return;
            }

            await _next(context);
        }
    }
}
