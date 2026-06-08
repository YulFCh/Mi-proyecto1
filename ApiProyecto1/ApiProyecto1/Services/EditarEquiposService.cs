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

        public void Patch(int id, EditarEquiposModel model)
        {
            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                List<string> campos = new List<string>();
                SqlCommand cmd = new SqlCommand();
                cmd.Connection = con;

                if (model.Tipo_Equipo != null)
                {
                    campos.Add("tipo_equipo = @tipo");
                    cmd.Parameters.AddWithValue("@tipo", model.Tipo_Equipo);
                }

                if (model.Color != null)
                {
                    campos.Add("color = @color");
                    cmd.Parameters.AddWithValue("@color", model.Color);
                }

                if (model.Modelo != null)
                {
                    campos.Add("modelo = @modelo");
                    cmd.Parameters.AddWithValue("@modelo", model.Modelo);
                }

                if (model.Descripcion != null)
                {
                    campos.Add("descripcion = @descripcion");
                    cmd.Parameters.AddWithValue("@descripcion", model.Descripcion);
                }

                if (model.Precio.HasValue)
                {
                    campos.Add("precio = @precio");
                    cmd.Parameters.AddWithValue("@precio", model.Precio);
                }

                if (model.Url_Equipo != null)
                {
                    campos.Add("url_equipo = @url0");
                    cmd.Parameters.AddWithValue("@url0", model.Url_Equipo);
                }

                if (model.Url1 != null)
                {
                    campos.Add("url1 = @url1");
                    cmd.Parameters.AddWithValue("@url1", model.Url1);
                }

                if (model.Url2 != null)
                {
                    campos.Add("url2 = @url2");
                    cmd.Parameters.AddWithValue("@url2", model.Url2);
                }

                if (model.Url3 != null)
                {
                    campos.Add("url3 = @url3");
                    cmd.Parameters.AddWithValue("@url3", model.Url3);
                }

                if (model.Marca != null)
                {
                    campos.Add("marca = @marca");
                    cmd.Parameters.AddWithValue("@marca", model.Marca);
                }

                if (model.Codigo_Producto != null)
                {
                    campos.Add("codigo_producto = @codigo_producto");
                    cmd.Parameters.AddWithValue("@codigo_producto", model.Codigo_Producto);
                }

                if (model.Precio_Antes != null)
                {
                    campos.Add("precio_antes = @precio_antes");
                    cmd.Parameters.AddWithValue("@precio_antes", model.Precio_Antes);
                }

                if (model.Descuento != null)
                {
                    campos.Add("descuento = @descuento");
                    cmd.Parameters.AddWithValue("@descuento", model.Descuento);
                }

                if (model.Estado != null)
                {
                    campos.Add("estado = @estado");
                    cmd.Parameters.AddWithValue("@estado", model.Estado);
                }

                if (model.Usuario_Modifica != null)
                {
                    campos.Add("usuario_modifica = @usuario_modifica");
                    cmd.Parameters.AddWithValue("@usuario_modifica", model.Usuario_Modifica);
                }

                if (campos.Count == 0)
                    return;

                campos.Add("fecha_modifica = GETDATE()");

                string query = $"UPDATE equipos SET {string.Join(", ", campos)} WHERE id = @id";

                cmd.Parameters.AddWithValue("@id", id);
                cmd.CommandText = query;

                con.Open();
                cmd.ExecuteNonQuery();
            }
        }
    }
}