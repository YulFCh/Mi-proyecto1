
using ApiProyecto1.Models.Servicios;
using ApiProyecto1.Services.Servicios;
using Microsoft.AspNetCore.Mvc;

namespace ApiProyecto1.Controllers.Servicios
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiciosController : ControllerBase
    {
        private readonly ServiciosService _service;

        public ServiciosController(ServiciosService service)
        {
            _service = service;
        }

        // ==========================================
        // LISTAR
        // ==========================================

        [HttpGet]
        public IActionResult Get()
        {
            var data = _service.Listar();
            return Ok(data);
        }

        // ==========================================
        // INSERTAR
        // ==========================================

        [HttpPost]
        public IActionResult Post([FromBody] GuardarServicioModel model)
        {
            try
            {
                int id = _service.Insertar(model);

                return Ok(new
                {
                    success = true,
                    message = "Servicio guardado correctamente.",
                    idServicio = id
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // ==========================================
        // EDITAR
        // ==========================================

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(
            int id,
            [FromBody] GuardarServicioModel model,
            CancellationToken cancellationToken)
        {
            try
            {
                bool actualizado = await _service.EditarAsync(
                    id,
                    model,
                    cancellationToken
                );

                if (!actualizado)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "No se encontró el servicio."
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Servicio actualizado correctamente."
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }

        // ==========================================
        // ELIMINAR
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
                    cancellationToken
                );

                if (!eliminado)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "No se encontró el servicio."
                    });
                }

                return Ok(new
                {
                    success = true,
                    message = "Servicio eliminado correctamente."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Ocurrió un error al eliminar el servicio."
                });
            }
        }
    }
}
