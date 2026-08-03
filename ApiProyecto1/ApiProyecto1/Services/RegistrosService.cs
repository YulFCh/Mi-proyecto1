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
        public List<RegistrosModel> Listar()
        {
            var lista = new List<RegistrosModel>();

            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                string query = @"
            SELECT 
                MIN(id) AS id,
                marca,
                modelo,
                tipo_equipo,
                MIN(descripcion) AS descripcion,
                MIN(precio) AS precio,
                MIN(fecha_registro) AS fecha_registro,
                MIN(url_equipo) AS url_equipo,
                MIN(url1) AS url1,
                MIN(url2) AS url2,
                MIN(url3) AS url3,
                MIN(codigo_producto) AS codigo_producto,
                MIN(precio_antes) AS precio_antes,
                MIN(descuento) AS descuento,
                MIN(estado) AS estado,
                MIN(usuario_registra) AS usuario_registra,
                MIN(descripcion1) AS descripcion1,
                MIN(garantia) AS garantia,
                STRING_AGG(color, ', ') WITHIN GROUP (ORDER BY color) AS color,
                (
                    SELECT id, color, url_equipo, url1, url2, url3, precio, codigo_producto, stock
                    FROM equipos e2 
                    WHERE e2.marca = equipos.marca 
                      AND e2.modelo = equipos.modelo 
                      AND e2.tipo_equipo = equipos.tipo_equipo
                    FOR JSON PATH
                ) AS variantes_json
            FROM equipos
            GROUP BY marca, modelo, tipo_equipo";

                SqlCommand cmd = new SqlCommand(query, con);
                con.Open();
                SqlDataReader dr = cmd.ExecuteReader();

                while (dr.Read())
                {
                    var registro = new RegistrosModel
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
                        Precio_Antes = dr["precio_antes"] == DBNull.Value ? null : Convert.ToDecimal(dr["precio_antes"]),
                        Descuento = dr["descuento"] == DBNull.Value ? null : Convert.ToDecimal(dr["descuento"]),
                        Estado = dr["estado"]?.ToString(),
                        Usuario_Registra = dr["usuario_registra"]?.ToString(),
                        Descripcion1 = dr["descripcion1"] == DBNull.Value ? null : dr["descripcion1"].ToString(),
                        Garantia = dr["garantia"] == DBNull.Value ? null : dr["garantia"].ToString()
                    };

                    // Parseamos el JSON de variantes usando el serializador nativo de C#
                    string jsonVariantes = dr["variantes_json"]?.ToString();
                    if (!string.IsNullOrEmpty(jsonVariantes))
                    {
                        registro.Variantes = System.Text.Json.JsonSerializer.Deserialize<List<VarianteModel>>(jsonVariantes, new System.Text.Json.JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        });
                    }

                    lista.Add(registro);
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