using Microsoft.AspNetCore.Mvc;

namespace Proyecto1.Controllers
{
    public class ProductoController : Controller
    {
        [HttpGet("/Producto/Detalle/{id:int}/{nombre?}")]
        public IActionResult Detalle(int id, string? nombre)
        {
            return RedirectToAction(
                "Index",
                "Inicio",
                new { productoId = id, nombre }
            );
        }
    }
}