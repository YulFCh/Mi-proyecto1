
using ApiProyecto1.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace ApiProyecto1.Services
{
    public class RegistroPromocionesService
    {
        private readonly string _connectionString;

        public RegistroPromocionesService(IConfiguration config)
        {
            _connectionString =
                config.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException(
                    "No se encontró DefaultConnection.");
        }


        // ============================================
        // INSERTAR IMAGEN PROMOCIONAL
        // ============================================
        public void Insertar(RegistroPromocionesModel model)
        {
            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                string query = @"
            INSERT INTO dbo.ImagenesPromocionales
            (
                url_imagen_prom,
                fila_prom,
                orden_prom,
                enlace_prom,
                activo_prom,
                usuaregist_prom,
                fechregist_prom
            )
            VALUES
            (
                @url,
                @fila,
                @orden,
                @enlace,
                @activo,
                @usuario,
                SYSDATETIME()
            );";

                using (SqlCommand cmd = new SqlCommand(query, con))
                {
                    cmd.Parameters.Add("@url", SqlDbType.VarChar, 500)
                        .Value = model.Url_Imagen_Prom;

                    cmd.Parameters.Add("@fila", SqlDbType.Int)
                        .Value = model.Fila_Prom;

                    cmd.Parameters.Add("@orden", SqlDbType.Int)
                        .Value = model.Orden_Prom;

                    cmd.Parameters.Add("@enlace", SqlDbType.VarChar, 500)
                        .Value = (object?)model.Enlace_Prom ?? DBNull.Value;

                    cmd.Parameters.Add("@activo", SqlDbType.Bit)
                        .Value = model.Activo_Prom;

                    cmd.Parameters.Add("@usuario", SqlDbType.VarChar, 100)
                        .Value = (object?)model.Usuaregist_Prom ?? DBNull.Value;

                    con.Open();
                    cmd.ExecuteNonQuery();
                }
            }
        }

        // ============================================
        // LISTAR IMÁGENES PROMOCIONALES
        // ============================================
        public List<RegistroPromocionesModel> Listar()
        {
            var imagenes = new List<RegistroPromocionesModel>();

            using (SqlConnection con =
                   new SqlConnection(_connectionString))
            {
                string query = @"
                    SELECT
                        id_prom,
                        url_imagen_prom,
                        fila_prom,
                        orden_prom,
                        enlace_prom,
                        activo_prom,
                        usuaregist_prom,
                        fechregist_prom,
                        usuarmodif_prom,
                        fechmodif_prom
                    FROM dbo.ImagenesPromocionales
                    ORDER BY fila_prom, orden_prom, id_prom;";

                using (SqlCommand cmd = new SqlCommand(query, con))
                {
                    con.Open();

                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            imagenes.Add(new RegistroPromocionesModel
                            {
                                Id_Prom = Convert.ToInt32(
                                    dr["id_prom"]),

                                Url_Imagen_Prom =
                                    dr["url_imagen_prom"].ToString()
                                    ?? "",

                                Fila_Prom = Convert.ToInt32(
                                    dr["fila_prom"]),

                                Orden_Prom = Convert.ToInt32(
                                    dr["orden_prom"]),

                                Enlace_Prom =
                                    dr["enlace_prom"] == DBNull.Value
                                    ? null
                                    : dr["enlace_prom"].ToString(),

                                Activo_Prom = Convert.ToBoolean(
                                    dr["activo_prom"]),

                                Usuaregist_Prom =
                                    dr["usuaregist_prom"] == DBNull.Value
                                    ? null
                                    : dr["usuaregist_prom"].ToString(),

                                Fechregist_Prom =
                                    Convert.ToDateTime(
                                        dr["fechregist_prom"]),

                                Usuarmodif_Prom =
                                    dr["usuarmodif_prom"] == DBNull.Value
                                    ? null
                                    : dr["usuarmodif_prom"].ToString(),

                                Fechmodif_Prom =
                                    dr["fechmodif_prom"] == DBNull.Value
                                    ? null
                                    : Convert.ToDateTime(
                                        dr["fechmodif_prom"])
                            });
                        }
                    }
                }
            }

            return imagenes;
        }

        // ============================================
        // OBTENER UNA IMAGEN POR ID
        // ============================================
        public RegistroPromocionesModel? ObtenerPorId(int id)
        {
            using (SqlConnection con =
                   new SqlConnection(_connectionString))
            {
                string query = @"
                    SELECT
                        id_prom,
                        url_imagen_prom,
                        fila_prom,
                        orden_prom,
                        enlace_prom,
                        activo_prom,
                        usuaregist_prom,
                        fechregist_prom,
                        usuarmodif_prom,
                        fechmodif_prom
                    FROM dbo.ImagenesPromocionales
                    WHERE id_prom = @id;";

                using (SqlCommand cmd = new SqlCommand(query, con))
                {
                    cmd.Parameters.Add("@id", SqlDbType.Int).Value = id;

                    con.Open();

                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        if (!dr.Read())
                            return null;

                        return new RegistroPromocionesModel
                        {
                            Id_Prom = Convert.ToInt32(
                                dr["id_prom"]),

                            Url_Imagen_Prom =
                                dr["url_imagen_prom"].ToString() ?? "",

                            Fila_Prom = Convert.ToInt32(
                                dr["fila_prom"]),

                            Orden_Prom = Convert.ToInt32(
                                dr["orden_prom"]),

                            Enlace_Prom =
                                dr["enlace_prom"] == DBNull.Value
                                ? null
                                : dr["enlace_prom"].ToString(),

                            Activo_Prom = Convert.ToBoolean(
                                dr["activo_prom"]),

                            Usuaregist_Prom =
                                dr["usuaregist_prom"] == DBNull.Value
                                ? null
                                : dr["usuaregist_prom"].ToString(),

                            Fechregist_Prom = Convert.ToDateTime(
                                dr["fechregist_prom"]),

                            Usuarmodif_Prom =
                                dr["usuarmodif_prom"] == DBNull.Value
                                ? null
                                : dr["usuarmodif_prom"].ToString(),

                            Fechmodif_Prom =
                                dr["fechmodif_prom"] == DBNull.Value
                                ? null
                                : Convert.ToDateTime(
                                    dr["fechmodif_prom"])
                        };
                    }
                }
            }
        }

        // ============================================
        // EDITAR IMAGEN PROMOCIONAL
        // ============================================
        public bool Actualizar(RegistroPromocionesModel model)
        {
            using (SqlConnection con =
                   new SqlConnection(_connectionString))
            {
                string query = @"
                    UPDATE dbo.ImagenesPromocionales
                    SET
                        url_imagen_prom = @url,
                        fila_prom = @fila,
                        orden_prom = @orden,
                        enlace_prom = @enlace,
                        activo_prom = @activo,
                        usuarmodif_prom = @usuario,
                        fechmodif_prom = SYSDATETIME()
                    WHERE id_prom = @id;";

                using (SqlCommand cmd = new SqlCommand(query, con))
                {
                    cmd.Parameters.Add("@id", SqlDbType.Int)
                        .Value = model.Id_Prom;

                    cmd.Parameters.Add("@url", SqlDbType.VarChar, 500)
                        .Value = model.Url_Imagen_Prom;

                    cmd.Parameters.Add("@fila", SqlDbType.Int)
                        .Value = model.Fila_Prom;

                    cmd.Parameters.Add("@orden", SqlDbType.Int)
                        .Value = model.Orden_Prom;

                    cmd.Parameters.Add("@enlace", SqlDbType.VarChar, 500)
                        .Value = (object?)model.Enlace_Prom
                                 ?? DBNull.Value;

                    cmd.Parameters.Add("@activo", SqlDbType.Bit)
                        .Value = model.Activo_Prom;

                    cmd.Parameters.Add("@usuario", SqlDbType.VarChar, 100)
                        .Value = (object?)model.Usuarmodif_Prom
                                 ?? DBNull.Value;

                    con.Open();

                    return cmd.ExecuteNonQuery() > 0;
                }
            }
        }
    }
}