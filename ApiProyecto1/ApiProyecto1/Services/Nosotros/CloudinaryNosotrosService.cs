
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace ApiProyecto1.Services.Nosotros
{
    public class CloudinaryNosotrosService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public CloudinaryNosotrosService(
            HttpClient httpClient,
            IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<bool> EliminarImagenAsync(
            string publicId,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(publicId))
                return false;

            string cloudName = _configuration["Cloudinary:CloudName"]!;
            string apiKey = _configuration["Cloudinary:ApiKey"]!;
            string apiSecret = _configuration["Cloudinary:ApiSecret"]!;

            if (string.IsNullOrWhiteSpace(cloudName) ||
                string.IsNullOrWhiteSpace(apiKey) ||
                string.IsNullOrWhiteSpace(apiSecret))
            {
                throw new InvalidOperationException(
                    "La configuración de Cloudinary está incompleta.");
            }

            string timestamp = DateTimeOffset.UtcNow
                .ToUnixTimeSeconds()
                .ToString();

            string cadenaFirma =
                $"invalidate=true&public_id={publicId}&timestamp={timestamp}{apiSecret}";

            using var sha1 = SHA1.Create();

            byte[] hash = sha1.ComputeHash(
                Encoding.UTF8.GetBytes(cadenaFirma));

            string signature = Convert.ToHexString(hash)
                .ToLowerInvariant();

            var datos = new Dictionary<string, string>
            {
                ["public_id"] = publicId,
                ["timestamp"] = timestamp,
                ["invalidate"] = "true",
                ["api_key"] = apiKey,
                ["signature"] = signature
            };

            using var contenido = new FormUrlEncodedContent(datos);

            string url =
                $"https://api.cloudinary.com/v1_1/{cloudName}/image/destroy";

            using var respuesta = await _httpClient.PostAsync(
                url,
                contenido,
                cancellationToken);

            string resultado = await respuesta.Content.ReadAsStringAsync(
                cancellationToken);

            if (!respuesta.IsSuccessStatusCode)
            {
                throw new InvalidOperationException(
                    $"Error al eliminar imagen de Cloudinary: {resultado}");
            }

            using var documento = JsonDocument.Parse(resultado);

            if (documento.RootElement.TryGetProperty(
                "result", out var propiedadResultado))
            {
                string? estado = propiedadResultado.GetString();

                return estado == "ok" || estado == "not found";
            }

            throw new InvalidOperationException(
                $"Cloudinary devolvió una respuesta inesperada: {resultado}");
        }
    }
}
