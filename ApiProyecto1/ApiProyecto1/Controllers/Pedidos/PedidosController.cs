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
        private readonly TicketService _ticketService;


        // ============================================================
        // CONSTRUCTOR
        // ============================================================

        public PedidosController(
            PedidosService pedidosService,
            TicketService ticketService)
        {
            _pedidosService = pedidosService;
            _ticketService = ticketService;
        }


        // ============================================================
        // REGISTRAR PEDIDO
        // POST: api/Pedidos
        // ============================================================

        [HttpPost]
        public IActionResult Registrar(
            [FromBody] PedidosModel model)
        {
            try
            {
                int idPedido =
                    _pedidosService.Registrar(model);


                string codPedido =
                    $"P-{idPedido:D6}";


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


        // ============================================================
        // CONSULTAR TICKET
        // GET: api/Pedidos/125/ticket
        // ============================================================

        [HttpGet("{idPedido}/ticket")]
        public IActionResult ObtenerTicket(int idPedido)
        {
            try
            {
                TicketModel ticket =
                    _ticketService.ObtenerTicket(idPedido);


                return Ok(new
                {
                    success = true,
                    data = ticket
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
