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
                        Url_Equipo = dr["url_equipo"].ToString()
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
                (tipo_equipo, color, modelo, descripcion, precio, fecha_registro, url_equipo)
                VALUES
                (@tipo, @color, @modelo, @descripcion, @precio, GETDATE(), @url)";

                SqlCommand cmd = new SqlCommand(query, con);

                cmd.Parameters.AddWithValue("@tipo", model.Tipo_Equipo);
                cmd.Parameters.AddWithValue("@color", model.Color ?? "");
                cmd.Parameters.AddWithValue("@modelo", model.Modelo ?? "");
                cmd.Parameters.AddWithValue("@descripcion", model.Descripcion ?? "");
                cmd.Parameters.AddWithValue("@precio", model.Precio);
                cmd.Parameters.AddWithValue("@url", model.Url_Equipo ?? "");

                con.Open();
                cmd.ExecuteNonQuery();
            }
        }
    }
}
