using System.Net.Http.Json;
using Proyecto1.Services.Interfaces;

namespace Proyecto1.Services
{
    public class ApiClientService : IApiClientService
    {
        private readonly HttpClient _httpClient;

        public ApiClientService(
    HttpClient httpClient,
    IConfiguration configuration)
        {
            _httpClient = httpClient;

            string? apiKey = configuration["ApiSettings:ApiKey"];

            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException(
                    "No se ha configurado el token de acceso a la API."
                );
            }

            _httpClient.DefaultRequestHeaders.TryAddWithoutValidation(
                "X-API-KEY", apiKey);
        }

        // GET
        public Task<HttpResponseMessage> GetAsync(
            string endpoint,
            CancellationToken cancellationToken = default)
        {
            ValidarEndpoint(endpoint);

            return _httpClient.GetAsync(endpoint, cancellationToken);
        }

        // POST
        public Task<HttpResponseMessage> PostAsync<T>(
            string endpoint,
            T data,
            CancellationToken cancellationToken = default)
        {
            ValidarEndpoint(endpoint);

            return _httpClient.PostAsJsonAsync(
                endpoint,
                data,
                cancellationToken
            );
        }

        // PUT
        public Task<HttpResponseMessage> PutAsync<T>(
            string endpoint,
            T data,
            CancellationToken cancellationToken = default)
        {
            ValidarEndpoint(endpoint);

            return _httpClient.PutAsJsonAsync(
                endpoint,
                data,
                cancellationToken
            );
        }

        // DELETE
        public Task<HttpResponseMessage> DeleteAsync(
            string endpoint,
            CancellationToken cancellationToken = default)
        {
            ValidarEndpoint(endpoint);

            return _httpClient.DeleteAsync(
                endpoint,
                cancellationToken
            );
        }

        // VALIDAR ENDPOINT
        private static void ValidarEndpoint(string endpoint)
        {
            if (string.IsNullOrWhiteSpace(endpoint))
            {
                throw new ArgumentException(
                    "El endpoint no puede estar vacío."
                );
            }

            if (Uri.TryCreate(endpoint, UriKind.Absolute, out _))
            {
                throw new ArgumentException(
                    "Solo se permiten endpoints relativos."
                );
            }
        }

        // PATCH
        public async Task<HttpResponseMessage> PatchAsync<T>(
            string endpoint,
            T data,
            CancellationToken cancellationToken = default)
        {
            ValidarEndpoint(endpoint);

            using var request = new HttpRequestMessage(
                HttpMethod.Patch,
                endpoint
            )
            {
                Content = JsonContent.Create(data)
            };

            return await _httpClient.SendAsync(
                request,
                cancellationToken
            );
        }
    }
}

