using ApiProyecto1.Models;
using Microsoft.Data.SqlClient;

namespace ApiProyecto1.Services
{
    public class EditarEquiposService
    {
        private readonly string _connectionString;

        public EditarEquiposService(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DefaultConnection");
        }

        public List<EditarEquiposModel> ObtenerVariantes(int id)
        {
            var variantes = new List<EditarEquiposModel>();

            using SqlConnection con =
                new SqlConnection(_connectionString);

            string query = @"
    SELECT
        e.id,
        e.tipo_equipo,
        e.color,
        e.modelo,
        e.descripcion,
        e.descripcion1,
        e.garantia,
        e.precio,
        e.url_equipo,
        e.url1,
        e.url2,
        e.url3,
        e.marca,
        e.codigo_producto,
        e.precio_antes,
        e.descuento,
        e.estado
    FROM equipos e
    INNER JOIN equipos base
        ON e.tipo_equipo = base.tipo_equipo
        AND e.marca = base.marca
        AND e.modelo = base.modelo
    WHERE base.id = @id
    ORDER BY e.id;
";

            using SqlCommand cmd =
                new SqlCommand(query, con);

            cmd.Parameters.Add(
                "@id",
                System.Data.SqlDbType.Int
            ).Value = id;

            con.Open();

            using SqlDataReader reader =
                cmd.ExecuteReader();

            while (reader.Read())
            {
                variantes.Add(new EditarEquiposModel
                {
                    Id = Convert.ToInt32(
                        reader["id"]
                    ),

                    Tipo_Equipo =
                        reader["tipo_equipo"]?.ToString(),

                    Color =
                        reader["color"]?.ToString(),

                    Modelo =
                        reader["modelo"]?.ToString(),

                    Descripcion =
                        reader["descripcion"]?.ToString(),

                    Descripcion1 =
                        reader["descripcion1"]?.ToString(),

                    Garantia =
                        reader["garantia"]?.ToString(),

                    Precio =
                        reader["precio"] == DBNull.Value
                            ? null
                            : Convert.ToDecimal(
                                reader["precio"]
                            ),

                    Url_Equipo =
                        reader["url_equipo"]?.ToString(),

                    Url1 =
                        reader["url1"]?.ToString(),

                    Url2 =
                        reader["url2"]?.ToString(),

                    Url3 =
                        reader["url3"]?.ToString(),

                    Marca =
                        reader["marca"]?.ToString(),

                    Codigo_Producto =
                        reader["codigo_producto"]?.ToString(),

                    Precio_Antes =
                        reader["precio_antes"] == DBNull.Value
                            ? null
                            : Convert.ToDecimal(
                                reader["precio_antes"]
                            ),

                    Descuento =
                        reader["descuento"] == DBNull.Value
                            ? null
                            : Convert.ToDecimal(
                                reader["descuento"]
                            ),

                    Estado =
                        reader["estado"]?.ToString()
                });
            }

            return variantes;
        }

        public void Patch(int id, EditarEquiposModel model)
        {
            using SqlConnection con = new SqlConnection(_connectionString);

            List<string> campos = new List<string>();
            SqlCommand cmd = new SqlCommand();
            cmd.Connection = con;

            if (model.Tipo_Equipo != null)
            {
                campos.Add("tipo_equipo = @tipo");
                cmd.Parameters.Add("@tipo", System.Data.SqlDbType.VarChar).Value = model.Tipo_Equipo;
            }

            if (model.Color != null)
            {
                campos.Add("color = @color");
                cmd.Parameters.Add("@color", System.Data.SqlDbType.VarChar).Value = model.Color;
            }

            if (model.Modelo != null)
            {
                campos.Add("modelo = @modelo");
                cmd.Parameters.Add("@modelo", System.Data.SqlDbType.VarChar).Value = model.Modelo;
            }

            if (model.Descripcion != null)
            {
                campos.Add("descripcion = @descripcion");
                cmd.Parameters.Add("@descripcion", System.Data.SqlDbType.VarChar).Value = model.Descripcion;
            }

            if (model.Descripcion1 != null)
            {
                campos.Add("descripcion1 = @descripcion1");
                cmd.Parameters.Add("@descripcion1", System.Data.SqlDbType.VarChar).Value = model.Descripcion1;
            }

            
            if (model.Garantia != null)
            {
                campos.Add("garantia = @garantia");
                cmd.Parameters.Add("@garantia", System.Data.SqlDbType.VarChar).Value = model.Garantia;
            }

            if (model.Precio.HasValue)
            {
                campos.Add("precio = @precio");
                cmd.Parameters.Add("@precio", System.Data.SqlDbType.Decimal).Value = model.Precio;
            }

            if (model.Url_Equipo != null)
            {
                campos.Add("url_equipo = @url0");
                cmd.Parameters.Add("@url0", System.Data.SqlDbType.VarChar).Value = model.Url_Equipo;
            }

            if (model.Url1 != null)
            {
                campos.Add("url1 = @url1");
                cmd.Parameters.Add("@url1", System.Data.SqlDbType.VarChar).Value = model.Url1;
            }

            if (model.Url2 != null)
            {
                campos.Add("url2 = @url2");
                cmd.Parameters.Add("@url2", System.Data.SqlDbType.VarChar).Value = model.Url2;
            }

            if (model.Url3 != null)
            {
                campos.Add("url3 = @url3");
                cmd.Parameters.Add("@url3", System.Data.SqlDbType.VarChar).Value = model.Url3;
            }

            if (model.Marca != null)
            {
                campos.Add("marca = @marca");
                cmd.Parameters.Add("@marca", System.Data.SqlDbType.VarChar).Value = model.Marca;
            }

            if (model.Codigo_Producto != null)
            {
                campos.Add("codigo_producto = @codigo");
                cmd.Parameters.Add("@codigo", System.Data.SqlDbType.VarChar).Value = model.Codigo_Producto;
            }

            if (model.Precio_Antes.HasValue)
            {
                campos.Add("precio_antes = @precio_antes");
                cmd.Parameters.Add("@precio_antes", System.Data.SqlDbType.Decimal).Value = model.Precio_Antes;
            }

            if (model.Descuento.HasValue)
            {
                campos.Add("descuento = @descuento");
                cmd.Parameters.Add("@descuento", System.Data.SqlDbType.Decimal).Value = model.Descuento;
            }

            if (model.Estado != null)
            {
                campos.Add("estado = @estado");
                cmd.Parameters.Add("@estado", System.Data.SqlDbType.VarChar).Value = model.Estado;
            }

            if (model.Usuario_Modifica != null)
            {
                campos.Add("usuario_modifica = @usuario_modifica");
                cmd.Parameters.Add("@usuario_modifica", System.Data.SqlDbType.VarChar).Value = model.Usuario_Modifica;
            }

            if (campos.Count == 0)
                return;

            campos.Add("fecha_modifica = GETDATE()");

            string query = $"UPDATE equipos SET {string.Join(", ", campos)} WHERE id = @id";

            cmd.Parameters.Add("@id", System.Data.SqlDbType.Int).Value = id;
            cmd.CommandText = query;

            con.Open();
            cmd.ExecuteNonQuery();
        }
    }
}