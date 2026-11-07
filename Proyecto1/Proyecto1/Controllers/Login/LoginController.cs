
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Proyecto1.Services.Interfaces;

namespace Proyecto1.Controllers
{
    public class LoginController : Controller
    {
        private readonly IApiClientService _apiClient;

        public LoginController(IApiClientService apiClient)
        {
            _apiClient = apiClient;
        }

        [HttpGet]
        public IActionResult Index()
        {
            return RedirectToAction("Index", "Inicio");
        }

        [HttpPost]
        public async Task<IActionResult> Index(
            string Usuario,
            string Password,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(Usuario))
            {
                TempData["LoginError"] = "Ingrese el nombre de usuario";
                TempData["OpenLoginModal"] = "true";
                return RedirectToAction("Index", "Inicio");
            }

            if (string.IsNullOrWhiteSpace(Password))
            {
                TempData["LoginError"] = "Ingrese la contraseña";
                TempData["OpenLoginModal"] = "true";
                return RedirectToAction("Index", "Inicio");
            }

            var loginData = new
            {
                usuario = Usuario,
                password = Password
            };

            try
            {
                using var response = await _apiClient.PostAsync(
                    "api/usuario/login",
                    loginData,
                    cancellationToken
                );

                if (!response.IsSuccessStatusCode)
                {
                    TempData["LoginError"] = "Error al conectar con la API";
                    TempData["OpenLoginModal"] = "true";

                    return RedirectToAction("Index", "Inicio");
                }

                var responseBody = await response.Content.ReadAsStringAsync(
                    cancellationToken
                );

                var result = JsonSerializer.Deserialize<LoginResponse>(
                    responseBody,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    }
                );

                if (result != null && result.success)
                {
                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.Name, Usuario)
                    };

                    var identity = new ClaimsIdentity(
                        claims,
                        CookieAuthenticationDefaults.AuthenticationScheme
                    );

                    var principal = new ClaimsPrincipal(identity);

                    await HttpContext.SignInAsync(
                        CookieAuthenticationDefaults.AuthenticationScheme,
                        principal
                    );

                    return RedirectToAction("Index", "Inicio");
                }

                TempData["LoginError"] =
                    result?.mensaje ?? "Error desconocido";

                TempData["OpenLoginModal"] = "true";

                return RedirectToAction("Index", "Inicio");
            }
            catch (HttpRequestException)
            {
                TempData["LoginError"] = "No se pudo conectar con el servidor.";
                TempData["OpenLoginModal"] = "true";

                return RedirectToAction("Index", "Inicio");
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(
                CookieAuthenticationDefaults.AuthenticationScheme
            );

            return RedirectToAction("Index", "Inicio");
        }
    }

    public class LoginResponse
    {
        public bool success { get; set; }
        public string? mensaje { get; set; }
    }
}
