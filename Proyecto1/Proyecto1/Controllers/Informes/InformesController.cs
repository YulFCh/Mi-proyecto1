
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Proyecto1.Services.Interfaces;
using System.Text.Json;

namespace Proyecto1.Controllers.Informes
{
    [Authorize]
    public class InformesController : Controller
    {
        private readonly IApiClientService _apiClient;

        public InformesController(IApiClientService apiClient)
        {
            _apiClient = apiClient;
        }

        // ==========================================
        // MOSTRAR VISTA DE ADMINISTRACIÓN
        // ==========================================

        [HttpGet]
        public IActionResult Informes()
        {
            return View("Informes");
        }

        // ==========================================
        // LISTAR SECCIONES Y ELEMENTOS
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> Listar(
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.GetAsync(
                "api/Informes",
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
        // LISTAR SECCIONES PÚBLICAS
        // ==========================================

        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> ListarPublicos(
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.GetAsync(
                "api/Informes/publicos",
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
        // REGISTRAR SECCIÓN
        // ==========================================


        [HttpPost]
        public async Task<IActionResult> Registrar(
            [FromBody] JsonElement model,
            CancellationToken cancellationToken)
        {
            // Obtener el usuario de la sesión autenticada
            var usuario = User.Identity?.Name;

            if (string.IsNullOrWhiteSpace(usuario))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al usuario que realiza el registro."
                });
            }

            // Convertir el JSON recibido en un diccionario
            var modelo = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(
                model.GetRawText()
            );

            if (modelo == null)
            {
                return BadRequest(new
                {
                    mensaje = "Los datos enviados no son válidos."
                });
            }

            // Asignar el usuario desde el servidor
            modelo["usuario"] = JsonSerializer.SerializeToElement(usuario);

            using var respuesta = await _apiClient.PostAsync(
                "api/Informes",
                modelo,
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
        // EDITAR SECCIÓN
        // ==========================================


        [HttpPut]
        public async Task<IActionResult> Editar(
            int id,
            [FromBody] JsonElement model,
            CancellationToken cancellationToken)
        {
            var usuario = User.Identity?.Name;

            if (string.IsNullOrWhiteSpace(usuario))
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al usuario que realiza la modificación."
                });

            var modelo = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(
                model.GetRawText()
            );

            if (modelo == null)
                return BadRequest(new
                {
                    mensaje = "Los datos enviados no son válidos."
                });

            // Asignar el usuario autenticado
            modelo["usuario"] = JsonSerializer.SerializeToElement(usuario);

            using var respuesta = await _apiClient.PutAsync(
                $"api/Informes/{id}",
                modelo,
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
        // ELIMINAR SECCIÓN
        // ==========================================

        [HttpDelete]
        public async Task<IActionResult> Eliminar(
            int id,
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.DeleteAsync(
                $"api/Informes/{id}",
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
        // ELIMINAR ELEMENTO INDIVIDUAL
        // ==========================================

        [HttpDelete]
        public async Task<IActionResult> EliminarElemento(
            int id,
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.DeleteAsync(
                $"api/Informes/elemento/{id}",
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
