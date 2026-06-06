using ApiProyecto1.Models;
using ApiProyecto1.Services;
using Microsoft.AspNetCore.Mvc;

namespace ApiProyecto1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegistrosController : ControllerBase
    {
        private readonly RegistrosService _service;

        public RegistrosController(RegistrosService service)
        {
            _service = service;
        }

        // 🔥 LISTAR
        [HttpGet]
        public IActionResult Get()
        {
            var data = _service.Listar();
            return Ok(data);
        }

        // 🔥 INSERTAR
        [HttpPost]
        public IActionResult Post([FromBody] RegistrosModel model)
        {
            _service.Insertar(model);
            return Ok(new { success = true, message = "Registro guardado" });
        }

    }
}