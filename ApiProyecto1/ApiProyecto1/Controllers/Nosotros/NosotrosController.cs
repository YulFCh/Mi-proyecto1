
using ApiProyecto1.Models.Nosotros;
using ApiProyecto1.Services.Nosotros;
using Microsoft.AspNetCore.Mvc;

namespace ApiProyecto1.Controllers.Nosotros
{
    [Route("api/[controller]")]
    [ApiController]
    public class NosotrosController : ControllerBase
    {
        private readonly NosotrosService _service;

        public NosotrosController(NosotrosService service)
        {
            _service = service;
        }

        // =====================================================
        // 1. LISTAR NOSOTROS
        // =====================================================

        [HttpGet]
        public IActionResult Listar()
        {
            try
            {
                var data = _service.Listar();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = "Error al listar los apartados de Nosotros.",
                    error = ex.Message
                });
            }
        }

        // =====================================================
        // 2. REGISTRAR NOSOTROS
        // =====================================================

        [HttpPost]
        public IActionResult Registrar(
            [FromBody] RegistrarNosotrosModel model)
        {
            try
            {
                int id = _service.Insertar(model);

                return Ok(new
                {
                    mensaje = "Apartado registrado correctamente.",
                    idNosotros = id
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    mensaje = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = "Error al registrar el apartado de Nosotros.",
                    error = ex.Message
                });
            }
        }

        // =====================================================
        // 3. EDITAR NOSOTROS
        // =====================================================

        [HttpPut("{id}")]
        public async Task<IActionResult> Editar(
            int id,
            [FromBody] RegistrarNosotrosModel model)
        {
            try
            {
                bool actualizado = await _service.EditarAsync(id, model);

                if (!actualizado)
                {
                    return NotFound(new
                    {
                        mensaje = "No se encontró el apartado seleccionado."
                    });
                }

                return Ok(new
                {
                    mensaje = "Apartado actualizado correctamente."
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    mensaje = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = "Error al actualizar el apartado de Nosotros.",
                    error = ex.Message
                });
            }
        }

        // =====================================================
        // 4. ELIMINAR NOSOTROS
        // =====================================================

        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(int id)
        {
            try
            {
                bool eliminado = await _service.EliminarAsync(id);

                if (!eliminado)
                {
                    return NotFound(new
                    {
                        mensaje = "No se encontró el apartado seleccionado."
                    });
                }

                return Ok(new
                {
                    mensaje = "Apartado eliminado correctamente."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = "Error al eliminar el apartado de Nosotros.",
                    error = ex.Message
                });
            }
        }

        // =====================================================
        // 1.1. LISTAR NOSOTROS PÚBLICOS
        // =====================================================

        [HttpGet("publicos")]
        public IActionResult ListarPublicos()
        {
            try
            {
                var data = _service.ListarPublicos();

                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = "Error al listar los apartados públicos de Nosotros.",
                    error = ex.Message
                });
            }
        }
    }
}
