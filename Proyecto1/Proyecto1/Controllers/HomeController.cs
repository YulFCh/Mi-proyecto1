using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Proyecto1.Models;

namespace Proyecto1.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View("IndexUsuario");
        }
    }
}
