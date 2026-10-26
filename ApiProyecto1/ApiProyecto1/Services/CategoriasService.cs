using ApiProyecto1.Models;
using Microsoft.Data.SqlClient;

namespace ApiProyecto1.Services
{
    public class CategoriasService
    {
        private readonly string _connectionString;

        public CategoriasService(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException(
                    "No se encontró DefaultConnection.");
        }

        public List<CategoriaModel> Listar()
        {
            var categorias = new List<CategoriaModel>();

            using SqlConnection con = new SqlConnection(_connectionString);

            string query = @"
                SELECT
                    c.IdCategoria,
                    c.Nombre AS Categoria,
                    c.Icono,
                    s.IdSubcategoria,
                    s.IdCategoria AS SubcategoriaIdCategoria,
                    s.Nombre AS Subcategoria
                FROM Categorias c
                LEFT JOIN Subcategorias s
                    ON c.IdCategoria = s.IdCategoria
                    AND s.Estado = 1
                WHERE c.Estado = 1
                ORDER BY c.IdCategoria, s.IdSubcategoria;";

            using SqlCommand cmd = new SqlCommand(query, con)
            {
                CommandTimeout = 30
            };

            con.Open();

            using SqlDataReader dr = cmd.ExecuteReader();

            while (dr.Read())
            {
                int idCategoria = Convert.ToInt32(dr["IdCategoria"]);

                var categoria = categorias.FirstOrDefault(
                    c => c.IdCategoria == idCategoria);

                if (categoria == null)
                {
                    categoria = new CategoriaModel
                    {
                        IdCategoria = idCategoria,
                        Nombre = dr["Categoria"].ToString() ?? "",
                        Icono = dr["Icono"] == DBNull.Value
                            ? null
                            : dr["Icono"].ToString()
                    };

                    categorias.Add(categoria);
                }

                if (dr["IdSubcategoria"] != DBNull.Value)
                {
                    categoria.Subcategorias.Add(new SubcategoriaModel
                    {
                        IdSubcategoria =
                            Convert.ToInt32(dr["IdSubcategoria"]),

                        IdCategoria =
                            Convert.ToInt32(dr["SubcategoriaIdCategoria"]),

                        Nombre = dr["Subcategoria"].ToString() ?? ""
                    });
                }
            }

            return categorias;
        }
    }
}
