
using ApiProyecto1.Models.Catalogos;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Linq;
using ApiProyecto1.Services.Servicios;
namespace ApiProyecto1.Services.Catalogos
{
    public class EquiposService
    {
        private readonly string _connectionString;
        private readonly CloudinaryService _cloudinaryService;

        public EquiposService(IConfiguration config, CloudinaryService cloudinaryService)
        {
            _connectionString = config.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException(
                    "No se encontró la cadena de conexión DefaultConnection."
                );
            _cloudinaryService = cloudinaryService;
        }

        // ============================================================
        // LISTAR EQUIPOS CON SUS VARIANTES E IMÁGENES
        // ============================================================

        public List<RegistrosModel> Listar()
        {
            var registros = new List<RegistrosModel>();

            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                string query = @"
                    SELECT
                        id,
                        IdSubcategoria,
                        tipo_equipo,
                        color,
                        modelo,
                        descripcion,
                        precio,
                        fecha_registro,
                        marca,
                        codigo_producto,
                        precio_antes,
                        descuento,
                        estado,
                        usuario_registra,
                        descripcion1,
                        garantia
                    FROM equipos
                    ORDER BY marca, modelo, id;";

                using (SqlCommand cmd = new SqlCommand(query, con))
                {
                    con.Open();

                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            registros.Add(new RegistrosModel
                            {
                                Id = Convert.ToInt32(dr["id"]),

                                IdSubcategoria = dr["IdSubcategoria"] == DBNull.Value
                                    ? null
                                    : Convert.ToInt32(dr["IdSubcategoria"]),

                                Tipo_Equipo = dr["tipo_equipo"]?.ToString() ?? "",

                                Color = dr["color"] == DBNull.Value
                                    ? null
                                    : dr["color"].ToString(),

                                Modelo = dr["modelo"] == DBNull.Value
                                    ? null
                                    : dr["modelo"].ToString(),

                                Descripcion = dr["descripcion"] == DBNull.Value
                                    ? null
                                    : dr["descripcion"].ToString(),

                                Precio = dr["precio"] == DBNull.Value
                                    ? 0
                                    : Convert.ToDecimal(dr["precio"]),

                                Fecha_Registro = dr["fecha_registro"] == DBNull.Value
                                    ? null
                                    : Convert.ToDateTime(dr["fecha_registro"]),

                                Marca = dr["marca"] == DBNull.Value
                                    ? null
                                    : dr["marca"].ToString(),

                                Codigo_Producto = dr["codigo_producto"] == DBNull.Value
                                    ? null
                                    : dr["codigo_producto"].ToString(),

                                Precio_Antes = dr["precio_antes"] == DBNull.Value
                                    ? null
                                    : Convert.ToDecimal(dr["precio_antes"]),

                                Descuento = dr["descuento"] == DBNull.Value
                                    ? null
                                    : Convert.ToDecimal(dr["descuento"]),

                                Estado = dr["estado"] == DBNull.Value
                                    ? null
                                    : dr["estado"].ToString(),

                                Usuario_Registra = dr["usuario_registra"] == DBNull.Value
                                    ? null
                                    : dr["usuario_registra"].ToString(),

                                Descripcion1 = dr["descripcion1"] == DBNull.Value
                                    ? null
                                    : dr["descripcion1"].ToString(),

                                Garantia = dr["garantia"] == DBNull.Value
                                    ? null
                                    : dr["garantia"].ToString()
                            });
                        }
                    }
                }

                // ====================================================
                // OBTENER TODAS LAS IMÁGENES DE LOS EQUIPOS
                // ====================================================

                string queryImagenes = @"
                    SELECT
                        IdImagen,
                        IdEquipo,
                        UrlImagen,
                        PublicId,
                        OrdenImagen
                    FROM EquipoImagenes
                    ORDER BY IdEquipo, OrdenImagen;";

                using (SqlCommand cmdImagenes = new SqlCommand(
                    queryImagenes, con))
                {
                    using (SqlDataReader dr = cmdImagenes.ExecuteReader())
                    {
                        var imagenesPorEquipo =
                            new Dictionary<int, List<EquipoImagenModel>>();

                        while (dr.Read())
                        {
                            int idEquipo = Convert.ToInt32(dr["IdEquipo"]);

                            if (!imagenesPorEquipo.ContainsKey(idEquipo))
                            {
                                imagenesPorEquipo[idEquipo] =
                                    new List<EquipoImagenModel>();
                            }

                            imagenesPorEquipo[idEquipo].Add(
                                new EquipoImagenModel
                                {
                                    IdImagen = Convert.ToInt32(dr["IdImagen"]),
                                    IdEquipo = idEquipo,
                                    UrlImagen = dr["UrlImagen"].ToString() ?? "",
                                    PublicId = dr["PublicId"].ToString() ?? "",
                                    OrdenImagen = Convert.ToInt32(dr["OrdenImagen"])
                                }
                            );
                        }

                        foreach (var registro in registros)
                        {
                            if (imagenesPorEquipo.TryGetValue(
                                registro.Id, out var imagenes))
                            {
                                registro.Imagenes = imagenes;
                            }
                        }
                    }
                }
            }

            // ============================================================
            // AGRUPAR POR TIPO_EQUIPO + MARCA + MODELO
            // ============================================================

            var agrupados = registros
                .GroupBy(x => new
                {
                    Tipo = (x.Tipo_Equipo ?? "").Trim().ToLower(),
                    Marca = (x.Marca ?? "").Trim().ToLower(),
                    Modelo = (x.Modelo ?? "").Trim().ToLower()
                })
                .Select(grupo =>
                {
                    var primero = grupo.First();

                    primero.IdSubcategoria = grupo
                        .Select(x => x.IdSubcategoria)
                        .FirstOrDefault(id => id.HasValue);

                    primero.Variantes = grupo.Select(x => new VarianteModel
                    {
                        Id = x.Id,
                        Color = x.Color,

                        Precio = x.Precio,
                        Precio_Antes = x.Precio_Antes,
                        Descuento = x.Descuento,

                        Estado = x.Estado,
                        Codigo_Producto = x.Codigo_Producto,

                        Stock = 0,

                        Descripcion = x.Descripcion,
                        Descripcion1 = x.Descripcion1,
                        Garantia = x.Garantia,

                        Imagenes = x.Imagenes
                    }).ToList();

                    // ====================================================
                    // PRIMERA VARIANTE COMO PRESENTACIÓN INICIAL
                    // ====================================================

                    var varianteInicial = primero.Variantes.FirstOrDefault();

                    if (varianteInicial != null)
                    {
                        primero.Id = varianteInicial.Id;
                        primero.Color = varianteInicial.Color;

                        primero.Precio = varianteInicial.Precio;
                        primero.Precio_Antes = varianteInicial.Precio_Antes;
                        primero.Descuento = varianteInicial.Descuento;

                        primero.Estado = varianteInicial.Estado;
                        primero.Codigo_Producto =
                            varianteInicial.Codigo_Producto;

                        primero.Descripcion = varianteInicial.Descripcion;
                        primero.Descripcion1 = varianteInicial.Descripcion1;
                        primero.Garantia = varianteInicial.Garantia;

                        primero.Imagenes = varianteInicial.Imagenes;
                    }

                    return primero;
                })
                .ToList();

            return agrupados;
        }

        // ============================================================
        // INSERTAR EQUIPO CON SUS IMÁGENES
        // ============================================================

        public void Insertar(RegistrosModel model)
        {
            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                con.Open();

                using (SqlTransaction transaction = con.BeginTransaction())
                {
                    try
                    {
                        string queryEquipo = @"
                            INSERT INTO equipos
                            (
                                IdSubcategoria,
                                tipo_equipo,
                                color,
                                modelo,
                                descripcion,
                                fecha_registro,
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
                                @idSubcategoria,
                                @tipo,
                                @color,
                                @modelo,
                                @descripcion,
                                GETDATE(),
                                @marca,
                                @codigo_producto,
                                @precio_antes,
                                @descuento,
                                @estado,
                                @usuario_registra,
                                @descripcion1,
                                @garantia
                            );

                            SELECT CAST(SCOPE_IDENTITY() AS INT);";

                        int idEquipo;

                        using (SqlCommand cmd = new SqlCommand(
                            queryEquipo, con, transaction))
                        {
                            cmd.Parameters.Add("@idSubcategoria", SqlDbType.Int)
                                .Value = (object?)model.IdSubcategoria ?? DBNull.Value;

                            cmd.Parameters.AddWithValue("@tipo", model.Tipo_Equipo);

                            cmd.Parameters.AddWithValue("@color",
                                (object?)model.Color ?? DBNull.Value);

                            cmd.Parameters.AddWithValue("@modelo",
                                (object?)model.Modelo ?? DBNull.Value);

                            cmd.Parameters.AddWithValue("@descripcion",
                                (object?)model.Descripcion ?? DBNull.Value);

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

                            idEquipo = Convert.ToInt32(cmd.ExecuteScalar());
                        }

                        // ====================================================
                        // INSERTAR IMÁGENES DEL EQUIPO
                        // ====================================================

                        if (model.Imagenes != null && model.Imagenes.Count > 0)
                        {
                            string queryImagen = @"
                                INSERT INTO EquipoImagenes
                                (
                                    IdEquipo,
                                    UrlImagen,
                                    PublicId,
                                    OrdenImagen
                                )
                                VALUES
                                (
                                    @idEquipo,
                                    @url,
                                    @publicId,
                                    @orden
                                );";

                            foreach (var imagen in model.Imagenes)
                            {
                                using (SqlCommand cmdImagen = new SqlCommand(
                                    queryImagen, con, transaction))
                                {
                                    cmdImagen.Parameters.AddWithValue(
                                        "@idEquipo", idEquipo);

                                    cmdImagen.Parameters.AddWithValue(
                                        "@url", imagen.UrlImagen);

                                    cmdImagen.Parameters.AddWithValue(
                                        "@publicId", imagen.PublicId);

                                    cmdImagen.Parameters.AddWithValue(
                                        "@orden", imagen.OrdenImagen);

                                    cmdImagen.ExecuteNonQuery();
                                }
                            }
                        }

                        transaction.Commit();
                    }
                    catch
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
        }




        public List<EditarEquiposModel> ObtenerVariantes(int id)
        {
            var variantes = new List<EditarEquiposModel>();

            using SqlConnection con = new SqlConnection(_connectionString);

            string query = @"
        SELECT
            e.id,
            e.IdSubcategoria,
            e.tipo_equipo,
            e.color,
            e.modelo,
            e.descripcion,
            e.descripcion1,
            e.garantia,
            e.precio,
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
        ORDER BY e.id;";

            using SqlCommand cmd = new SqlCommand(query, con);

            cmd.Parameters.Add("@id", SqlDbType.Int).Value = id;

            con.Open();

            using SqlDataReader reader = cmd.ExecuteReader();

            while (reader.Read())
            {
                variantes.Add(new EditarEquiposModel
                {
                    Id = Convert.ToInt32(reader["id"]),

                    IdSubcategoria = reader["IdSubcategoria"] == DBNull.Value
                        ? null
                        : Convert.ToInt32(reader["IdSubcategoria"]),

                    Tipo_Equipo = reader["tipo_equipo"]?.ToString(),
                    Color = reader["color"]?.ToString(),
                    Modelo = reader["modelo"]?.ToString(),
                    Descripcion = reader["descripcion"]?.ToString(),
                    Descripcion1 = reader["descripcion1"]?.ToString(),
                    Garantia = reader["garantia"]?.ToString(),

                    Precio = reader["precio"] == DBNull.Value
                        ? null
                        : Convert.ToDecimal(reader["precio"]),

                    Marca = reader["marca"]?.ToString(),
                    Codigo_Producto = reader["codigo_producto"]?.ToString(),

                    Precio_Antes = reader["precio_antes"] == DBNull.Value
                        ? null
                        : Convert.ToDecimal(reader["precio_antes"]),

                    Descuento = reader["descuento"] == DBNull.Value
                        ? null
                        : Convert.ToDecimal(reader["descuento"]),

                    Estado = reader["estado"]?.ToString(),

                    Imagenes = new List<EquipoImagenModel>()
                });
            }

            reader.Close();

            // Obtener imágenes de todas las variantes
            string queryImagenes = @"
        SELECT
            IdImagen,
            IdEquipo,
            UrlImagen,
            PublicId,
            OrdenImagen
        FROM EquipoImagenes
        WHERE IdEquipo IN (
            SELECT e.id
            FROM equipos e
            INNER JOIN equipos base
                ON e.tipo_equipo = base.tipo_equipo
                AND e.marca = base.marca
                AND e.modelo = base.modelo
            WHERE base.id = @id
        )
        ORDER BY IdEquipo, OrdenImagen;";

            using SqlCommand cmdImagenes = new SqlCommand(queryImagenes, con);

            cmdImagenes.Parameters.Add("@id", SqlDbType.Int).Value = id;

            using SqlDataReader dr = cmdImagenes.ExecuteReader();

            while (dr.Read())
            {
                int idEquipo = Convert.ToInt32(dr["IdEquipo"]);

                var variante = variantes.FirstOrDefault(x => x.Id == idEquipo);

                if (variante != null)
                {
                    variante.Imagenes!.Add(new EquipoImagenModel
                    {
                        IdImagen = Convert.ToInt32(dr["IdImagen"]),
                        IdEquipo = idEquipo,
                        UrlImagen = dr["UrlImagen"]?.ToString() ?? "",
                        PublicId = dr["PublicId"]?.ToString() ?? "",
                        OrdenImagen = Convert.ToInt32(dr["OrdenImagen"])
                    });
                }
            }

            return variantes;
        }



        public async Task<List<string>> PatchAsync(int id, EditarEquiposModel model)
        {
            var publicIdsFallidos = new List<string>();

            using SqlConnection con = new SqlConnection(_connectionString);

            con.Open();

            // Obtener imágenes actuales del equipo
            var imagenesAnteriores = new List<EquipoImagenModel>();

            using (SqlCommand cmd = new SqlCommand(@"
        SELECT IdImagen, IdEquipo, UrlImagen, PublicId, OrdenImagen
        FROM EquipoImagenes
        WHERE IdEquipo = @id;", con))
            {
                cmd.Parameters.Add("@id", SqlDbType.Int).Value = id;

                using SqlDataReader dr = cmd.ExecuteReader();

                while (dr.Read())
                {
                    imagenesAnteriores.Add(new EquipoImagenModel
                    {
                        IdImagen = Convert.ToInt32(dr["IdImagen"]),
                        IdEquipo = Convert.ToInt32(dr["IdEquipo"]),
                        UrlImagen = dr["UrlImagen"].ToString() ?? "",
                        PublicId = dr["PublicId"].ToString() ?? "",
                        OrdenImagen = Convert.ToInt32(dr["OrdenImagen"])
                    });
                }
            }

            // Verificar que el equipo exista
            using (SqlCommand cmdExiste = new SqlCommand(
                "SELECT COUNT(1) FROM equipos WHERE id = @id;", con))
            {
                cmdExiste.Parameters.Add("@id", SqlDbType.Int).Value = id;

                if (Convert.ToInt32(cmdExiste.ExecuteScalar()) == 0)
                    throw new Exception("El equipo no existe.");
            }

            // Validar imágenes recibidas
            if (model.Imagenes != null)
            {
                var idsRecibidos = model.Imagenes
                    .Where(x => x.IdImagen > 0)
                    .Select(x => x.IdImagen)
                    .ToList();

                if (idsRecibidos.Distinct().Count() != idsRecibidos.Count)
                    throw new Exception("Hay imágenes duplicadas.");

                foreach (var imagen in model.Imagenes)
                {
                    if (imagen.IdImagen > 0 &&
                        !imagenesAnteriores.Any(x => x.IdImagen == imagen.IdImagen))
                    {
                        throw new Exception(
                            "Una de las imágenes no pertenece a este equipo.");
                    }

                    if (string.IsNullOrWhiteSpace(imagen.UrlImagen) ||
                        string.IsNullOrWhiteSpace(imagen.PublicId))
                    {
                        throw new Exception(
                            "Todas las imágenes deben tener URL y PublicId.");
                    }
                }
            }

            using SqlTransaction transaction = con.BeginTransaction();

            try
            {
                // ==========================================
                // ACTUALIZAR DATOS DEL EQUIPO
                // ==========================================

                List<string> campos = new List<string>();

                using SqlCommand cmd = new SqlCommand();
                cmd.Connection = con;
                cmd.Transaction = transaction;

                if (model.IdSubcategoria.HasValue)
                {
                    campos.Add("IdSubcategoria = @idSubcategoria");
                    cmd.Parameters.Add("@idSubcategoria", SqlDbType.Int)
                        .Value = model.IdSubcategoria.Value;
                }

                if (model.Tipo_Equipo != null)
                {
                    campos.Add("tipo_equipo = @tipo");
                    cmd.Parameters.Add("@tipo", SqlDbType.VarChar).Value =
                        model.Tipo_Equipo;
                }

                if (model.Color != null)
                {
                    campos.Add("color = @color");
                    cmd.Parameters.Add("@color", SqlDbType.VarChar).Value =
                        model.Color;
                }

                if (model.Modelo != null)
                {
                    campos.Add("modelo = @modelo");
                    cmd.Parameters.Add("@modelo", SqlDbType.VarChar).Value =
                        model.Modelo;
                }

                if (model.Descripcion != null)
                {
                    campos.Add("descripcion = @descripcion");
                    cmd.Parameters.Add("@descripcion", SqlDbType.VarChar).Value =
                        model.Descripcion;
                }

                if (model.Descripcion1 != null)
                {
                    campos.Add("descripcion1 = @descripcion1");
                    cmd.Parameters.Add("@descripcion1", SqlDbType.VarChar).Value =
                        model.Descripcion1;
                }

                if (model.Garantia != null)
                {
                    campos.Add("garantia = @garantia");
                    cmd.Parameters.Add("@garantia", SqlDbType.VarChar).Value =
                        model.Garantia;
                }

                if (model.Marca != null)
                {
                    campos.Add("marca = @marca");
                    cmd.Parameters.Add("@marca", SqlDbType.VarChar).Value =
                        model.Marca;
                }

                if (model.Codigo_Producto != null)
                {
                    campos.Add("codigo_producto = @codigo");
                    cmd.Parameters.Add("@codigo", SqlDbType.VarChar).Value =
                        model.Codigo_Producto;
                }

                if (model.Precio_Antes.HasValue)
                {
                    campos.Add("precio_antes = @precio_antes");
                    cmd.Parameters.Add("@precio_antes", SqlDbType.Decimal).Value =
                        model.Precio_Antes.Value;
                }

                if (model.Descuento.HasValue)
                {
                    campos.Add("descuento = @descuento");
                    cmd.Parameters.Add("@descuento", SqlDbType.Decimal).Value =
                        model.Descuento.Value;
                }

                if (model.Estado != null)
                {
                    campos.Add("estado = @estado");
                    cmd.Parameters.Add("@estado", SqlDbType.VarChar).Value =
                        model.Estado;
                }

                if (model.Usuario_Modifica != null)
                {
                    campos.Add("usuario_modifica = @usuario_modifica");
                    cmd.Parameters.Add("@usuario_modifica", SqlDbType.VarChar).Value =
                        model.Usuario_Modifica;
                }

                if (campos.Count > 0)
                {
                    campos.Add("fecha_modifica = GETDATE()");

                    cmd.Parameters.Add("@id", SqlDbType.Int).Value = id;

                    cmd.CommandText = $@"
                UPDATE equipos
                SET {string.Join(", ", campos)}
                WHERE id = @id;";

                    cmd.ExecuteNonQuery();
                }

                // ==========================================
                // SINCRONIZAR IMÁGENES
                // ==========================================


                if (model.Imagenes != null)
                {
                    var idsConservados = model.Imagenes
                        .Where(x => x.IdImagen > 0)
                        .Select(x => x.IdImagen)
                        .ToHashSet();

                    var publicIdsParaEliminar = new List<string>();

                    // ==========================================
                    // ACTUALIZAR IMÁGENES EXISTENTES
                    // ==========================================

                    foreach (var imagen in model.Imagenes.Where(x => x.IdImagen > 0))
                    {
                        var anterior = imagenesAnteriores
                            .First(x => x.IdImagen == imagen.IdImagen);

                        // Si cambió la imagen, guardar el PublicId anterior
                        if (anterior.PublicId != imagen.PublicId)
                        {
                            publicIdsParaEliminar.Add(anterior.PublicId);
                        }

                        using SqlCommand cmdImagen = new SqlCommand(@"
            UPDATE EquipoImagenes
            SET
                UrlImagen = @url,
                PublicId = @publicId,
                OrdenImagen = @orden
            WHERE IdImagen = @idImagen
            AND IdEquipo = @idEquipo;", con, transaction);

                        cmdImagen.Parameters.AddWithValue("@url", imagen.UrlImagen);
                        cmdImagen.Parameters.AddWithValue("@publicId", imagen.PublicId);
                        cmdImagen.Parameters.AddWithValue("@orden", imagen.OrdenImagen);
                        cmdImagen.Parameters.AddWithValue("@idImagen", imagen.IdImagen);
                        cmdImagen.Parameters.AddWithValue("@idEquipo", id);

                        cmdImagen.ExecuteNonQuery();
                    }

                    // ==========================================
                    // INSERTAR IMÁGENES NUEVAS
                    // ==========================================

                    foreach (var imagen in model.Imagenes.Where(x => x.IdImagen == 0))
                    {
                        using SqlCommand cmdImagen = new SqlCommand(@"
            INSERT INTO EquipoImagenes
            (
                IdEquipo,
                UrlImagen,
                PublicId,
                OrdenImagen
            )
            VALUES
            (
                @idEquipo,
                @url,
                @publicId,
                @orden
            );", con, transaction);

                        cmdImagen.Parameters.AddWithValue("@idEquipo", id);
                        cmdImagen.Parameters.AddWithValue("@url", imagen.UrlImagen);
                        cmdImagen.Parameters.AddWithValue("@publicId", imagen.PublicId);
                        cmdImagen.Parameters.AddWithValue("@orden", imagen.OrdenImagen);

                        cmdImagen.ExecuteNonQuery();
                    }

                    // ==========================================
                    // IDENTIFICAR IMÁGENES ELIMINADAS
                    // ==========================================

                    var imagenesEliminadas = imagenesAnteriores
                        .Where(x => !idsConservados.Contains(x.IdImagen))
                        .ToList();

                    foreach (var imagen in imagenesEliminadas)
                    {
                        publicIdsParaEliminar.Add(imagen.PublicId);

                        using SqlCommand cmdEliminar = new SqlCommand(@"
            DELETE FROM EquipoImagenes
            WHERE IdImagen = @idImagen
            AND IdEquipo = @idEquipo;", con, transaction);

                        cmdEliminar.Parameters.AddWithValue("@idImagen", imagen.IdImagen);
                        cmdEliminar.Parameters.AddWithValue("@idEquipo", id);

                        cmdEliminar.ExecuteNonQuery();
                    }

                    // No eliminar archivos que todavía se utilizan
                    var publicIdsActuales = model.Imagenes
                        .Select(x => x.PublicId)
                        .Where(x => !string.IsNullOrWhiteSpace(x))
                        .ToHashSet();

                    publicIdsParaEliminar = publicIdsParaEliminar
                        .Where(x => !string.IsNullOrWhiteSpace(x))
                        .Where(x => !publicIdsActuales.Contains(x))
                        .Distinct()
                        .ToList();

                    // ==========================================
                    // CONFIRMAR CAMBIOS EN SQL SERVER
                    // ==========================================

                    transaction.Commit();

                    // ==========================================
                    // ELIMINAR IMÁGENES ANTIGUAS DE CLOUDINARY
                    // ==========================================

                    foreach (var publicId in publicIdsParaEliminar)
                    {
                        try
                        {
                            bool eliminado =
                                await _cloudinaryService.EliminarImagenAsync(publicId);

                            if (!eliminado)
                                publicIdsFallidos.Add(publicId);
                        }
                        catch
                        {
                            publicIdsFallidos.Add(publicId);
                        }
                    }
                }
                else
                {
                    transaction.Commit();
                }

            }
            catch
            {
                if (transaction.Connection != null)
                    transaction.Rollback();

                throw;
            }

            return publicIdsFallidos;
        }




        // ============================================================
        // ELIMINAR VARIANTE O PRODUCTO COMPLETO
        // ============================================================

        public async Task<(int CantidadEliminada, List<string> ImagenesNoEliminadas)>
            EliminarAsync(int id, bool eliminarProductoCompleto)
        {
            var publicIdsFallidos = new List<string>();
            var publicIdsParaEliminar = new List<string>();
            var idsEquipos = new List<int>();

            using SqlConnection con = new SqlConnection(_connectionString);
            await con.OpenAsync();

            using SqlTransaction transaction = con.BeginTransaction();

            try
            {
                // ====================================================
                // IDENTIFICAR LOS EQUIPOS QUE SE VAN A ELIMINAR
                // ====================================================

                string queryEquipos = @"
                    SELECT e.id
                    FROM dbo.equipos e
                    INNER JOIN dbo.equipos base
                        ON base.id = @id
                    WHERE
                        (
                            @completo = 0
                            AND e.id = base.id
                        )
                        OR
                        (
                            @completo = 1
                            AND LOWER(LTRIM(RTRIM(ISNULL(e.tipo_equipo, ''))))
                                = LOWER(LTRIM(RTRIM(ISNULL(base.tipo_equipo, ''))))
                            AND LOWER(LTRIM(RTRIM(ISNULL(e.marca, ''))))
                                = LOWER(LTRIM(RTRIM(ISNULL(base.marca, ''))))
                            AND LOWER(LTRIM(RTRIM(ISNULL(e.modelo, ''))))
                                = LOWER(LTRIM(RTRIM(ISNULL(base.modelo, ''))))
                        );";

                using (SqlCommand cmd = new SqlCommand(
                    queryEquipos, con, transaction))
                {
                    cmd.Parameters.Add("@id", SqlDbType.Int).Value = id;

                    cmd.Parameters.Add("@completo", SqlDbType.Bit)
                        .Value = eliminarProductoCompleto;

                    using SqlDataReader dr = await cmd.ExecuteReaderAsync();

                    while (await dr.ReadAsync())
                    {
                        idsEquipos.Add(Convert.ToInt32(dr["id"]));
                    }
                }

                if (idsEquipos.Count == 0)
                    throw new KeyNotFoundException("El equipo no existe.");

                // ====================================================
                // PREPARAR PARÁMETROS DE LOS EQUIPOS
                // ====================================================

                var parametrosIds = idsEquipos
                    .Select((_, i) => $"@id{i}")
                    .ToArray();

                string listaIds = string.Join(",", parametrosIds);

                // ====================================================
                // COMPROBAR SI TIENEN PEDIDOS ASOCIADOS
                // ====================================================

                string queryPedidos = $@"
                    SELECT COUNT(1)
                    FROM dbo.detalle_pedidos
                    WHERE id_producto IN ({listaIds});";

                using (SqlCommand cmdPedidos = new SqlCommand(
                    queryPedidos, con, transaction))
                {
                    for (int i = 0; i < idsEquipos.Count; i++)
                    {
                        cmdPedidos.Parameters.Add(
                            parametrosIds[i], SqlDbType.Int
                        ).Value = idsEquipos[i];
                    }

                    int pedidos = Convert.ToInt32(
                        await cmdPedidos.ExecuteScalarAsync());

                    if (pedidos > 0)
                    {
                        throw new InvalidOperationException(
                            "No se puede eliminar el equipo porque tiene pedidos asociados."
                        );
                    }
                }

                // ====================================================
                // OBTENER PUBLICID DE TODAS LAS IMÁGENES
                // ====================================================

                string queryImagenes = $@"
                    SELECT DISTINCT PublicId
                    FROM dbo.EquipoImagenes
                    WHERE IdEquipo IN ({listaIds})
                    AND NULLIF(LTRIM(RTRIM(PublicId)), '') IS NOT NULL;";

                using (SqlCommand cmdImagenes = new SqlCommand(
                    queryImagenes, con, transaction))
                {
                    for (int i = 0; i < idsEquipos.Count; i++)
                    {
                        cmdImagenes.Parameters.Add(
                            parametrosIds[i], SqlDbType.Int
                        ).Value = idsEquipos[i];
                    }

                    using SqlDataReader dr =
                        await cmdImagenes.ExecuteReaderAsync();

                    while (await dr.ReadAsync())
                    {
                        publicIdsParaEliminar.Add(
                            dr["PublicId"].ToString()!
                        );
                    }
                }

                // ====================================================
                // ELIMINAR EQUIPOS DE SQL SERVER
                // EquipoImagenes se elimina mediante ON DELETE CASCADE
                // ====================================================

                string queryEliminar = $@"
                    DELETE FROM dbo.equipos
                    WHERE id IN ({listaIds});";

                using (SqlCommand cmdEliminar = new SqlCommand(
                    queryEliminar, con, transaction))
                {
                    for (int i = 0; i < idsEquipos.Count; i++)
                    {
                        cmdEliminar.Parameters.Add(
                            parametrosIds[i], SqlDbType.Int
                        ).Value = idsEquipos[i];
                    }

                    await cmdEliminar.ExecuteNonQueryAsync();
                }

                // ====================================================
                // COMPROBAR QUE LAS IMÁGENES NO SE USEN EN OTROS
                // EQUIPOS ANTES DE ELIMINARLAS DE CLOUDINARY
                // ====================================================

                var imagenesSinReferencias = new List<string>();

                foreach (var publicId in publicIdsParaEliminar.Distinct())
                {
                    using SqlCommand cmdReferencia = new SqlCommand(@"
                        SELECT COUNT(1)
                        FROM dbo.EquipoImagenes
                        WHERE PublicId = @publicId;",
                        con, transaction);

                    cmdReferencia.Parameters.Add(
                        "@publicId", SqlDbType.VarChar, 300
                    ).Value = publicId;

                    int referencias = Convert.ToInt32(
                        await cmdReferencia.ExecuteScalarAsync());

                    if (referencias == 0)
                    {
                        imagenesSinReferencias.Add(publicId);
                    }
                }

                // ====================================================
                // CONFIRMAR ELIMINACIÓN EN SQL SERVER
                // ====================================================

                transaction.Commit();

                // ====================================================
                // ELIMINAR IMÁGENES DE CLOUDINARY
                // ====================================================

                foreach (var publicId in imagenesSinReferencias)
                {
                    try
                    {
                        bool eliminado =
                            await _cloudinaryService.EliminarImagenAsync(publicId);

                        if (!eliminado)
                            publicIdsFallidos.Add(publicId);
                    }
                    catch
                    {
                        publicIdsFallidos.Add(publicId);
                    }
                }

                return (idsEquipos.Count, publicIdsFallidos);
            }
            catch
            {
                if (transaction.Connection != null)
                    transaction.Rollback();

                throw;
            }
        }





    }
}
