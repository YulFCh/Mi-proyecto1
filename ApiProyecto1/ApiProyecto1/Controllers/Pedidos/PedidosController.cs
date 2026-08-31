using ApiProyecto1.Models.Pedidos;
using ApiProyecto1.Services.Pedidos;
using Microsoft.AspNetCore.Mvc;

namespace ApiProyecto1.Controllers.Pedidos
{
    [ApiController]
    [Route("api/[controller]")]
    public class PedidosController : ControllerBase
    {
        private readonly PedidosService _pedidosService;

        public PedidosController(PedidosService pedidosService)
        {
            _pedidosService = pedidosService;
        }


        // ============================================================
        // REGISTRAR PEDIDO
        // POST: api/Pedidos
        // ============================================================

        [HttpPost]
        public IActionResult Registrar([FromBody] PedidosModel model)
        {
            try
            {
                int idPedido = _pedidosService.Registrar(model);

                string codPedido = $"P-{idPedido:D4}";

                return Ok(new
                {
                    success = true,
                    message = "Pedido registrado correctamente.",
                    id_pedido = idPedido,
                    cod_pedido = codPedido
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }
    }
}

