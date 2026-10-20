
using Microsoft.AspNetCore.Mvc;

namespace Proyecto1.Controllers.Catalogo
{
    public class CatalogoController : Controller
    {
        public IActionResult Catalogo()
        {
            return View();
        }
    }
}