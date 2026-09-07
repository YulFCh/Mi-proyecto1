using Microsoft.AspNetCore.Mvc;

namespace Proyecto1.Controllers
{
    public class PedidosController : Controller
    {
        // ============================================================
        // VISTA DE PEDIDOS
        // GET: /Pedidos
        // ============================================================

        public IActionResult Index()
        {
            return View("Pedidos");
        }
    }
}

