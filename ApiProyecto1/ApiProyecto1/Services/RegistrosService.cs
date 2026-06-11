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
        public List<RegistrosModel> Listar()
        {
            var lista = new List<RegistrosModel>();

            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                string query = "SELECT * FROM equipos";

                SqlCommand cmd = new SqlCommand(query, con);

                con.Open();

                SqlDataReader dr = cmd.ExecuteReader();

                while (dr.Read())
                {
                    lista.Add(new RegistrosModel
                    {
                        Id = Convert.ToInt32(dr["id"]),

                        Tipo_Equipo = dr["tipo_equipo"]?.ToString() ?? "",

                        Color = dr["color"]?.ToString(),
                        Modelo = dr["modelo"]?.ToString(),
                        Descripcion = dr["descripcion"]?.ToString(),

                        Precio = Convert.ToDecimal(dr["precio"]),

                        Fecha_Registro = Convert.ToDateTime(dr["fecha_registro"]),

                        Url_Equipo = dr["url_equipo"]?.ToString(),
                        Url1 = dr["url1"]?.ToString(),
                        Url2 = dr["url2"]?.ToString(),
                        Url3 = dr["url3"]?.ToString(),

                        Marca = dr["marca"]?.ToString(),
                        Codigo_Producto = dr["codigo_producto"]?.ToString(),

                        Precio_Antes = dr["precio_antes"] == DBNull.Value
                            ? null
                            : Convert.ToDecimal(dr["precio_antes"]),

                        Descuento = dr["descuento"] == DBNull.Value
                            ? null
                            : Convert.ToDecimal(dr["descuento"]),

                        Estado = dr["estado"]?.ToString(),

                        Usuario_Registra = dr["usuario_registra"]?.ToString()
                    });
                }
            }

            return lista;
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
                    usuario_registra
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
                    @usuario_registra
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

                con.Open();

                cmd.ExecuteNonQuery();
            }
        }
    }
}