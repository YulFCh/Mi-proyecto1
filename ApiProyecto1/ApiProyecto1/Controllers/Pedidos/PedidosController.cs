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
        private readonly VerPedidosService _verPedidosService;


        // ============================================================
        // CONSTRUCTOR
        // ============================================================

        public PedidosController(
            PedidosService pedidosService,
            TicketService ticketService, VerPedidosService verPedidos)
        {
            _pedidosService = pedidosService;
            _ticketService = ticketService;
            _verPedidosService = verPedidos;
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

        // ============================================================
        // LISTAR / BUSCAR PEDIDOS
        // GET: api/Pedidos/listar
        // GET: api/Pedidos/listar?buscar=P-000001
        // GET: api/Pedidos/listar?buscar=Juan
        // GET: api/Pedidos/listar?buscar=12345678
        // ============================================================

        [HttpGet("listar")]
        public IActionResult ListarPedidos(
     [FromQuery] string? nombre = null,
     [FromQuery] string? dni = null,
     [FromQuery] string? codigoPedido = null)
        {
            try
            {
                List<PedidosModel> pedidos =
                    _verPedidosService.Listar(
                        nombre,
                        dni,
                        codigoPedido);

                return Ok(new
                {
                    success = true,
                    data = pedidos
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
        // OBTENER DETALLE DEL PEDIDO
        // GET: api/Pedidos/125/detalle
        // ============================================================

        [HttpGet("{idPedido}/detalle")]
        public IActionResult ObtenerDetalle(int idPedido)
        {
            try
            {
                List<DetallePedidoModel> detalles =
                    _verPedidosService.ObtenerDetalle(idPedido);

                return Ok(new
                {
                    success = true,
                    data = detalles
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
