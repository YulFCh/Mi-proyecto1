
using ApiProyecto1.Models.Informes;
using ApiProyecto1.Services.Servicios;
using Microsoft.Data.SqlClient;
using System.Data;

namespace ApiProyecto1.Services.Informes
{
    public class InformesService
    {
        private readonly string _connectionString;
        private readonly CloudinaryService _cloudinary;
        private readonly ILogger<InformesService> _logger;

        public InformesService(
            IConfiguration config,
            CloudinaryService cloudinary,
            ILogger<InformesService> logger)
        {
            _connectionString = config.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException(
                    "No se encontró DefaultConnection.");

            _cloudinary = cloudinary;
            _logger = logger;
        }

        // ==========================================
        // LISTAR SECCIONES
        // ==========================================

        public List<ListarSeccionWebModel> Listar()
        {
            return ListarSecciones(false);
        }

        // ==========================================
        // LISTAR SECCIONES PÚBLICAS
        // ==========================================

        public List<ListarSeccionWebModel> ListarPublicos()
        {
            return ListarSecciones(true);
        }

        // ==========================================
        // CONSULTA GENERAL DE SECCIONES Y ELEMENTOS
        // ==========================================

        private List<ListarSeccionWebModel> ListarSecciones(bool soloActivos)
        {
            var secciones = new List<ListarSeccionWebModel>();

            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                string filtroSecciones = soloActivos
                    ? "WHERE Estado = 1"
                    : "";

                string filtroElementos = soloActivos
                    ? "WHERE e.Estado = 1 AND s.Estado = 1"
                    : "";

                string query = $@"
                    SELECT
                        IdSeccion,
                        Titulo,
                        Descripcion,
                        OrdenSeccion,
                        Estado,
                        FechRegist,
                        UsuaRegist,
                        FechModif,
                        UsuarModif
                    FROM SeccionesWeb
                    {filtroSecciones}
                    ORDER BY OrdenSeccion ASC, IdSeccion ASC;

                    SELECT
                        e.IdElemento,
                        e.IdSeccion,
                        e.TipoElemento,
                        e.Etiqueta,
                        e.Contenido,
                        e.UrlDestino,
                        e.PermiteClick,
                        e.UrlImagen,
                        e.PublicId,
                        e.Icono,
                        e.OrdenElemento,
                        e.Estado,
                        e.FechRegist,
                        e.UsuaRegist,
                        e.FechModif,
                        e.UsuarModif
                    FROM ElementosSeccionWeb e
                    INNER JOIN SeccionesWeb s
                        ON s.IdSeccion = e.IdSeccion
                    {filtroElementos}
                    ORDER BY e.IdSeccion, e.OrdenElemento, e.IdElemento;
                ";

                using (SqlCommand cmd = new SqlCommand(query, con))
                {
                    con.Open();

                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        var seccionesPorId =
                            new Dictionary<int, ListarSeccionWebModel>();

                        // SECCIONES
                        while (dr.Read())
                        {
                            var seccion = new ListarSeccionWebModel
                            {
                                IdSeccion = Convert.ToInt32(dr["IdSeccion"]),
                                Titulo = dr["Titulo"].ToString() ?? "",
                                Descripcion = dr["Descripcion"] == DBNull.Value
                                    ? null : dr["Descripcion"].ToString(),
                                OrdenSeccion = Convert.ToInt32(dr["OrdenSeccion"]),
                                Estado = Convert.ToBoolean(dr["Estado"]),
                                FechRegist = Convert.ToDateTime(dr["FechRegist"]),
                                UsuaRegist = dr["UsuaRegist"].ToString() ?? "",
                                FechModif = dr["FechModif"] == DBNull.Value
                                    ? null : Convert.ToDateTime(dr["FechModif"]),
                                UsuarModif = dr["UsuarModif"] == DBNull.Value
                                    ? null : dr["UsuarModif"].ToString()
                            };

                            secciones.Add(seccion);
                            seccionesPorId.Add(seccion.IdSeccion, seccion);
                        }

                        // ELEMENTOS
                        dr.NextResult();

                        while (dr.Read())
                        {
                            int idSeccion = Convert.ToInt32(dr["IdSeccion"]);

                            if (!seccionesPorId.TryGetValue(
                                idSeccion, out var seccion))
                            {
                                continue;
                            }

                            seccion.Elementos.Add(
                                new ListarElementoSeccionWebModel
                                {
                                    IdElemento = Convert.ToInt32(dr["IdElemento"]),
                                    TipoElemento = dr["TipoElemento"].ToString() ?? "",
                                    Etiqueta = dr["Etiqueta"] == DBNull.Value
                                        ? null : dr["Etiqueta"].ToString(),
                                    Contenido = dr["Contenido"] == DBNull.Value
                                        ? null : dr["Contenido"].ToString(),
                                    UrlDestino = dr["UrlDestino"] == DBNull.Value
                                        ? null : dr["UrlDestino"].ToString(),
                                    PermiteClick = Convert.ToBoolean(dr["PermiteClick"]),
                                    UrlImagen = dr["UrlImagen"] == DBNull.Value
                                        ? null : dr["UrlImagen"].ToString(),
                                    PublicId = dr["PublicId"] == DBNull.Value
                                        ? null : dr["PublicId"].ToString(),
                                    Icono = dr["Icono"] == DBNull.Value
                                        ? null : dr["Icono"].ToString(),
                                    OrdenElemento = Convert.ToInt32(dr["OrdenElemento"]),
                                    Estado = Convert.ToBoolean(dr["Estado"]),
                                    FechRegist = Convert.ToDateTime(dr["FechRegist"]),
                                    UsuaRegist = dr["UsuaRegist"].ToString() ?? "",
                                    FechModif = dr["FechModif"] == DBNull.Value
                                        ? null : Convert.ToDateTime(dr["FechModif"]),
                                    UsuarModif = dr["UsuarModif"] == DBNull.Value
                                        ? null : dr["UsuarModif"].ToString()
                                });
                        }
                    }
                }
            }

            return secciones;
        }

        // ==========================================
        // INSERTAR SECCIÓN CON SUS ELEMENTOS
        // ==========================================

        public int Insertar(GuardarSeccionWebModel model)
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
                            INSERT INTO SeccionesWeb
                            (
                                Titulo,
                                Descripcion,
                                OrdenSeccion,
                                Estado,
                                UsuaRegist
                            )
                            OUTPUT INSERTED.IdSeccion
                            VALUES
                            (
                                @Titulo,
                                @Descripcion,
                                @OrdenSeccion,
                                @Estado,
                                @Usuario
                            );
                        ";

                        int idSeccion;

                        using (SqlCommand cmd = new SqlCommand(query, con, trans))
                        {
                            AgregarParametrosSeccion(cmd, model);

                            idSeccion = Convert.ToInt32(cmd.ExecuteScalar());
                        }

                        foreach (var elemento in model.Elementos)
                        {
                            InsertarElemento(
                                con,
                                trans,
                                idSeccion,
                                elemento,
                                model.Usuario);
                        }

                        trans.Commit();

                        return idSeccion;
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
        // EDITAR SECCIÓN Y SUS ELEMENTOS
        // ==========================================

        public async Task<bool> EditarAsync(
            int id,
            GuardarSeccionWebModel model,
            CancellationToken cancellationToken = default)
        {
            ValidarModelo(model);

            var publicIdsAnteriores = new List<string>();
            var idsElementosAnteriores = new HashSet<int>();

            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                await con.OpenAsync(cancellationToken);

                using (SqlTransaction trans = con.BeginTransaction())
                {
                    try
                    {
                        // Obtener los elementos que ya existen.
                        string consultar = @"
                            SELECT IdElemento, PublicId
                            FROM ElementosSeccionWeb
                            WHERE IdSeccion = @IdSeccion;
                        ";

                        using (SqlCommand cmd = new SqlCommand(
                            consultar, con, trans))
                        {
                            cmd.Parameters.Add("@IdSeccion", SqlDbType.Int).Value = id;

                            using (SqlDataReader dr =
                                await cmd.ExecuteReaderAsync(cancellationToken))
                            {
                                while (await dr.ReadAsync(cancellationToken))
                                {
                                    int idElemento =
                                        Convert.ToInt32(dr["IdElemento"]);

                                    idsElementosAnteriores.Add(idElemento);

                                    if (dr["PublicId"] != DBNull.Value)
                                    {
                                        string publicId =
                                            dr["PublicId"].ToString() ?? "";

                                        if (!string.IsNullOrWhiteSpace(publicId))
                                            publicIdsAnteriores.Add(publicId);
                                    }
                                }
                            }
                        }

                        // Actualizar la sección.
                        string actualizarSeccion = @"
                            UPDATE SeccionesWeb
                            SET
                                Titulo = @Titulo,
                                Descripcion = @Descripcion,
                                OrdenSeccion = @OrdenSeccion,
                                Estado = @Estado,
                                FechModif = GETDATE(),
                                UsuarModif = @Usuario
                            WHERE IdSeccion = @IdSeccion;
                        ";

                        int filas;

                        using (SqlCommand cmd = new SqlCommand(
                            actualizarSeccion, con, trans))
                        {
                            AgregarParametrosSeccion(cmd, model);

                            cmd.Parameters.Add("@IdSeccion", SqlDbType.Int).Value = id;

                            filas = await cmd.ExecuteNonQueryAsync(
                                cancellationToken);
                        }

                        if (filas == 0)
                        {
                            trans.Rollback();
                            return false;
                        }

                        var idsRecibidos = new HashSet<int>();

                        // Insertar los elementos nuevos y actualizar los existentes.
                        foreach (var elemento in model.Elementos)
                        {
                            if (elemento.IdElemento == 0)
                            {
                                await InsertarElementoAsync(
                                    con,
                                    trans,
                                    id,
                                    elemento,
                                    model.Usuario,
                                    cancellationToken);
                            }
                            else
                            {
                                if (!idsElementosAnteriores.Contains(
                                    elemento.IdElemento))
                                {
                                    throw new ArgumentException(
                                        $"El elemento {elemento.IdElemento} " +
                                        "no pertenece a esta sección.");
                                }

                                if (!idsRecibidos.Add(elemento.IdElemento))
                                {
                                    throw new ArgumentException(
                                        "No se puede repetir un elemento.");
                                }

                                await ActualizarElementoAsync(
                                    con,
                                    trans,
                                    id,
                                    elemento,
                                    model.Usuario,
                                    cancellationToken);
                            }
                        }

                        // Eliminar de SQL los elementos que ya no fueron enviados.
                        foreach (int idElemento in idsElementosAnteriores)
                        {
                            if (!idsRecibidos.Contains(idElemento))
                            {
                                string eliminarElemento = @"
                                    DELETE FROM ElementosSeccionWeb
                                    WHERE IdElemento = @IdElemento
                                      AND IdSeccion = @IdSeccion;
                                ";

                                using (SqlCommand cmd = new SqlCommand(
                                    eliminarElemento, con, trans))
                                {
                                    cmd.Parameters.Add("@IdElemento", SqlDbType.Int)
                                        .Value = idElemento;

                                    cmd.Parameters.Add("@IdSeccion", SqlDbType.Int)
                                        .Value = id;

                                    await cmd.ExecuteNonQueryAsync(
                                        cancellationToken);
                                }
                            }
                        }

                        trans.Commit();
                    }
                    catch
                    {
                        trans.Rollback();
                        throw;
                    }
                }
            }

            // Identificar las imágenes que permanecen asociadas.
            var publicIdsConservados = new HashSet<string>(
                model.Elementos
                    .Where(x => !string.IsNullOrWhiteSpace(x.PublicId))
                    .Select(x => x.PublicId!),
                StringComparer.OrdinalIgnoreCase);

            // Eliminar únicamente las imágenes que fueron retiradas o reemplazadas.
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
        // INSERTAR ELEMENTO
        // ==========================================

        private void InsertarElemento(
            SqlConnection con,
            SqlTransaction trans,
            int idSeccion,
            GuardarElementoSeccionWebModel elemento,
            string usuario)
        {
            string query = @"
                INSERT INTO ElementosSeccionWeb
                (
                    IdSeccion,
                    TipoElemento,
                    Etiqueta,
                    Contenido,
                    UrlDestino,
                    PermiteClick,
                    UrlImagen,
                    PublicId,
                    Icono,
                    OrdenElemento,
                    Estado,
                    UsuaRegist
                )
                VALUES
                (
                    @IdSeccion,
                    @TipoElemento,
                    @Etiqueta,
                    @Contenido,
                    @UrlDestino,
                    @PermiteClick,
                    @UrlImagen,
                    @PublicId,
                    @Icono,
                    @OrdenElemento,
                    @Estado,
                    @Usuario
                );
            ";

            using (SqlCommand cmd = new SqlCommand(query, con, trans))
            {
                cmd.Parameters.Add("@IdSeccion", SqlDbType.Int).Value =
                    idSeccion;

                AgregarParametrosElemento(cmd, elemento, usuario);

                cmd.ExecuteNonQuery();
            }
        }

        // ==========================================
        // INSERTAR ELEMENTO ASÍNCRONO
        // ==========================================

        private async Task InsertarElementoAsync(
            SqlConnection con,
            SqlTransaction trans,
            int idSeccion,
            GuardarElementoSeccionWebModel elemento,
            string usuario,
            CancellationToken cancellationToken)
        {
            string query = @"
                INSERT INTO ElementosSeccionWeb
                (
                    IdSeccion,
                    TipoElemento,
                    Etiqueta,
                    Contenido,
                    UrlDestino,
                    PermiteClick,
                    UrlImagen,
                    PublicId,
                    Icono,
                    OrdenElemento,
                    Estado,
                    UsuaRegist
                )
                VALUES
                (
                    @IdSeccion,
                    @TipoElemento,
                    @Etiqueta,
                    @Contenido,
                    @UrlDestino,
                    @PermiteClick,
                    @UrlImagen,
                    @PublicId,
                    @Icono,
                    @OrdenElemento,
                    @Estado,
                    @Usuario
                );
            ";

            using (SqlCommand cmd = new SqlCommand(query, con, trans))
            {
                cmd.Parameters.Add("@IdSeccion", SqlDbType.Int).Value =
                    idSeccion;

                AgregarParametrosElemento(cmd, elemento, usuario);

                await cmd.ExecuteNonQueryAsync(cancellationToken);
            }
        }

        // ==========================================
        // ACTUALIZAR ELEMENTO
        // ==========================================

        private async Task ActualizarElementoAsync(
            SqlConnection con,
            SqlTransaction trans,
            int idSeccion,
            GuardarElementoSeccionWebModel elemento,
            string usuario,
            CancellationToken cancellationToken)
        {
            string query = @"
                UPDATE ElementosSeccionWeb
                SET
                    TipoElemento = @TipoElemento,
                    Etiqueta = @Etiqueta,
                    Contenido = @Contenido,
                    UrlDestino = @UrlDestino,
                    PermiteClick = @PermiteClick,
                    UrlImagen = @UrlImagen,
                    PublicId = @PublicId,
                    Icono = @Icono,
                    OrdenElemento = @OrdenElemento,
                    Estado = @Estado,
                    FechModif = GETDATE(),
                    UsuarModif = @Usuario
                WHERE IdElemento = @IdElemento
                  AND IdSeccion = @IdSeccion;
            ";

            using (SqlCommand cmd = new SqlCommand(query, con, trans))
            {
                AgregarParametrosElemento(cmd, elemento, usuario);

                cmd.Parameters.Add("@IdElemento", SqlDbType.Int).Value =
                    elemento.IdElemento;

                cmd.Parameters.Add("@IdSeccion", SqlDbType.Int).Value =
                    idSeccion;

                await cmd.ExecuteNonQueryAsync(cancellationToken);
            }
        }

        // ==========================================
        // PARÁMETROS DE LA SECCIÓN
        // ==========================================

        private void AgregarParametrosSeccion(
            SqlCommand cmd,
            GuardarSeccionWebModel model)
        {
            cmd.Parameters.Add("@Titulo", SqlDbType.NVarChar, 150).Value =
                model.Titulo.Trim();

            cmd.Parameters.Add("@Descripcion", SqlDbType.NVarChar, 250).Value =
                (object?)model.Descripcion ?? DBNull.Value;

            cmd.Parameters.Add("@OrdenSeccion", SqlDbType.Int).Value =
                model.OrdenSeccion;

            cmd.Parameters.Add("@Estado", SqlDbType.Bit).Value =
                model.Estado;

            cmd.Parameters.Add("@Usuario", SqlDbType.NVarChar, 100).Value =
                model.Usuario.Trim();
        }

        // ==========================================
        // PARÁMETROS DEL ELEMENTO
        // ==========================================

        private void AgregarParametrosElemento(
            SqlCommand cmd,
            GuardarElementoSeccionWebModel elemento,
            string usuario)
        {
            cmd.Parameters.Add("@TipoElemento", SqlDbType.NVarChar, 30).Value =
                elemento.TipoElemento.Trim();

            cmd.Parameters.Add("@Etiqueta", SqlDbType.NVarChar, 200).Value =
                (object?)elemento.Etiqueta ?? DBNull.Value;

            cmd.Parameters.Add("@Contenido", SqlDbType.NVarChar, -1).Value =
                (object?)elemento.Contenido ?? DBNull.Value;

            cmd.Parameters.Add("@UrlDestino", SqlDbType.NVarChar, 1000).Value =
                (object?)elemento.UrlDestino ?? DBNull.Value;

            cmd.Parameters.Add("@PermiteClick", SqlDbType.Bit).Value =
                elemento.PermiteClick;

            cmd.Parameters.Add("@UrlImagen", SqlDbType.NVarChar, 500).Value =
                (object?)elemento.UrlImagen ?? DBNull.Value;

            cmd.Parameters.Add("@PublicId", SqlDbType.NVarChar, 250).Value =
                (object?)elemento.PublicId ?? DBNull.Value;

            cmd.Parameters.Add("@Icono", SqlDbType.NVarChar, 100).Value =
                (object?)elemento.Icono ?? DBNull.Value;

            cmd.Parameters.Add("@OrdenElemento", SqlDbType.Int).Value =
                elemento.OrdenElemento;

            cmd.Parameters.Add("@Estado", SqlDbType.Bit).Value =
                elemento.Estado;

            cmd.Parameters.Add("@Usuario", SqlDbType.NVarChar, 100).Value =
                usuario.Trim();
        }

        // ==========================================
        // VALIDACIONES
        // ==========================================

        private void ValidarModelo(GuardarSeccionWebModel model)
        {
            if (model == null)
                throw new ArgumentException("Los datos de la sección son obligatorios.");

            if (string.IsNullOrWhiteSpace(model.Titulo))
                throw new ArgumentException("El título de la sección es obligatorio.");

            if (model.Titulo.Trim().Length > 150)
                throw new ArgumentException(
                    "El título no puede superar 150 caracteres.");

            if (model.Descripcion?.Length > 250)
                throw new ArgumentException(
                    "La descripción no puede superar 250 caracteres.");

            if (string.IsNullOrWhiteSpace(model.Usuario))
                throw new ArgumentException("El usuario es obligatorio.");

            if (model.Usuario.Trim().Length > 100)
                throw new ArgumentException(
                    "El usuario no puede superar 100 caracteres.");

            if (model.Elementos == null)
                throw new ArgumentException("La lista de elementos no es válida.");

            var tiposPermitidos = new[]
            {
                "Texto",
                "Enlace",
                "Correo",
                "Telefono",
                "Direccion",
                "Imagen"
            };

            foreach (var elemento in model.Elementos)
            {
                if (elemento == null)
                    throw new ArgumentException("Se encontró un elemento no válido.");

                if (elemento.IdElemento < 0)
                    throw new ArgumentException("El identificador del elemento no es válido.");

                if (string.IsNullOrWhiteSpace(elemento.TipoElemento) ||
                    !tiposPermitidos.Contains(
                        elemento.TipoElemento.Trim(),
                        StringComparer.OrdinalIgnoreCase))
                {
                    throw new ArgumentException(
                        "El tipo de elemento no es válido.");
                }

                if (elemento.Etiqueta?.Length > 200)
                    throw new ArgumentException(
                        "La etiqueta no puede superar 200 caracteres.");

                if (elemento.UrlDestino?.Length > 1000)
                    throw new ArgumentException(
                        "La URL de destino no puede superar 1000 caracteres.");

                if (elemento.UrlImagen?.Length > 500)
                    throw new ArgumentException(
                        "La URL de imagen no puede superar 500 caracteres.");

                if (elemento.PublicId?.Length > 250)
                    throw new ArgumentException(
                        "El PublicId no puede superar 250 caracteres.");

                if (elemento.Icono?.Length > 100)
                    throw new ArgumentException(
                        "El icono no puede superar 100 caracteres.");

                if (elemento.OrdenElemento < 0)
                    throw new ArgumentException(
                        "El orden del elemento no puede ser negativo.");
            }
        }

        // ==========================================
        // ELIMINAR ELEMENTO INDIVIDUAL
        // ==========================================


        public async Task<bool> EliminarElementoAsync(
            int idElemento,
            CancellationToken cancellationToken = default)
        {
            string? publicId = null;

            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                await con.OpenAsync(cancellationToken);

                using (SqlTransaction trans = con.BeginTransaction())
                {
                    try
                    {
                        string consultar = @"
                    SELECT PublicId
                    FROM ElementosSeccionWeb
                    WHERE IdElemento = @IdElemento;
                ";

                        using (SqlCommand cmd = new SqlCommand(
                            consultar, con, trans))
                        {
                            cmd.Parameters.Add("@IdElemento", SqlDbType.Int).Value =
                                idElemento;

                            using (SqlDataReader dr =
                                await cmd.ExecuteReaderAsync(cancellationToken))
                            {
                                if (!await dr.ReadAsync(cancellationToken))
                                {
                                    trans.Rollback();
                                    return false;
                                }

                                if (dr["PublicId"] != DBNull.Value)
                                {
                                    publicId = dr["PublicId"].ToString();
                                }
                            }
                        }

                        string eliminar = @"
                    DELETE FROM ElementosSeccionWeb
                    WHERE IdElemento = @IdElemento;
                ";

                        using (SqlCommand cmd = new SqlCommand(
                            eliminar, con, trans))
                        {
                            cmd.Parameters.Add("@IdElemento", SqlDbType.Int).Value =
                                idElemento;

                            int filas = await cmd.ExecuteNonQueryAsync(
                                cancellationToken);

                            if (filas == 0)
                            {
                                trans.Rollback();
                                return false;
                            }
                        }

                        trans.Commit();
                    }
                    catch
                    {
                        trans.Rollback();
                        throw;
                    }
                }
            }

            if (!string.IsNullOrWhiteSpace(publicId))
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
        // ELIMINAR SECCIÓN Y SUS ELEMENTOS
        // ==========================================

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
                        // Recuperar los PublicId de todos los elementos.
                        string consultar = @"
                            SELECT PublicId
                            FROM ElementosSeccionWeb
                            WHERE IdSeccion = @IdSeccion
                              AND PublicId IS NOT NULL;
                        ";

                        using (SqlCommand cmd = new SqlCommand(
                            consultar, con, trans))
                        {
                            cmd.Parameters.Add("@IdSeccion", SqlDbType.Int).Value =
                                id;

                            using (SqlDataReader dr =
                                await cmd.ExecuteReaderAsync(cancellationToken))
                            {
                                while (await dr.ReadAsync(cancellationToken))
                                {
                                    string valor =
                                        dr["PublicId"].ToString() ?? "";

                                    if (!string.IsNullOrWhiteSpace(valor))
                                        publicIds.Add(valor);
                                }
                            }
                        }

                        // Eliminar la sección.
                        // Los elementos se eliminan mediante ON DELETE CASCADE.
                        string eliminar = @"
                            DELETE FROM SeccionesWeb
                            WHERE IdSeccion = @IdSeccion;
                        ";

                        int filas;

                        using (SqlCommand cmd = new SqlCommand(
                            eliminar, con, trans))
                        {
                            cmd.Parameters.Add("@IdSeccion", SqlDbType.Int).Value =
                                id;

                            filas = await cmd.ExecuteNonQueryAsync(
                                cancellationToken);
                        }

                        if (filas == 0)
                        {
                            trans.Rollback();
                            return false;
                        }

                        trans.Commit();
                    }
                    catch
                    {
                        trans.Rollback();
                        throw;
                    }
                }
            }

            // Eliminar las imágenes de Cloudinary después de confirmar SQL.
            foreach (var publicId in publicIds.Distinct(
                StringComparer.OrdinalIgnoreCase))
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
