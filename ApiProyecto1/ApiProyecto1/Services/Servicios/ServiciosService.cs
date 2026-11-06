using ApiProyecto1.Models.Servicios;
using Microsoft.Data.SqlClient;
using System.Data;

namespace ApiProyecto1.Services.Servicios
{
    public class ServiciosService
    {
        private readonly string _connectionString;
        private readonly CloudinaryService _cloudinary;
        private readonly ILogger<ServiciosService> _logger;


        public ServiciosService(IConfiguration config, CloudinaryService cloudinary,
    ILogger<ServiciosService> logger)
        {
            _connectionString = config.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException(
                    "No se encontró DefaultConnection.");
            _cloudinary = cloudinary;
            _logger = logger;
        }

        // ==========================================
        // LISTAR SERVICIOS CON SUS FOTOGRAFÍAS
        // ==========================================

        public List<ListarServiciosModel> Listar()
        {
            var servicios = new List<ListarServiciosModel>();

            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                string query = @"
                    SELECT
                        IdServicio,
                        Titulo,
                        Resumen,
                        Descripcion,
                        Icono,
                        OrdenServicio,
                        Estado,
                        FechRegist,
                        UsuaRegist,
                        FechModif,
                        UsuarModif
                    FROM Servicios
                    ORDER BY OrdenServicio ASC, IdServicio ASC;

                    SELECT
                        IdImagen,
                        IdServicio,
                        UrlImagen,
                        PublicId,
                        DescImagen,
                        OrdenFoto
                    FROM ServicioImagenes
                    ORDER BY IdServicio, OrdenFoto;
                ";

                using (SqlCommand cmd = new SqlCommand(query, con))
                {
                    con.Open();

                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        // SERVICIOS
                        while (dr.Read())
                        {
                            servicios.Add(new ListarServiciosModel
                            {
                                IdServicio = Convert.ToInt32(dr["IdServicio"]),
                                Titulo = dr["Titulo"].ToString() ?? "",
                                Resumen = dr["Resumen"] == DBNull.Value
                                    ? null : dr["Resumen"].ToString(),
                                Descripcion = dr["Descripcion"] == DBNull.Value
                                    ? null : dr["Descripcion"].ToString(),
                                Icono = dr["Icono"] == DBNull.Value
                                    ? null : dr["Icono"].ToString(),
                                OrdenServicio = Convert.ToInt32(dr["OrdenServicio"]),
                                Estado = Convert.ToBoolean(dr["Estado"]),
                                FechRegist = Convert.ToDateTime(dr["FechRegist"]),
                                UsuaRegist = dr["UsuaRegist"].ToString() ?? "",
                                FechModif = dr["FechModif"] == DBNull.Value
                                    ? null : Convert.ToDateTime(dr["FechModif"]),
                                UsuarModif = dr["UsuarModif"] == DBNull.Value
                                    ? null : dr["UsuarModif"].ToString()
                            });
                        }

                        // FOTOGRAFÍAS
                        dr.NextResult();

                        while (dr.Read())
                        {
                            int idServicio = Convert.ToInt32(dr["IdServicio"]);

                            var servicio = servicios.FirstOrDefault(
                                x => x.IdServicio == idServicio);

                            if (servicio != null)
                            {
                                servicio.Imagenes.Add(new ServicioImagenModel
                                {
                                    IdImagen = Convert.ToInt32(dr["IdImagen"]),
                                    UrlImagen = dr["UrlImagen"].ToString() ?? "",
                                    PublicId = dr["PublicId"] == DBNull.Value
                                        ? null : dr["PublicId"].ToString(),
                                    DescImagen = dr["DescImagen"] == DBNull.Value
                                        ? null : dr["DescImagen"].ToString(),
                                    OrdenFoto = Convert.ToInt32(dr["OrdenFoto"])
                                });
                            }
                        }
                    }
                }
            }

            return servicios;
        }

        // ==========================================
        // INSERTAR SERVICIO
        // ==========================================

        public int Insertar(GuardarServicioModel model)
        {
            ValidarModelo(model);

            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                con.Open();

                using (SqlTransaction trans = con.BeginTransaction())
                {
                    try
                    {
                        string query = @"
                            INSERT INTO Servicios
                            (
                                Titulo,
                                Resumen,
                                Descripcion,
                                Icono,
                                OrdenServicio,
                                Estado,
                                UsuaRegist
                            )
                            OUTPUT INSERTED.IdServicio
                            VALUES
                            (
                                @Titulo,
                                @Resumen,
                                @Descripcion,
                                @Icono,
                                @OrdenServicio,
                                @Estado,
                                @Usuario
                            );
                        ";

                        int idServicio;

                        using (SqlCommand cmd = new SqlCommand(query, con, trans))
                        {
                            AgregarParametrosServicio(cmd, model);

                            idServicio = Convert.ToInt32(cmd.ExecuteScalar());
                        }

                        InsertarImagenes(con, trans, idServicio, model.Imagenes);

                        trans.Commit();

                        return idServicio;
                    }
                    catch
                    {
                        trans.Rollback();
                        throw;
                    }
                }
            }
        }

        // ==========================================
        // EDITAR SERVICIO
        // ==========================================

        public async Task<bool> EditarAsync(
            int id,
            GuardarServicioModel model,
            CancellationToken cancellationToken = default)
        {
            ValidarModelo(model);

            var publicIdsAnteriores = new List<string>();

            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                await con.OpenAsync(cancellationToken);

                using (SqlTransaction trans = con.BeginTransaction())
                {
                    try
                    {
                        // Obtener los PublicId de las fotografías anteriores.
                        string consultarImagenes = @"
                    SELECT PublicId
                    FROM ServicioImagenes
                    WHERE IdServicio = @IdServicio
                      AND PublicId IS NOT NULL;
                ";

                        using (SqlCommand cmd = new SqlCommand(
                            consultarImagenes, con, trans))
                        {
                            cmd.Parameters.Add("@IdServicio", SqlDbType.Int).Value = id;

                            using (SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken))
                            {
                                while (await dr.ReadAsync(cancellationToken))
                                {
                                    string publicId = dr["PublicId"].ToString() ?? "";

                                    if (!string.IsNullOrWhiteSpace(publicId))
                                        publicIdsAnteriores.Add(publicId);
                                }
                            }
                        }

                        // Actualizar el servicio.
                        string query = @"
                    UPDATE Servicios
                    SET
                        Titulo = @Titulo,
                        Resumen = @Resumen,
                        Descripcion = @Descripcion,
                        Icono = @Icono,
                        OrdenServicio = @OrdenServicio,
                        Estado = @Estado,
                        FechModif = GETDATE(),
                        UsuarModif = @Usuario
                    WHERE IdServicio = @IdServicio;
                ";

                        int filas;

                        using (SqlCommand cmd = new SqlCommand(query, con, trans))
                        {
                            AgregarParametrosServicio(cmd, model);

                            cmd.Parameters.Add("@IdServicio", SqlDbType.Int).Value = id;

                            filas = await cmd.ExecuteNonQueryAsync(cancellationToken);
                        }

                        if (filas == 0)
                        {
                            trans.Rollback();
                            return false;
                        }

                        // Reemplazar la galería anterior.
                        string eliminar = @"
                    DELETE FROM ServicioImagenes
                    WHERE IdServicio = @IdServicio;
                ";

                        using (SqlCommand cmd = new SqlCommand(eliminar, con, trans))
                        {
                            cmd.Parameters.Add("@IdServicio", SqlDbType.Int).Value = id;
                            await cmd.ExecuteNonQueryAsync(cancellationToken);
                        }

                        // Insertar las fotografías recibidas.
                        InsertarImagenes(con, trans, id, model.Imagenes);

                        trans.Commit();
                    }
                    catch
                    {
                        trans.Rollback();
                        throw;
                    }
                }
            }

            // Identificar las fotografías que se conservaron.
            var publicIdsConservados = new HashSet<string>(
                model.Imagenes
                    .Where(x => !string.IsNullOrWhiteSpace(x.PublicId))
                    .Select(x => x.PublicId!),
                StringComparer.OrdinalIgnoreCase
            );

            // Eliminar de Cloudinary solamente las fotografías retiradas.
            var publicIdsEliminar = publicIdsAnteriores
                .Where(x => !publicIdsConservados.Contains(x))
                .Distinct(StringComparer.OrdinalIgnoreCase);

            foreach (var publicId in publicIdsEliminar)
            {
                try
                {
                    await _cloudinary.EliminarImagenAsync(
                        publicId,
                        cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "No se pudo eliminar la imagen {PublicId} de Cloudinary.",
                        publicId);
                }
            }

            return true;
        }

        // ==========================================
        // INSERTAR FOTOGRAFÍAS
        // ==========================================

        private void InsertarImagenes(
            SqlConnection con,
            SqlTransaction trans,
            int idServicio,
            List<ServicioImagenModel> imagenes)
        {
            string query = @"
                INSERT INTO ServicioImagenes
                (
                    IdServicio,
                    UrlImagen,
                    PublicId,
                    DescImagen,
                    OrdenFoto
                )
                VALUES
                (
                    @IdServicio,
                    @UrlImagen,
                    @PublicId,
                    @DescImagen,
                    @OrdenFoto
                );
            ";

            foreach (var imagen in imagenes)
            {
                using (SqlCommand cmd = new SqlCommand(query, con, trans))
                {
                    cmd.Parameters.Add("@IdServicio", SqlDbType.Int).Value =
                        idServicio;

                    cmd.Parameters.Add("@UrlImagen", SqlDbType.NVarChar, 500).Value =
                        imagen.UrlImagen;
                    cmd.Parameters.Add("@PublicId", SqlDbType.NVarChar, 200).Value =
                        (object?)imagen.PublicId ?? DBNull.Value;
                    cmd.Parameters.Add("@DescImagen", SqlDbType.NVarChar, 200).Value =
                        (object?)imagen.DescImagen ?? DBNull.Value;

                    cmd.Parameters.Add("@OrdenFoto", SqlDbType.Int).Value =
                        imagen.OrdenFoto;

                    cmd.ExecuteNonQuery();
                }
            }
        }

        // ==========================================
        // PARÁMETROS DEL SERVICIO
        // ==========================================

        private void AgregarParametrosServicio(
            SqlCommand cmd,
            GuardarServicioModel model)
        {
            cmd.Parameters.Add("@Titulo", SqlDbType.NVarChar, 150).Value =
                model.Titulo.Trim();

            cmd.Parameters.Add("@Resumen", SqlDbType.NVarChar, 250).Value =
                (object?)model.Resumen ?? DBNull.Value;

            cmd.Parameters.Add("@Descripcion", SqlDbType.NVarChar, -1).Value =
                (object?)model.Descripcion ?? DBNull.Value;

            cmd.Parameters.Add("@Icono", SqlDbType.NVarChar, 100).Value =
                (object?)model.Icono ?? DBNull.Value;

            cmd.Parameters.Add("@OrdenServicio", SqlDbType.Int).Value =
                model.OrdenServicio;

            cmd.Parameters.Add("@Estado", SqlDbType.Bit).Value =
                model.Estado;

            cmd.Parameters.Add("@Usuario", SqlDbType.NVarChar, 100).Value =
                model.Usuario.Trim();
        }

        // ==========================================
        // VALIDACIONES
        // ==========================================

        private void ValidarModelo(GuardarServicioModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Titulo))
                throw new ArgumentException("El título es obligatorio.");

            if (model.Titulo.Trim().Length > 150)
                throw new ArgumentException("El título no puede superar 150 caracteres.");

            if (string.IsNullOrWhiteSpace(model.Usuario))
                throw new ArgumentException("El usuario es obligatorio.");

            if (model.Usuario.Trim().Length > 100)
                throw new ArgumentException("El usuario no puede superar 100 caracteres.");

            if (model.Imagenes == null)
                throw new ArgumentException("La lista de imágenes no es válida.");

            if (model.Imagenes.Count > 15)
                throw new ArgumentException("Solo se permiten 15 fotografías por servicio.");

            if (model.Imagenes.Any(x =>
                string.IsNullOrWhiteSpace(x.UrlImagen) ||
                x.UrlImagen.Length > 500))
            {
                throw new ArgumentException("Cada fotografía debe tener una URL válida de máximo 500 caracteres.");
            }

            if (model.Imagenes.Any(x =>
                x.DescImagen?.Length > 200))
            {
                throw new ArgumentException("La descripción de una fotografía no puede superar 200 caracteres.");
            }

            if (model.Imagenes.Any(x => x.OrdenFoto <= 0))
                throw new ArgumentException("El orden de las fotografías debe ser mayor que cero.");

            if (model.Imagenes.Select(x => x.OrdenFoto).Distinct().Count()
                != model.Imagenes.Count)
            {
                throw new ArgumentException("No se puede repetir el orden de las fotografías.");
            }
        }


        public async Task<bool> EliminarAsync(
    int id,
    CancellationToken cancellationToken = default)
        {
            var publicIds = new List<string>();

            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                await con.OpenAsync(cancellationToken);

                using (SqlTransaction trans = con.BeginTransaction())
                {
                    try
                    {
                        // Obtener las fotografías del servicio.
                        string consultar = @"
                    SELECT PublicId
                    FROM ServicioImagenes
                    WHERE IdServicio = @IdServicio
                      AND PublicId IS NOT NULL;
                ";

                        using (SqlCommand cmd = new SqlCommand(consultar, con, trans))
                        {
                            cmd.Parameters.Add("@IdServicio", SqlDbType.Int).Value = id;

                            using (SqlDataReader dr = await cmd.ExecuteReaderAsync(cancellationToken))
                            {
                                while (await dr.ReadAsync(cancellationToken))
                                {
                                    string publicId = dr["PublicId"].ToString() ?? "";

                                    if (!string.IsNullOrWhiteSpace(publicId))
                                        publicIds.Add(publicId);
                                }
                            }
                        }

                        // Eliminar el servicio.
                        string eliminar = @"
                    DELETE FROM Servicios
                    WHERE IdServicio = @IdServicio;
                ";

                        int filas;

                        using (SqlCommand cmd = new SqlCommand(eliminar, con, trans))
                        {
                            cmd.Parameters.Add("@IdServicio", SqlDbType.Int).Value = id;

                            filas = await cmd.ExecuteNonQueryAsync(cancellationToken);
                        }

                        if (filas == 0)
                        {
                            trans.Rollback();
                            return false;
                        }

                        // Las fotografías se eliminan de SQL por ON DELETE CASCADE.
                        trans.Commit();
                    }
                    catch
                    {
                        trans.Rollback();
                        throw;
                    }
                }
            }

            // Eliminar las fotografías de Cloudinary.
            foreach (var publicId in publicIds.Distinct(StringComparer.OrdinalIgnoreCase))
            {
                try
                {
                    await _cloudinary.EliminarImagenAsync(
                        publicId,
                        cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "No se pudo eliminar la imagen {PublicId} de Cloudinary.",
                        publicId);
                }
            }

            return true;
        }

    }
}