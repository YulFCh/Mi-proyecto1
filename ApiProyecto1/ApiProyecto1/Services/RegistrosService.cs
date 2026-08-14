using ApiProyecto1.Models;
using Microsoft.Data.SqlClient;

namespace ApiProyecto1.Services
{
    public class RegistrosService
    {
        private readonly string _connectionString;

        public RegistrosService(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DefaultConnection");
        }

        // LISTAR EQUIPOS
        // LISTAR EQUIPOS AGRUPADOS POR MODELO
        // LISTAR EQUIPOS AGRUPADOS POR TIPO + MARCA + MODELO
        public List<RegistrosModel> Listar()
        {
            var registros = new List<RegistrosModel>();

            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                string query = @"
            SELECT
                id,
                tipo_equipo,
                color,
                modelo,
                descripcion,
                precio,
                fecha_registro,
                url_equipo,
                url1,
                url2,
                url3,
                marca,
                codigo_producto,
                precio_antes,
                descuento,
                estado,
                usuario_registra,
                descripcion1,
                garantia
            FROM equipos
            ORDER BY marca, modelo, id";

                using (SqlCommand cmd = new SqlCommand(query, con))
                {
                    con.Open();

                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            registros.Add(new RegistrosModel
                            {
                                Id = Convert.ToInt32(dr["id"]),

                                Tipo_Equipo = dr["tipo_equipo"]?.ToString() ?? "",

                                Color = dr["color"] == DBNull.Value
                                    ? null
                                    : dr["color"].ToString(),

                                Modelo = dr["modelo"] == DBNull.Value
                                    ? null
                                    : dr["modelo"].ToString(),

                                Descripcion = dr["descripcion"] == DBNull.Value
                                    ? null
                                    : dr["descripcion"].ToString(),

                                Precio = dr["precio"] == DBNull.Value
                                    ? 0
                                    : Convert.ToDecimal(dr["precio"]),

                                Fecha_Registro = dr["fecha_registro"] == DBNull.Value
                                    ? null
                                    : Convert.ToDateTime(dr["fecha_registro"]),

                                Url_Equipo = dr["url_equipo"] == DBNull.Value
                                    ? null
                                    : dr["url_equipo"].ToString(),

                                Url1 = dr["url1"] == DBNull.Value
                                    ? null
                                    : dr["url1"].ToString(),

                                Url2 = dr["url2"] == DBNull.Value
                                    ? null
                                    : dr["url2"].ToString(),

                                Url3 = dr["url3"] == DBNull.Value
                                    ? null
                                    : dr["url3"].ToString(),

                                Marca = dr["marca"] == DBNull.Value
                                    ? null
                                    : dr["marca"].ToString(),

                                Codigo_Producto = dr["codigo_producto"] == DBNull.Value
                                    ? null
                                    : dr["codigo_producto"].ToString(),

                                Precio_Antes = dr["precio_antes"] == DBNull.Value
                                    ? null
                                    : Convert.ToDecimal(dr["precio_antes"]),

                                Descuento = dr["descuento"] == DBNull.Value
                                    ? null
                                    : Convert.ToDecimal(dr["descuento"]),

                                Estado = dr["estado"] == DBNull.Value
                                    ? null
                                    : dr["estado"].ToString(),

                                Usuario_Registra = dr["usuario_registra"] == DBNull.Value
                                    ? null
                                    : dr["usuario_registra"].ToString(),

                                Descripcion1 = dr["descripcion1"] == DBNull.Value
                                    ? null
                                    : dr["descripcion1"].ToString(),

                                Garantia = dr["garantia"] == DBNull.Value
                                    ? null
                                    : dr["garantia"].ToString()
                            });
                        }
                    }
                }
            }


            // ============================================================
            // AGRUPAR POR:
            // TIPO_EQUIPO + MARCA + MODELO
            // ============================================================

            var agrupados = registros
                .GroupBy(x => new
                {
                    Tipo = (x.Tipo_Equipo ?? "").Trim().ToLower(),
                    Marca = (x.Marca ?? "").Trim().ToLower(),
                    Modelo = (x.Modelo ?? "").Trim().ToLower()
                })
                .Select(grupo =>
                {
                    // Registro principal
                    var primero = grupo.First();

                    // Crear las variantes correspondientes a cada color
                    primero.Variantes = grupo.Select(x => new VarianteModel
                    {
                        Id = x.Id,

                        Color = x.Color,

                        Url_Equipo = x.Url_Equipo,
                        Url1 = x.Url1,
                        Url2 = x.Url2,
                        Url3 = x.Url3,

                        Precio = x.Precio,
                        Precio_Antes = x.Precio_Antes,
                        Descuento = x.Descuento,

                        Estado = x.Estado,

                        Codigo_Producto = x.Codigo_Producto,

                        // Si todavía no tienes Stock en tu tabla,
                        // dejamos 0 por ahora.
                        Stock = 0,

                        Descripcion = x.Descripcion,
                        Descripcion1 = x.Descripcion1,
                        Garantia = x.Garantia

                    }).ToList();


                    // ====================================================
                    // LA PRIMERA VARIANTE ES LA QUE SE MUESTRA INICIALMENTE
                    // ====================================================

                    var varianteInicial = primero.Variantes.FirstOrDefault();

                    if (varianteInicial != null)
                    {
                        primero.Id = varianteInicial.Id;

                        primero.Color = varianteInicial.Color;

                        primero.Url_Equipo = varianteInicial.Url_Equipo;
                        primero.Url1 = varianteInicial.Url1;
                        primero.Url2 = varianteInicial.Url2;
                        primero.Url3 = varianteInicial.Url3;

                        primero.Precio = varianteInicial.Precio;
                        primero.Precio_Antes = varianteInicial.Precio_Antes;
                        primero.Descuento = varianteInicial.Descuento;

                        primero.Estado = varianteInicial.Estado;

                        primero.Codigo_Producto =
                            varianteInicial.Codigo_Producto;
                    }

                    return primero;
                })
                .ToList();


            return agrupados;
        }

        // INSERTAR EQUIPO
        public void Insertar(RegistrosModel model)
        {
            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                string query = @"
                INSERT INTO equipos
                (
                    tipo_equipo,
                    color,
                    modelo,
                    descripcion,
                    precio,
                    fecha_registro,
                    url_equipo,
                    url1,
                    url2,
                    url3,
                    marca,
                    codigo_producto,
                    precio_antes,
                    descuento,
                    estado,
                    usuario_registra,
                    descripcion1,
                    garantia
                )
                VALUES
                (
                    @tipo,
                    @color,
                    @modelo,
                    @descripcion,
                    @precio,
                    GETDATE(),
                    @url0,
                    @url1,
                    @url2,
                    @url3,
                    @marca,
                    @codigo_producto,
                    @precio_antes,
                    @descuento,
                    @estado,
                    @usuario_registra,
                    @descripcion1,
                    @garantia
                )";

                SqlCommand cmd = new SqlCommand(query, con);

                cmd.Parameters.AddWithValue("@tipo", model.Tipo_Equipo);

                cmd.Parameters.AddWithValue("@color",
                    (object?)model.Color ?? DBNull.Value);

                cmd.Parameters.AddWithValue("@modelo",
                    (object?)model.Modelo ?? DBNull.Value);

                cmd.Parameters.AddWithValue("@descripcion",
                    (object?)model.Descripcion ?? DBNull.Value);

                cmd.Parameters.AddWithValue("@precio", model.Precio);

                cmd.Parameters.AddWithValue("@url0",
                    (object?)model.Url_Equipo ?? DBNull.Value);

                cmd.Parameters.AddWithValue("@url1",
                    (object?)model.Url1 ?? DBNull.Value);

                cmd.Parameters.AddWithValue("@url2",
                    (object?)model.Url2 ?? DBNull.Value);

                cmd.Parameters.AddWithValue("@url3",
                    (object?)model.Url3 ?? DBNull.Value);

                cmd.Parameters.AddWithValue("@marca",
                    (object?)model.Marca ?? DBNull.Value);

                cmd.Parameters.AddWithValue("@codigo_producto",
                    (object?)model.Codigo_Producto ?? DBNull.Value);

                cmd.Parameters.AddWithValue("@precio_antes",
                    (object?)model.Precio_Antes ?? DBNull.Value);

                cmd.Parameters.AddWithValue("@descuento",
                    (object?)model.Descuento ?? DBNull.Value);

                cmd.Parameters.AddWithValue("@estado",
                    (object?)model.Estado ?? DBNull.Value);

                cmd.Parameters.AddWithValue("@usuario_registra",
                    (object?)model.Usuario_Registra ?? DBNull.Value);

                cmd.Parameters.AddWithValue("@descripcion1",
                    (object?)model.Descripcion1 ?? DBNull.Value);

                cmd.Parameters.AddWithValue("@garantia",
                    (object?)model.Garantia ?? DBNull.Value);

                con.Open();

                cmd.ExecuteNonQuery();
            }
        }
    }
}