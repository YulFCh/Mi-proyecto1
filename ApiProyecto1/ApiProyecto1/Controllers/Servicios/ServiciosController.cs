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
        public IActionResult Put(int id, [FromBody] GuardarServicioModel model)
        {
            try
            {
                bool actualizado = _service.Editar(id, model);

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
    }
}