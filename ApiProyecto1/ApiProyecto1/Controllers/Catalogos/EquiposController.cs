
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
    }
}
