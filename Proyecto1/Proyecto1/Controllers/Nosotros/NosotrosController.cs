
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Proyecto1.Services.Interfaces;
using System.Text.Json;

// Agrega aquí el using donde está declarado IApiClientService.

namespace Proyecto1.Controllers.Nosotros
{
    [Authorize]
    [Route("[controller]/[action]")]
    public class NosotrosController : Controller
    {
        private readonly IApiClientService _apiClient;

        public NosotrosController(IApiClientService apiClient)
        {
            _apiClient = apiClient;
        }

        [HttpGet]
        public IActionResult Nosotros()
        {
            return View("~/Views/Nosotros/Nosotros.cshtml");
        }
        // =====================================================
        // 1. LISTAR NOSOTROS
        // =====================================================

        [HttpGet]
        public async Task<IActionResult> Listar(
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.GetAsync(
                "api/Nosotros",
                cancellationToken);

            return await ProcesarRespuesta(respuesta, cancellationToken);
        }

        // =====================================================
        // 2. REGISTRAR NOSOTROS
        // =====================================================

        [HttpPost]
        public async Task<IActionResult> Registrar(
            [FromBody] JsonElement model,
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.PostAsync(
                "api/Nosotros",
                model,
                cancellationToken);

            return await ProcesarRespuesta(respuesta, cancellationToken);
        }

        // =====================================================
        // 3. EDITAR NOSOTROS
        // =====================================================

        [HttpPut("{id}")]
        public async Task<IActionResult> Editar(
            int id,
            [FromBody] JsonElement model,
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.PutAsync(
                $"api/Nosotros/{id}",
                model,
                cancellationToken);

            return await ProcesarRespuesta(respuesta, cancellationToken);
        }

        // =====================================================
        // 4. ELIMINAR NOSOTROS
        // =====================================================

        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(
            int id,
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.DeleteAsync(
                $"api/Nosotros/{id}",
                cancellationToken);

            return await ProcesarRespuesta(respuesta, cancellationToken);
        }

        // =====================================================
        // 5. PROCESAR RESPUESTAS DE LA API
        // =====================================================

        private static async Task<IActionResult> ProcesarRespuesta(
            HttpResponseMessage respuesta,
            CancellationToken cancellationToken)
        {
            var contenido = await respuesta.Content.ReadAsStringAsync(
                cancellationToken);

            return new ContentResult
            {
                Content = contenido,
                ContentType = "application/json; charset=utf-8",
                StatusCode = (int)respuesta.StatusCode
            };
        }

        // =====================================================
        // 1.1. LISTAR NOSOTROS PÚBLICOS
        // =====================================================

        // =====================================================
        // 1.1. LISTAR NOSOTROS PÚBLICOS
        // =====================================================

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> ListarPublicos(
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.GetAsync(
                "api/Nosotros/publicos",
                cancellationToken);

            return await ProcesarRespuesta(respuesta, cancellationToken);
        }
    }
}
