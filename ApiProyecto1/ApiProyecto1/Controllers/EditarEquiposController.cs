using ApiProyecto1.Models;
using ApiProyecto1.Services;
using Microsoft.AspNetCore.Mvc;

namespace ApiProyecto1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EditarEquiposController : ControllerBase
    {
        private readonly EditarEquiposService _service;

        public EditarEquiposController(EditarEquiposService service)
        {
            _service = service;
        }

        [HttpGet("variantes/{id}")]
        public IActionResult ObtenerVariantes(int id)
        {
            var variantes = _service.ObtenerVariantes(id);

            return Ok(variantes);
        }

        [HttpPatch("{id}")]
        public IActionResult Patch(int id, [FromBody] EditarEquiposModel model)
        {
            _service.Patch(id, model);
            return Ok(new { success = true });
        }
    }
}