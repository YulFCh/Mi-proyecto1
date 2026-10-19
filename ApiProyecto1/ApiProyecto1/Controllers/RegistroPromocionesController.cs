
using ApiProyecto1.Models;
using ApiProyecto1.Services;
using Microsoft.AspNetCore.Mvc;

namespace ApiProyecto1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RegistroPromocionesController : ControllerBase
    {
        private readonly RegistroPromocionesService _service;

        public RegistroPromocionesController(
            RegistroPromocionesService service)
        {
            _service = service;
        }

        // ============================================
        // POST: api/RegistroPromociones
        // INSERTAR IMAGEN PROMOCIONAL
        // ============================================
        [HttpPost]
        public IActionResult Insertar(
            [FromBody] RegistroPromocionesModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Url_Imagen_Prom))
            {
                return BadRequest(new
                {
                    mensaje = "La URL de la imagen es obligatoria."
                });
            }

            if (model.Fila_Prom != 1 && model.Fila_Prom != 2)
            {
                return BadRequest(new
                {
                    mensaje = "La fila debe ser 1 o 2."
                });
            }

            if (model.Orden_Prom < 1)
            {
                return BadRequest(new
                {
                    mensaje = "El orden debe ser mayor que cero."
                });
            }

            try
            {
                model.Usuaregist_Prom =
                    User.Identity?.IsAuthenticated == true
                        ? User.Identity.Name
                        : "API";

                _service.Insertar(model);

                return Ok(new
                {
                    mensaje = "Imagen promocional registrada correctamente."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = "Error al registrar la imagen promocional.",
                    error = ex.Message
                });
            }
        }
        // ============================================
        // GET: api/RegistroPromociones
        // ============================================
        [HttpGet]
        public IActionResult Listar()
        {
            try
            {
                var imagenes = _service.Listar();
                return Ok(imagenes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = "Error al listar las imágenes promocionales.",
                    error = ex.Message
                });
            }
        }

        // ============================================
        // GET: api/RegistroPromociones/5
        // ============================================
        [HttpGet("{id:int}")]
        public IActionResult ObtenerPorId(int id)
        {
            try
            {
                var imagen = _service.ObtenerPorId(id);

                if (imagen == null)
                {
                    return NotFound(new
                    {
                        mensaje = "La imagen promocional no existe."
                    });
                }

                return Ok(imagen);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = "Error al consultar la imagen.",
                    error = ex.Message
                });
            }
        }

        // ============================================
        // PUT: api/RegistroPromociones/5
        // ============================================
        [HttpPut("{id:int}")]
        public IActionResult Actualizar(
            int id,
            [FromBody] RegistroPromocionesModel model)
        {
            if (id != model.Id_Prom)
            {
                return BadRequest(new
                {
                    mensaje = "El ID de la URL no coincide con el del registro."
                });
            }

            if (string.IsNullOrWhiteSpace(model.Url_Imagen_Prom))
            {
                return BadRequest(new
                {
                    mensaje = "La URL de la imagen es obligatoria."
                });
            }

            if (model.Fila_Prom != 1 && model.Fila_Prom != 2)
            {
                return BadRequest(new
                {
                    mensaje = "La fila debe ser 1 o 2."
                });
            }

            if (model.Orden_Prom < 1)
            {
                return BadRequest(new
                {
                    mensaje = "El orden debe ser mayor que cero."
                });
            }

            try
            {
                // Si tienes autenticación configurada,
                // puedes obtener aquí el usuario autenticado.
                model.Usuarmodif_Prom =
                    User.Identity?.IsAuthenticated == true
                    ? User.Identity.Name
                    : "API";

                bool actualizado = _service.Actualizar(model);

                if (!actualizado)
                {
                    return NotFound(new
                    {
                        mensaje = "La imagen promocional no existe."
                    });
                }

                return Ok(new
                {
                    mensaje = "Imagen promocional actualizada correctamente."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = "Error al actualizar la imagen promocional.",
                    error = ex.Message
                });
            }
        }
    }
}