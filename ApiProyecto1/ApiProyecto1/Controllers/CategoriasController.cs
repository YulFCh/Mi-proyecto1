
using ApiProyecto1.Services;
using Microsoft.AspNetCore.Mvc;

namespace ApiProyecto1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriasController : ControllerBase
    {
        private readonly CategoriasService _categoriasService;

        public CategoriasController(CategoriasService categoriasService)
        {
            _categoriasService = categoriasService;
        }

        [HttpGet]
        public IActionResult Listar()
        {
            var categorias = _categoriasService.Listar();
            return Ok(categorias);
        }
    }
}
