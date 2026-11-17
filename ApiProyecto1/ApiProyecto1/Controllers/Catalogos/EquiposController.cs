
using ApiProyecto1.Models.Catalogos;
using ApiProyecto1.Services.Catalogos;
using Microsoft.AspNetCore.Mvc;

namespace ApiProyecto1.Controllers.Catalogos
{
    [ApiController]
    [Route("api/catalogos/equipos")]
    public class EquiposController : ControllerBase
    {
        private readonly EquiposService _service;

        public EquiposController(EquiposService service)
        {
            _service = service;
        }

        // LISTAR
        [HttpGet]
        public IActionResult Get()
        {
            var data = _service.Listar();
            return Ok(data);
        }

        // REGISTRAR
        [HttpPost]
        public IActionResult Post([FromBody] RegistrosModel model)
        {
            _service.Insertar(model);

            return Ok(new
            {
                success = true,
                message = "Registro guardado correctamente"
            });
        }


        // ==========================================
        // OBTENER VARIANTES PARA EDITAR
        // ==========================================

        [HttpGet("{id:int}/variantes")]
        public IActionResult ObtenerVariantes(int id)
        {
            var data = _service.ObtenerVariantes(id);

            if (data == null || data.Count == 0)
                return NotFound(new
                {
                    success = false,
                    message = "No se encontraron variantes para este equipo."
                });

            return Ok(data);
        }

        // ==========================================
        // EDITAR EQUIPO
        // ==========================================

        [HttpPatch("{id:int}")]
        public async Task<IActionResult> Editar(
            int id,
            [FromBody] EditarEquiposModel model)
        {
            var publicIdsFallidos = await _service.PatchAsync(id, model);

            return Ok(new
            {
                success = true,
                message = "Equipo actualizado correctamente.",
                advertencia = publicIdsFallidos.Count > 0
                    ? "Algunas imágenes antiguas no pudieron eliminarse de Cloudinary."
                    : null,
                imagenesNoEliminadas = publicIdsFallidos
            });
        }



        // ============================================================
        // ELIMINAR UNA SOLA VARIANTE
        // ============================================================

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> EliminarVariante(int id)
        {
            return await EjecutarEliminacion(id, false);
        }

        // ============================================================
        // ELIMINAR PRODUCTO COMPLETO Y TODAS SUS VARIANTES
        // ============================================================

        [HttpDelete("{id:int}/producto")]
        public async Task<IActionResult> EliminarProductoCompleto(int id)
        {
            return await EjecutarEliminacion(id, true);
        }

        // ============================================================
        // PROCESAR ELIMINACIÓN
        // ============================================================

        private async Task<IActionResult> EjecutarEliminacion(
            int id,
            bool eliminarProductoCompleto)
        {
            try
            {
                var resultado = await _service.EliminarAsync(
                    id,
                    eliminarProductoCompleto
                );

                return Ok(new
                {
                    success = true,
                    message = eliminarProductoCompleto
                        ? "Producto y variantes eliminados correctamente."
                        : "Variante eliminada correctamente.",

                    cantidadEliminada = resultado.CantidadEliminada,

                    advertencia = resultado.ImagenesNoEliminadas.Count > 0
                        ? "Algunas imágenes no pudieron eliminarse de Cloudinary."
                        : null,

                    imagenesNoEliminadas = resultado.ImagenesNoEliminadas
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    success = false,
                    message = ex.Message
                });
            }
            catch (Microsoft.Data.SqlClient.SqlException ex)
                when (ex.Number == 547)
            {
                return Conflict(new
                {
                    success = false,
                    message = "No se puede eliminar porque existen registros relacionados."
                });
            }
        }


        // ============================================================
        // OBTENER CONFIGURACIÓN GENERAL DE PRECIOS
        // ============================================================

        [HttpGet("configuracion-precios")]
        public IActionResult ObtenerConfiguracionPrecios()
        {
            bool mostrarPrecios = _service.ObtenerMostrarPrecios();

            return Ok(new
            {
                mostrarPrecios
            });
        }

        // ============================================================
        // ACTUALIZAR CONFIGURACIÓN GENERAL DE PRECIOS
        // ============================================================

        [HttpPut("configuracion-precios")]
        public IActionResult ActualizarConfiguracionPrecios(
            [FromBody] ActualizarConfiguracionPreciosRequest request)
        {
            if (request.MostrarPrecios == null)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Debes indicar si se mostrarán los precios."
                });
            }

            try
            {
                _service.ActualizarMostrarPrecios(request.MostrarPrecios.Value);

                return Ok(new
                {
                    success = true,
                    mostrarPrecios = request.MostrarPrecios.Value,
                    message = "Configuración de precios actualizada correctamente."
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }


    }

    public class ActualizarConfiguracionPreciosRequest
    {
        public bool? MostrarPrecios { get; set; }
    }
}
