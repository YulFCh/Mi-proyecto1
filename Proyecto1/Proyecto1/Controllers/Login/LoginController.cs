using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

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
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Index(string Usuario, string Password)
        {

            if (string.IsNullOrWhiteSpace(Usuario))
                ViewBag.UsuarioError = "Ingrese el nombre de usuario";

            if (string.IsNullOrWhiteSpace(Password))
                ViewBag.PasswordError = "Ingrese la contraseña";

            if (ViewBag.UsuarioError != null || ViewBag.PasswordError != null)
            {
                ViewBag.Usuario = Usuario;
                return View();
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
                ViewBag.Error = "Error al conectar con la API";
                return View();
            }

            var responseBody = await response.Content.ReadAsStringAsync();

            var result = JsonSerializer.Deserialize<LoginResponse>(responseBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (result != null && result.success)
            {
                return RedirectToAction("Index", "Inicio");
            }

            ViewBag.Usuario = Usuario;

            if (result != null && result.mensaje != null)
            {
                if (result.mensaje == "Usuario incorrecto")
                {
                    ViewBag.UsuarioError = result.mensaje;
                }
                else if (result.mensaje == "Contraseña incorrecta")
                {
                    ViewBag.PasswordError = result.mensaje;
                }
                else
                {
                    ViewBag.GeneralError = result.mensaje;
                }
            }
            else
            {
                ViewBag.GeneralError = "Error desconocido";
            }

            return View();
        }

        public IActionResult Bienvenida()
        {
            return View();
        }
    }

    public class LoginResponse
    {
        public bool success { get; set; }
        public string mensaje { get; set; }
    }
}