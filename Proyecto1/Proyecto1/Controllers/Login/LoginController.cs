using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace Proyecto1.Controllers
{
    public class LoginController : Controller
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiBaseUrl;

        public LoginController(IConfiguration config)
        {
            _httpClient = new HttpClient();
            _apiBaseUrl = config["ApiSettings:BaseUrl"];
        }

        [HttpGet]
        public IActionResult Index()
        {
            return RedirectToAction("Index", "Inicio");
        }

        [HttpPost]
        public async Task<IActionResult> Index(string Usuario, string Password)
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

            var json = JsonSerializer.Serialize(loginData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_apiBaseUrl}/api/usuario/login", content);

            if (!response.IsSuccessStatusCode)
            {
                TempData["LoginError"] = "Error al conectar con la API";
                TempData["OpenLoginModal"] = "true";
                return RedirectToAction("Index", "Inicio");
            }

            var responseBody = await response.Content.ReadAsStringAsync();

            var result = JsonSerializer.Deserialize<LoginResponse>(responseBody,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

 
            if (result != null && result.success)
            {
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, Usuario)
                };

                var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

                var principal = new ClaimsPrincipal(identity);

                await HttpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    principal
                );

                return RedirectToAction("Index", "Inicio");
                //return RedirectToAction("Index", "Home");
            }

            TempData["LoginError"] = result?.mensaje ?? "Error desconocido";
            TempData["OpenLoginModal"] = "true";

            return RedirectToAction("Index", "Inicio");
        }

        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Index", "Inicio");
        }
    }

    public class LoginResponse
    {
        public bool success { get; set; }
        public string mensaje { get; set; }
    }
}