using System.Data;
using System.Data.SqlClient;
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

        // 🔥 LISTAR EQUIPOS
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
                        Tipo_Equipo = dr["tipo_equipo"].ToString(),
                        Color = dr["color"].ToString(),
                        Modelo = dr["modelo"].ToString(),
                        Descripcion = dr["descripcion"].ToString(),
                        Precio = Convert.ToDecimal(dr["precio"]),
                        Fecha_Registro = Convert.ToDateTime(dr["fecha_registro"]),

                        Url_Equipo = dr["url_equipo"].ToString(),
                        Url1 = dr["url1"].ToString(),
                        Url2 = dr["url2"].ToString(),
                        Url3 = dr["url3"].ToString(),
                        Usuario_Registra = dr["usuario_registra"].ToString(),
                        Marca = dr["marca"].ToString(),
                        Codigo_Producto = dr["codigo_producto"].ToString(),
                        Precio_Antes = dr["precio_antes"].ToString(),
                        Descuento = dr["descuento"].ToString(),
                        Estado = dr["estado"].ToString(),
                        Fecha_Modifica = dr["fecha_modifica"].ToString()
                    });
                }
            }

            return lista;
        }

        // 🔥 INSERTAR EQUIPO
        public void Insertar(RegistrosModel model)
        {
            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                string query = @"
        INSERT INTO equipos
        (tipo_equipo, color, modelo, descripcion, precio, fecha_registro,
         url_equipo, url1, url2, url3, marca, codigo_producto, precio_antes,
         descuento, estado, usuario_registra)
        VALUES
        (@tipo, @color, @modelo, @descripcion, @precio, GETDATE(),
         @url0, @url1, @url2, @url3,  @marca, @codigo_producto, @precio_antes,
         @descuento, @estado, @usuario_registra)";

                SqlCommand cmd = new SqlCommand(query, con);

                cmd.Parameters.AddWithValue("@tipo", model.Tipo_Equipo);
                cmd.Parameters.AddWithValue("@color", model.Color ?? "");
                cmd.Parameters.AddWithValue("@modelo", model.Modelo ?? "");
                cmd.Parameters.AddWithValue("@descripcion", model.Descripcion ?? "");
                cmd.Parameters.AddWithValue("@precio", model.Precio);
                cmd.Parameters.AddWithValue("@url0", model.Url_Equipo ?? "");
                cmd.Parameters.AddWithValue("@url1", model.Url1 ?? "");
                cmd.Parameters.AddWithValue("@url2", model.Url2 ?? "");
                cmd.Parameters.AddWithValue("@url3", model.Url3 ?? "");
                cmd.Parameters.AddWithValue("@marca", model.Marca ?? "");
                cmd.Parameters.AddWithValue("@codigo_producto", model.Codigo_Producto ?? "");
                cmd.Parameters.AddWithValue("@precio_antes", model.Precio_Antes ?? "");
                cmd.Parameters.AddWithValue("@descuento", model.Descuento ?? "");
                cmd.Parameters.AddWithValue("@estado", model.Estado ?? "");
                cmd.Parameters.AddWithValue("@usuario_registra", model.Usuario_Registra ?? "");

                con.Open();
                cmd.ExecuteNonQuery();
            }
        }


    }
}
