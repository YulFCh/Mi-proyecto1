using System.Net.Http;

namespace Proyecto1.Services.Interfaces
{
    public interface IApiClientService
    {
        Task<HttpResponseMessage> GetAsync(
            string endpoint,
            CancellationToken cancellationToken = default
        );

        Task<HttpResponseMessage> PostAsync<T>(
            string endpoint,
            T data,
            CancellationToken cancellationToken = default
        );

        Task<HttpResponseMessage> PutAsync<T>(
            string endpoint,
            T data,
            CancellationToken cancellationToken = default
        );

        Task<HttpResponseMessage> DeleteAsync(
            string endpoint,
            CancellationToken cancellationToken = default
        );
    }
}
