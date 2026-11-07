
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Proyecto1.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;

namespace Proyecto1.Controllers.Servicios
{
    [Authorize]
    public class ServiciosController : Controller
    {
        private readonly IApiClientService _apiClient;

        public ServiciosController(IApiClientService apiClient)
        {
            _apiClient = apiClient;
        }

        // Mostrar la vista de administración
        [HttpGet]
        public IActionResult Servicios()
        {
            return View();
        }

        // Obtener servicios desde la API
        [HttpGet]
        public async Task<IActionResult> Listar(
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.GetAsync(
                "api/Servicios",
                cancellationToken
            );

            var contenido = await respuesta.Content.ReadAsStringAsync(
                cancellationToken
            );

            return new ContentResult
            {
                Content = contenido,
                ContentType = "application/json; charset=utf-8",
                StatusCode = (int)respuesta.StatusCode
            };
        }


        // ==========================================
        // LISTAR SERVICIOS PÚBLICOS
        // ==========================================

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> ListarPublicos(
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.GetAsync(
                "api/Servicios/publicos",
                cancellationToken
            );

            var contenido = await respuesta.Content.ReadAsStringAsync(
                cancellationToken
            );

            return new ContentResult
            {
                Content = contenido,
                ContentType = "application/json; charset=utf-8",
                StatusCode = (int)respuesta.StatusCode
            };
        }


        // ==========================================
        // REGISTRAR SERVICIO
        // ==========================================

        [HttpPost]
        public async Task<IActionResult> Registrar(
            [FromBody] JsonElement model,
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.PostAsync(
                "api/Servicios",
                model,
                cancellationToken
            );

            var contenido = await respuesta.Content.ReadAsStringAsync(
                cancellationToken
            );

            return new ContentResult
            {
                Content = contenido,
                ContentType = "application/json; charset=utf-8",
                StatusCode = (int)respuesta.StatusCode
            };
        }

        // ==========================================
        // EDITAR SERVICIO
        // ==========================================

        [HttpPut]
        public async Task<IActionResult> Editar(
            int id,
            [FromBody] JsonElement model,
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.PutAsync(
                $"api/Servicios/{id}",
                model,
                cancellationToken
            );

            var contenido = await respuesta.Content.ReadAsStringAsync(
                cancellationToken
            );

            return new ContentResult
            {
                Content = contenido,
                ContentType = "application/json; charset=utf-8",
                StatusCode = (int)respuesta.StatusCode
            };
        }

        // ==========================================
        // ELIMINAR SERVICIO
        // ==========================================

        [HttpDelete]
        public async Task<IActionResult> Eliminar(
            int id,
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.DeleteAsync(
                $"api/Servicios/{id}",
                cancellationToken
            );

            var contenido = await respuesta.Content.ReadAsStringAsync(
                cancellationToken
            );

            return new ContentResult
            {
                Content = contenido,
                ContentType = "application/json; charset=utf-8",
                StatusCode = (int)respuesta.StatusCode
            };
        }
    }
}
