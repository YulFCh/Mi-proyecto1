
using ApiProyecto1.Models.Informes;
using ApiProyecto1.Services.Informes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ApiProyecto1.Controllers.Informes
{
    [ApiController]
    [Route("api/[controller]")]
    public class InformesController : ControllerBase
    {
        private readonly InformesService _service;

        public InformesController(InformesService service)
        {
            _service = service;
        }

        // ==========================================
        // LISTAR TODAS LAS SECCIONES
        // ==========================================

        [HttpGet]
        public IActionResult Get()
        {
            var data = _service.Listar();

            return Ok(data);
        }

        // ==========================================
        // REGISTRAR SECCIÓN
        // ==========================================

        [HttpPost]
        public IActionResult Post(
            [FromBody] GuardarSeccionWebModel model)
        {
            try
            {
                int id = _service.Insertar(model);

                return Ok(new
                {
                    mensaje = "Sección registrada correctamente.",
                    idSeccion = id
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    mensaje = ex.Message
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    mensaje = "Ocurrió un error al registrar la sección."
                });
            }
        }

        // ==========================================
        // EDITAR SECCIÓN
        // ==========================================

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(
            int id,
            [FromBody] GuardarSeccionWebModel model,
            CancellationToken cancellationToken)
        {
            try
            {
                bool actualizado = await _service.EditarAsync(
                    id,
                    model,
                    cancellationToken);

                if (!actualizado)
                {
                    return NotFound(new
                    {
                        mensaje = "No se encontró la sección."
                    });
                }

                return Ok(new
                {
                    mensaje = "Sección actualizada correctamente."
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    mensaje = ex.Message
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    mensaje = "Ocurrió un error al actualizar la sección."
                });
            }
        }

        // ==========================================
        // ELIMINAR SECCIÓN
        // ==========================================

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(
            int id,
            CancellationToken cancellationToken)
        {
            try
            {
                bool eliminado = await _service.EliminarAsync(
                    id,
                    cancellationToken);

                if (!eliminado)
                {
                    return NotFound(new
                    {
                        mensaje = "No se encontró la sección."
                    });
                }

                return Ok(new
                {
                    mensaje = "Sección eliminada correctamente."
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    mensaje = "Ocurrió un error al eliminar la sección."
                });
            }
        }

        // ==========================================
        // ELIMINAR ELEMENTO INDIVIDUAL
        // ==========================================

        [HttpDelete("elemento/{id}")]
        public async Task<IActionResult> DeleteElemento(
            int id,
            CancellationToken cancellationToken)
        {
            try
            {
                bool eliminado = await _service.EliminarElementoAsync(
                    id,
                    cancellationToken);

                if (!eliminado)
                {
                    return NotFound(new
                    {
                        mensaje = "No se encontró el elemento."
                    });
                }

                return Ok(new
                {
                    mensaje = "Elemento eliminado correctamente."
                });
            }
            catch (Exception)
            {
                return StatusCode(500, new
                {
                    mensaje = "Ocurrió un error al eliminar el elemento."
                });
            }
        }

        // ==========================================
        // LISTAR SECCIONES PÚBLICAS
        // ==========================================

        [HttpGet("publicos")]
        [AllowAnonymous]
        public IActionResult ListarPublicos()
        {
            var data = _service.ListarPublicos();

            return Ok(data);
        }
    }
}
