
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
    }
}
