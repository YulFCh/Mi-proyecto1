using Microsoft.AspNetCore.Mvc;

namespace Proyecto1.Controllers
{
    public class InicioController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}