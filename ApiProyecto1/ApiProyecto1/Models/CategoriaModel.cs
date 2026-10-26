namespace ApiProyecto1.Models
{
    public class CategoriaModel
    {
        public int IdCategoria { get; set; }
        public string Nombre { get; set; } = "";
        public string? Icono { get; set; }

        public List<SubcategoriaModel> Subcategorias { get; set; } = new();
    }

    public class SubcategoriaModel
    {
        public int IdSubcategoria { get; set; }
        public int IdCategoria { get; set; }
        public string Nombre { get; set; } = "";
    }
}
