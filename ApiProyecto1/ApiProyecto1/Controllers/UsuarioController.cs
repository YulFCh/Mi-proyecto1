using ApiProyecto1.Models;
using ApiProyecto1.Services;
using Microsoft.AspNetCore.Mvc;

namespace ApiProyecto1.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuarioController : ControllerBase
    {
        private readonly UsuarioService _service;

        public UsuarioController(UsuarioService service)
        {
            _service = service;
        }
        //Login
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel model)
        {
            var user = _service.ObtenerPorUsuario(model.Usuario);

            if (user == null)
            {
                return Ok(new
                {
                    success = false,
                    mensaje = "Usuario incorrecto"
                });
            }

            string hash = HashPassword(model.Password);

            if (user.Password != hash)
            {
                return Ok(new
                {
                    success = false,
                    mensaje = "Contraseña incorrecta"
                });
            }

            return Ok(new
            {
                success = true,
                mensaje = "ok"
            });
        }

        // 🔹 Por usuario
        [HttpGet("{usuario}")]
        public IActionResult GetPorUsuario(string usuario)
        {
            var user = _service.ObtenerPorUsuario(usuario);

            if (user == null)
            {
                return NotFound(new
                {
                    mensaje = "Usuario no encontrado",
                    response = new object[] { }
                });
            }

            return Ok(new
            {
                mensaje = "ok",
                response = new[] { user }
            });
        }

        // Crear usuario
        [HttpPost]
        public IActionResult Crear([FromBody] UsuarioModel usuario)
        {
            var result = _service.CrearUsuario(usuario);

            if (!result)
            {
                return BadRequest(new
                {
                    mensaje = "Error al crear usuario"
                });
            }

            return Ok(new
            {
                mensaje = "usuario creado correctamente"
            });
        }

        // Editar usuario
        [HttpPatch("{id}")]
        public IActionResult EditarParcial(int id, [FromBody] UsuarioModel usuario)
        {
            var result = _service.EditarParcial(id, usuario);

            if (!result)
            {
                return NotFound(new { mensaje = "Usuario no encontrado o no actualizado" });
            }

            return Ok(new { mensaje = "usuario actualizado correctamente" });
        }

        [HttpDelete("{id}")]
        public IActionResult Eliminar(int id)
        {
            var result = _service.EliminarUsuario(id);

            if (!result)
            {
                return NotFound(new
                {
                    mensaje = "Usuario no encontrado o no eliminado"
                });
            }

            return Ok(new
            {
                mensaje = "usuario eliminado correctamente"
            });
        }

        private string HashPassword(string password)
        {
            using (var sha256 = System.Security.Cryptography.SHA256.Create())
            {
                var bytes = System.Text.Encoding.UTF8.GetBytes(password);
                var hash = sha256.ComputeHash(bytes);
                return BitConverter.ToString(hash).Replace("-", "");
            }
        }
    }
}