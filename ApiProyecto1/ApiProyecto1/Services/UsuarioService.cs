using ApiProyecto1.Models;
using Microsoft.Data.SqlClient;

namespace ApiProyecto1.Services
{
    public class UsuarioService
    {
        private readonly string _connectionString;

        public UsuarioService(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        // 🔹 GET por usuario
        public UsuarioModel ObtenerPorUsuario(string usuario)
        {
            UsuarioModel user = null;

            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                string query = @"SELECT 
                                    id,
                                    nombres,
                                    apellidos,
                                    usuario,
                                    password,
                                    perfil,
                                    estado,
                                    fecha_registro,
                                    usuario_actualiza,
                                    fecha_actualiza
                                 FROM usuarios
                                 WHERE usuario = @usuario";

                SqlCommand cmd = new SqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@usuario", usuario);

                conn.Open();

                SqlDataReader reader = cmd.ExecuteReader();

                if (reader.Read())
                {
                    user = new UsuarioModel
                    {
                        Id = Convert.ToInt32(reader["id"]),
                        Nombres = reader["nombres"].ToString(),
                        Apellidos = reader["apellidos"].ToString(),
                        Usuario = reader["usuario"].ToString(),
                        Password = reader["password"].ToString(),
                        Perfil = reader["perfil"].ToString(),

                        Estado = reader["estado"].ToString(),

                        Fecha_Registro = Convert.ToDateTime(reader["fecha_registro"]),

                        Usuario_Actualiza = reader["usuario_actualiza"] == DBNull.Value
                            ? null
                            : reader["usuario_actualiza"].ToString(),

                        Fecha_Actualiza = reader["fecha_actualiza"] == DBNull.Value
                            ? null
                            : (DateTime?)reader["fecha_actualiza"]
                    };
                }
            }

            return user;
        }

        // 🟢 POST - crear usuario
        public bool CrearUsuario(UsuarioModel usuario)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                string query = @"INSERT INTO usuarios 
                                (nombres, apellidos, usuario, password, perfil, estado, fecha_registro, usuario_actualiza, fecha_actualiza)
                                VALUES
                                (@nombres, @apellidos, @usuario, @password, @perfil, @estado, GETDATE(), @usuario_actualiza, GETDATE())";

                SqlCommand cmd = new SqlCommand(query, conn);

                cmd.Parameters.AddWithValue("@nombres", usuario.Nombres);
                cmd.Parameters.AddWithValue("@apellidos", usuario.Apellidos);
                cmd.Parameters.AddWithValue("@usuario", usuario.Usuario);
                cmd.Parameters.AddWithValue("@password", usuario.Password);
                cmd.Parameters.AddWithValue("@perfil", usuario.Perfil);

                // string: activo / desactivado
                cmd.Parameters.AddWithValue("@estado", usuario.Estado);

                cmd.Parameters.AddWithValue("@usuario_actualiza",
                    usuario.Usuario_Actualiza ?? "system");

                conn.Open();
                int rows = cmd.ExecuteNonQuery();

                return rows > 0;
            }
        }

        // 🟡 PUT - editar usuario
        public bool EditarParcial(int id, UsuarioModel usuario)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                string query = @"UPDATE usuarios 
                         SET 
                             nombres = COALESCE(@nombres, nombres),
                             apellidos = COALESCE(@apellidos, apellidos),
                             usuario = COALESCE(@usuario, usuario),
                             password = COALESCE(@password, password),
                             perfil = COALESCE(@perfil, perfil),
                             estado = COALESCE(@estado, estado),
                             usuario_actualiza = @usuario_actualiza,
                             fecha_actualiza = GETDATE()
                         WHERE id = @id";

                SqlCommand cmd = new SqlCommand(query, conn);

                cmd.Parameters.AddWithValue("@id", id);

                cmd.Parameters.AddWithValue("@nombres", (object?)usuario.Nombres ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@apellidos", (object?)usuario.Apellidos ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@usuario", (object?)usuario.Usuario ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@password", (object?)usuario.Password ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@perfil", (object?)usuario.Perfil ?? DBNull.Value);

                cmd.Parameters.AddWithValue("@estado",
    (object?)usuario.Estado ?? DBNull.Value);

                cmd.Parameters.AddWithValue("@usuario_actualiza",
                    usuario.Usuario_Actualiza ?? "system");

                conn.Open();
                int rows = cmd.ExecuteNonQuery();

                return rows > 0;
            }
        }

        public bool EliminarUsuario(int id)
        {
            using (SqlConnection conn = new SqlConnection(_connectionString))
            {
                string query = @"DELETE FROM usuarios WHERE id = @id";

                SqlCommand cmd = new SqlCommand(query, conn);
                cmd.Parameters.AddWithValue("@id", id);

                conn.Open();
                int rows = cmd.ExecuteNonQuery();

                return rows > 0;
            }
        }
    }
}