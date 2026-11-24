
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Proyecto1.Services.Interfaces;
using System.Text.Json;
using System.Text.Json.Nodes;

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

            // Si la API devuelve un error, conservar su respuesta.
            if (!respuesta.IsSuccessStatusCode)
            {
                return new ContentResult
                {
                    Content = contenido,
                    ContentType = "application/json; charset=utf-8",
                    StatusCode = (int)respuesta.StatusCode
                };
            }

            // ==========================================
            // ADMINISTRADOR: DEVOLVER PRECIOS COMPLETOS
            // ==========================================

            if (User.Identity?.IsAuthenticated == true)
            {
                return new ContentResult
                {
                    Content = contenido,
                    ContentType = "application/json; charset=utf-8",
                    StatusCode = (int)respuesta.StatusCode
                };
            }

            // ==========================================
            // CONSULTAR CONFIGURACIÓN GENERAL
            // ==========================================

            bool mostrarPreciosGeneral = false;

            using (var respuestaConfig = await _apiClient.GetAsync(
                "api/catalogos/equipos/configuracion-precios",
                cancellationToken))
            {
                if (respuestaConfig.IsSuccessStatusCode)
                {
                    var contenidoConfig =
                        await respuestaConfig.Content.ReadAsStringAsync(
                            cancellationToken
                        );

                    try
                    {
                        var configuracion = JsonNode.Parse(contenidoConfig);

                        mostrarPreciosGeneral =
                            configuracion?["mostrarPrecios"]?.GetValue<bool>()
                            ?? false;
                    }
                    catch (JsonException)
                    {
                        mostrarPreciosGeneral = false;
                    }
                }
            }

            // ==========================================
            // FILTRAR PRECIOS PARA VISITANTES
            // ==========================================

            try
            {
                JsonNode? productos = JsonNode.Parse(contenido);

                if (productos is not JsonArray listaProductos)
                {
                    return StatusCode(
                        StatusCodes.Status502BadGateway,
                        new
                        {
                            success = false,
                            message = "La respuesta del catálogo no tiene un formato válido."
                        }
                    );
                }

                foreach (var producto in listaProductos)
                {
                    if (producto is not JsonObject)
                        continue;

                    // Visibilidad individual del card.
                    bool mostrarPrecioProducto =
                        ObtenerBooleano(producto, "mostrarPrecio");

                    // Condición de visibilidad del producto.
                    bool permitirPrecio =
                        mostrarPreciosGeneral && mostrarPrecioProducto;

                    // Ocultar precios del producto principal.
                    if (!permitirPrecio)
                    {
                        OcultarPrecios(producto);
                    }

                    // ==========================================
                    // APLICAR LA MISMA VISIBILIDAD A VARIANTES
                    // ==========================================

                    if (producto["variantes"] is JsonArray variantes)
                    {
                        foreach (var variante in variantes)
                        {
                            if (variante is not JsonObject)
                                continue;

                            if (!permitirPrecio)
                            {
                                OcultarPrecios(variante);
                            }
                        }
                    }
                }

                contenido = productos.ToJsonString();
            }
            catch (JsonException)
            {
                return StatusCode(
                    StatusCodes.Status502BadGateway,
                    new
                    {
                        success = false,
                        message = "No se pudo procesar la información del catálogo."
                    }
                );
            }

            return new ContentResult
            {
                Content = contenido,
                ContentType = "application/json; charset=utf-8",
                StatusCode = (int)respuesta.StatusCode
            };
        }


        // ==========================================
        // OBTENER VISIBILIDAD DEL PRODUCTO
        // ==========================================

        private static bool ObtenerBooleano(
            JsonNode? nodo,
            string propiedad)
        {
            if (nodo is not JsonObject objeto)
                return false;

            return objeto[propiedad] is JsonValue valor &&
                   valor.TryGetValue<bool>(out bool resultado) &&
                   resultado;
        }


        // ==========================================
        // OCULTAR VALORES DE PRECIOS
        // ==========================================

        private static void OcultarPrecios(JsonNode? nodo)
        {
            if (nodo is not JsonObject objeto)
                return;

            objeto["precio"] = null;
            objeto["precio_Antes"] = null;
            objeto["descuento"] = null;
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


        // ==========================================
        // OBTENER CONFIGURACIÓN GENERAL DE PRECIOS
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> ObtenerConfiguracionPrecios(
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.GetAsync(
                "api/catalogos/equipos/configuracion-precios",
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
        // ACTUALIZAR CONFIGURACIÓN GENERAL DE PRECIOS
        // ==========================================

        [Authorize]
        [HttpPut]
        public async Task<IActionResult> ActualizarConfiguracionPrecios(
            [FromBody] JsonElement model,
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.PutAsync(
                "api/catalogos/equipos/configuracion-precios",
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
        // OBTENER CATEGORÍAS Y SUBCATEGORÍAS
        // ==========================================

        [HttpGet]
        public async Task<IActionResult> ObtenerCaracteristicas(
            CancellationToken cancellationToken)
        {
            using var respuesta = await _apiClient.GetAsync(
                "api/caracteristicasequipos",
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
        // OBTENER TIPOS, COLORES Y MARCAS
        // ==========================================
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> ObtenerListaCaracteristicas(
            string endpoint,
            CancellationToken cancellationToken)
        {
            // Permitir únicamente estos endpoints.
            string[] endpointsPermitidos =
            {
                "tiposequipo",
                "colores",
                "marcas"
            };

            if (!endpointsPermitidos.Contains(
                endpoint,
                StringComparer.OrdinalIgnoreCase))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Endpoint no permitido."
                });
            }

            using var respuesta = await _apiClient.GetAsync(
                $"api/caracteristicasequipos/{endpoint}",
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
