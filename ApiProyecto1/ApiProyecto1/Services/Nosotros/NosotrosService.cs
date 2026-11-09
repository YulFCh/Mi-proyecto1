
using ApiProyecto1.Models.Nosotros;
using Microsoft.Data.SqlClient;
using System.Data;

namespace ApiProyecto1.Services.Nosotros
{
    public class NosotrosService
    {
        private readonly string _connectionString;
        private readonly CloudinaryNosotrosService _cloudinaryService;
        private readonly ILogger<NosotrosService> _logger;

        public NosotrosService(
            IConfiguration configuration,
            CloudinaryNosotrosService cloudinaryService,
            ILogger<NosotrosService> logger)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException(
                    "No se encontró la cadena de conexión DefaultConnection.");

            _cloudinaryService = cloudinaryService;
            _logger = logger;
        }

        // =====================================================
        // 1. LISTAR NOSOTROS
        // =====================================================

        public List<ListarNosotrosModel> Listar()
        {
            var nosotros = new List<ListarNosotrosModel>();

            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                string query = @"
                    SELECT
                        IdNosotros,
                        Titulo,
                        Resumen,
                        Descripcion,
                        Icono,
                        OrdenNosotros,
                        Estado,
                        FechRegist,
                        UsuaRegist,
                        FechModif,
                        UsuarModif
                    FROM Nosotros
                    ORDER BY OrdenNosotros ASC, IdNosotros ASC;

                    SELECT
                        IdImagen,
                        IdNosotros,
                        UrlImagen,
                        PublicId,
                        DescImagen,
                        OrdenFoto
                    FROM NosotrosImagenes
                    ORDER BY IdNosotros ASC, OrdenFoto ASC;
                ";

                using (SqlCommand cmd = new SqlCommand(query, con))
                {
                    con.Open();

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            nosotros.Add(new ListarNosotrosModel
                            {
                                IdNosotros = reader.GetInt32(0),
                                Titulo = reader.GetString(1),
                                Resumen = reader.IsDBNull(2) ? null : reader.GetString(2),
                                Descripcion = reader.IsDBNull(3) ? null : reader.GetString(3),
                                Icono = reader.IsDBNull(4) ? null : reader.GetString(4),
                                OrdenNosotros = reader.GetInt32(5),
                                Estado = reader.GetBoolean(6),
                                FechRegist = reader.GetDateTime(7),
                                UsuaRegist = reader.GetString(8),
                                FechModif = reader.IsDBNull(9) ? null : reader.GetDateTime(9),
                                UsuarModif = reader.IsDBNull(10) ? null : reader.GetString(10)
                            });
                        }

                        reader.NextResult();

                        while (reader.Read())
                        {
                            var imagen = new NosotrosImagenModel
                            {
                                IdImagen = reader.GetInt32(0),
                                IdNosotros = reader.GetInt32(1),
                                UrlImagen = reader.GetString(2),
                                PublicId = reader.IsDBNull(3) ? null : reader.GetString(3),
                                DescImagen = reader.IsDBNull(4) ? null : reader.GetString(4),
                                OrdenFoto = reader.GetInt32(5)
                            };

                            var apartado = nosotros.FirstOrDefault(
                                x => x.IdNosotros == imagen.IdNosotros);

                            apartado?.Imagenes.Add(imagen);
                        }
                    }
                }
            }

            return nosotros;
        }

        // =====================================================
        // 2. REGISTRAR NOSOTROS
        // =====================================================

        public int Insertar(RegistrarNosotrosModel model)
        {
            ValidarDatos(model);

            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                con.Open();

                using (SqlTransaction transaction = con.BeginTransaction())
                {
                    try
                    {
                        string query = @"
                            INSERT INTO Nosotros
                            (
                                Titulo,
                                Resumen,
                                Descripcion,
                                Icono,
                                OrdenNosotros,
                                Estado,
                                UsuaRegist
                            )
                            OUTPUT INSERTED.IdNosotros
                            VALUES
                            (
                                @titulo,
                                @resumen,
                                @descripcion,
                                @icono,
                                @orden,
                                @estado,
                                @usuario
                            );
                        ";

                        int idNosotros;

                        using (SqlCommand cmd = new SqlCommand(query, con, transaction))
                        {
                            AgregarParametrosNosotros(cmd, model);

                            idNosotros = (int)cmd.ExecuteScalar();
                        }

                        foreach (var imagen in model.Imagenes)
                        {
                            InsertarImagen(con, transaction, idNosotros, imagen);
                        }

                        transaction.Commit();

                        return idNosotros;
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }

        // =====================================================
        // 3. EDITAR NOSOTROS
        // =====================================================

        public async Task<bool> EditarAsync(
            int id,
            RegistrarNosotrosModel model)
        {
            ValidarDatos(model);

            var imagenesAnteriores = new Dictionary<int, string>();

            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                await con.OpenAsync();

                using (SqlTransaction transaction = con.BeginTransaction())
                {
                    try
                    {
                        string consultaImagenes = @"
                            SELECT IdImagen, PublicId
                            FROM NosotrosImagenes
                            WHERE IdNosotros = @id;
                        ";

                        using (SqlCommand cmd = new SqlCommand(
                            consultaImagenes, con, transaction))
                        {
                            cmd.Parameters.Add("@id", SqlDbType.Int).Value = id;

                            using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                            {
                                while (await reader.ReadAsync())
                                {
                                    imagenesAnteriores[reader.GetInt32(0)] =
                                        reader.IsDBNull(1) ? "" : reader.GetString(1);
                                }
                            }
                        }

                        string query = @"
                            UPDATE Nosotros
                            SET
                                Titulo = @titulo,
                                Resumen = @resumen,
                                Descripcion = @descripcion,
                                Icono = @icono,
                                OrdenNosotros = @orden,
                                Estado = @estado,
                                FechModif = GETDATE(),
                                UsuarModif = @usuario
                            WHERE IdNosotros = @id;
                        ";

                        using (SqlCommand cmd = new SqlCommand(query, con, transaction))
                        {
                            AgregarParametrosNosotros(cmd, model);

                            cmd.Parameters.Add("@id", SqlDbType.Int).Value = id;

                            cmd.Parameters["@usuario"].Value =
                                (object?)model.UsuarModif ?? DBNull.Value;

                            int filas = await cmd.ExecuteNonQueryAsync();

                            if (filas == 0)
                            {
                                transaction.Rollback();
                                return false;
                            }
                        }

                        // Eliminar los registros anteriores de imágenes.
                        string eliminarImagenes = @"
                            DELETE FROM NosotrosImagenes
                            WHERE IdNosotros = @id;
                        ";

                        using (SqlCommand cmd = new SqlCommand(
                            eliminarImagenes, con, transaction))
                        {
                            cmd.Parameters.Add("@id", SqlDbType.Int).Value = id;
                            await cmd.ExecuteNonQueryAsync();
                        }

                        var publicIdsConservados = new HashSet<string>(
                            StringComparer.OrdinalIgnoreCase);

                        foreach (var imagen in model.Imagenes)
                        {
                            // Si la imagen ya existía, conservar su PublicId original.
                            if (imagen.IdImagen > 0 &&
                                imagenesAnteriores.TryGetValue(
                                    imagen.IdImagen, out string? publicIdAnterior))
                            {
                                imagen.PublicId = publicIdAnterior;

                                if (!string.IsNullOrWhiteSpace(publicIdAnterior))
                                {
                                    publicIdsConservados.Add(publicIdAnterior);
                                }
                            }

                            InsertarImagen(con, transaction, id, imagen);
                        }

                        transaction.Commit();

                        // Eliminar de Cloudinary solamente las imágenes retiradas.
                        var publicIdsEliminar = imagenesAnteriores.Values
                            .Where(p => !string.IsNullOrWhiteSpace(p))
                            .Where(p => !publicIdsConservados.Contains(p))
                            .Distinct(StringComparer.OrdinalIgnoreCase)
                            .ToList();

                        foreach (var publicId in publicIdsEliminar)
                        {
                            try
                            {
                                await _cloudinaryService.EliminarImagenAsync(publicId);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(
                                    ex,
                                    "No se pudo eliminar la imagen de Cloudinary: {PublicId}",
                                    publicId);
                            }
                        }

                        return true;
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }

        // =====================================================
        // 4. ELIMINAR NOSOTROS
        // =====================================================

        public async Task<bool> EliminarAsync(int id)
        {
            var publicIds = new List<string>();

            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                await con.OpenAsync();

                using (SqlTransaction transaction = con.BeginTransaction())
                {
                    try
                    {
                        string consulta = @"
                            SELECT PublicId
                            FROM NosotrosImagenes
                            WHERE IdNosotros = @id;
                        ";

                        using (SqlCommand cmd = new SqlCommand(
                            consulta, con, transaction))
                        {
                            cmd.Parameters.Add("@id", SqlDbType.Int).Value = id;

                            using (SqlDataReader reader = await cmd.ExecuteReaderAsync())
                            {
                                while (await reader.ReadAsync())
                                {
                                    if (!reader.IsDBNull(0))
                                    {
                                        string publicId = reader.GetString(0);

                                        if (!string.IsNullOrWhiteSpace(publicId))
                                        {
                                            publicIds.Add(publicId);
                                        }
                                    }
                                }
                            }
                        }

                        string eliminar = @"
                            DELETE FROM Nosotros
                            WHERE IdNosotros = @id;
                        ";

                        int filas;

                        using (SqlCommand cmd = new SqlCommand(
                            eliminar, con, transaction))
                        {
                            cmd.Parameters.Add("@id", SqlDbType.Int).Value = id;

                            filas = await cmd.ExecuteNonQueryAsync();
                        }

                        if (filas == 0)
                        {
                            transaction.Rollback();
                            return false;
                        }

                        // NosotrosImagenes se elimina mediante ON DELETE CASCADE.
                        transaction.Commit();
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }

            // Limpiar las fotografías de Cloudinary después del commit.
            foreach (var publicId in publicIds.Distinct(
                StringComparer.OrdinalIgnoreCase))
            {
                try
                {
                    await _cloudinaryService.EliminarImagenAsync(publicId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "No se pudo eliminar la imagen de Cloudinary: {PublicId}",
                        publicId);
                }
            }

            return true;
        }

        // =====================================================
        // 5. INSERTAR FOTOGRAFÍAS
        // =====================================================

        private static void InsertarImagen(
            SqlConnection con,
            SqlTransaction transaction,
            int idNosotros,
            NosotrosImagenModel imagen)
        {
            string query = @"
                INSERT INTO NosotrosImagenes
                (
                    IdNosotros,
                    UrlImagen,
                    PublicId,
                    DescImagen,
                    OrdenFoto
                )
                VALUES
                (
                    @idNosotros,
                    @url,
                    @publicId,
                    @descripcion,
                    @orden
                );
            ";

            using (SqlCommand cmd = new SqlCommand(query, con, transaction))
            {
                cmd.Parameters.Add("@idNosotros", SqlDbType.Int).Value = idNosotros;

                cmd.Parameters.Add("@url", SqlDbType.NVarChar, 500).Value =
                    imagen.UrlImagen;

                cmd.Parameters.Add("@publicId", SqlDbType.NVarChar, 250).Value =
                    (object?)imagen.PublicId ?? DBNull.Value;

                cmd.Parameters.Add("@descripcion", SqlDbType.NVarChar, 250).Value =
                    (object?)imagen.DescImagen ?? DBNull.Value;

                cmd.Parameters.Add("@orden", SqlDbType.Int).Value =
                    imagen.OrdenFoto;

                cmd.ExecuteNonQuery();
            }
        }

        // =====================================================
        // 6. PARÁMETROS DEL APARTADO
        // =====================================================

        private static void AgregarParametrosNosotros(
            SqlCommand cmd,
            RegistrarNosotrosModel model)
        {
            cmd.Parameters.Add("@titulo", SqlDbType.NVarChar, 150).Value =
                model.Titulo;

            cmd.Parameters.Add("@resumen", SqlDbType.NVarChar, 250).Value =
                (object?)model.Resumen ?? DBNull.Value;

            cmd.Parameters.Add("@descripcion", SqlDbType.NVarChar, -1).Value =
                (object?)model.Descripcion ?? DBNull.Value;

            cmd.Parameters.Add("@icono", SqlDbType.NVarChar, 100).Value =
                (object?)model.Icono ?? DBNull.Value;

            cmd.Parameters.Add("@orden", SqlDbType.Int).Value =
                model.OrdenNosotros;

            cmd.Parameters.Add("@estado", SqlDbType.Bit).Value =
                model.Estado;

            cmd.Parameters.Add("@usuario", SqlDbType.NVarChar, 100).Value =
                (object?)model.UsuaRegist ?? DBNull.Value;
        }

        // =====================================================
        // 7. VALIDACIONES
        // =====================================================

        private static void ValidarDatos(RegistrarNosotrosModel model)
        {
            if (string.IsNullOrWhiteSpace(model.Titulo))
                throw new ArgumentException("El título es obligatorio.");

            if (model.Titulo.Length > 150)
                throw new ArgumentException("El título no puede superar los 150 caracteres.");

            if (model.Resumen?.Length > 250)
                throw new ArgumentException("El resumen no puede superar los 250 caracteres.");

            if (model.Icono?.Length > 100)
                throw new ArgumentException("El icono no puede superar los 100 caracteres.");

            if (string.IsNullOrWhiteSpace(model.UsuaRegist))
                throw new ArgumentException("El usuario de registro es obligatorio.");

            if (model.Imagenes == null)
                throw new ArgumentException("La lista de imágenes no es válida.");

            if (model.Imagenes.Count > 15)
                throw new ArgumentException("No puedes registrar más de 15 fotografías por apartado.");

            if (model.Imagenes.Any(i =>
                string.IsNullOrWhiteSpace(i.UrlImagen) ||
                i.UrlImagen.Length > 500))
            {
                throw new ArgumentException("Una o más direcciones de imágenes no son válidas.");
            }

            if (model.Imagenes.Any(i =>
                i.DescImagen?.Length > 250))
            {
                throw new ArgumentException("La descripción de una imagen no puede superar los 250 caracteres.");
            }

            if (model.Imagenes.Any(i => i.OrdenFoto <= 0))
                throw new ArgumentException("El orden de las fotografías debe ser mayor que cero.");

            if (model.Imagenes
                .GroupBy(i => i.OrdenFoto)
                .Any(g => g.Count() > 1))
            {
                throw new ArgumentException("No puede haber dos fotografías con el mismo orden.");
            }
        }

        public List<ListarNosotrosModel> ListarPublicos()
        {
            return Listar()
                .Where(n => n.Estado)
                .ToList();
        }
    }
}

