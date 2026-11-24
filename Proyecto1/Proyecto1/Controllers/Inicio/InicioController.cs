
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Proyecto1.Services.Interfaces;
using System.Text.Json;

namespace Proyecto1.Controllers
{
    public class InicioController : Controller
    {
        private readonly IApiClientService _apiClient;

        public InicioController(IApiClientService apiClient)
        {
            _apiClient = apiClient;
        }

        // ==========================================
        // MOSTRAR PÁGINA DE INICIO
        // ==========================================

        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        // ==========================================
        // LISTAR PROMOCIONES DEL CARRUSEL
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> ListarPromociones(
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.GetAsync(
                "api/Carrusel",
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
        // OBTENER PROMOCIÓN POR ID
        // ==========================================

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> ObtenerPromocion(
            int id,
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.GetAsync(
                $"api/Carrusel/{id}",
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
        // REGISTRAR PROMOCIÓN
        // ==========================================

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> RegistrarPromocion(
            [FromBody] JsonElement model,
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.PostAsync(
                "api/Carrusel",
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
        // ACTUALIZAR PROMOCIÓN
        // ==========================================

        [Authorize]
        [HttpPut]
        public async Task<IActionResult> ActualizarPromocion(
            int id,
            [FromBody] JsonElement model,
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.PutAsync(
                $"api/Carrusel/{id}",
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
        // ELIMINAR PROMOCIÓN
        // ==========================================

        [Authorize]
        [HttpDelete]
        public async Task<IActionResult> EliminarPromocion(
            int id,
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.DeleteAsync(
                $"api/Carrusel/{id}",
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
