
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Proyecto1.Services.Interfaces;
using System.Text.Json;

namespace Proyecto1.Controllers.Catalogo
{
    public class CatalogoController : Controller
    {
        private readonly IApiClientService _apiClient;

        public CatalogoController(IApiClientService apiClient)
        {
            _apiClient = apiClient;
        }

        // ==========================================
        // MOSTRAR VISTA DEL CATÁLOGO
        // ==========================================

        [HttpGet]
        public IActionResult Catalogo()
        {
            return View();
        }

        // ==========================================
        // LISTAR EQUIPOS
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> Listar(
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.GetAsync(
                "api/catalogos/equipos",
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
        // REGISTRAR EQUIPO
        // ==========================================

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Registrar(
            [FromBody] JsonElement model,
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.PostAsync(
                "api/catalogos/equipos",
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
        // OBTENER VARIANTES PARA EDITAR
        // ==========================================

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> ObtenerVariantes(
            int id,
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.GetAsync(
                $"api/catalogos/equipos/{id}/variantes",
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
        // EDITAR EQUIPO
        // ==========================================

        [Authorize]
        [HttpPatch]
        public async Task<IActionResult> Editar(
            int id,
            [FromBody] JsonElement model,
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.PatchAsync(
                $"api/catalogos/equipos/{id}",
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
        // ELIMINAR UNA VARIANTE
        // ==========================================

        [Authorize]
        [HttpDelete]
        public async Task<IActionResult> EliminarVariante(
            int id,
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.DeleteAsync(
                $"api/catalogos/equipos/{id}",
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
        // ELIMINAR PRODUCTO COMPLETO
        // ==========================================

        [Authorize]
        [HttpDelete]
        public async Task<IActionResult> EliminarProductoCompleto(
            int id,
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.DeleteAsync(
                $"api/catalogos/equipos/{id}/producto",
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
