
using ApiProyecto1.Services;
using Microsoft.AspNetCore.Mvc;

namespace ApiProyecto1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CaracteristicasEquiposController : ControllerBase
    {
        private readonly CaracteristicasEquiposService _service;

        public CaracteristicasEquiposController(
            CaracteristicasEquiposService service)
        {
            _service = service;
        }

        // GET: api/caracteristicasequipos
        [HttpGet]
        public IActionResult Listar()
        {
            return Ok(_service.Listar());
        }

        // GET: api/caracteristicasequipos/tiposequipo
        [HttpGet("tiposequipo")]
        public IActionResult ListarTiposEquipo()
        {
            return Ok(_service.ListarTiposEquipo());
        }

        // GET: api/caracteristicasequipos/colores
        [HttpGet("colores")]
        public IActionResult ListarColores()
        {
            return Ok(_service.ListarColores());
        }

        // GET: api/caracteristicasequipos/marcas
        [HttpGet("marcas")]
        public IActionResult ListarMarcas()
        {
            return Ok(_service.ListarMarcas());
        }
    }
}
