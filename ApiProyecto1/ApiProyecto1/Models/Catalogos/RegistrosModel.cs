
using ApiProyecto1.Models.Catalogos;

namespace ApiProyecto1.Models.Catalogos
{
    public class RegistrosModel
    {
        public int Id { get; set; }

        public string Tipo_Equipo { get; set; } = "";

        public string? Color { get; set; }
        public string? Modelo { get; set; }
        public string? Descripcion { get; set; }

        public decimal Precio { get; set; }
        public DateTime? Fecha_Registro { get; set; }

        public List<EquipoImagenModel> Imagenes { get; set; } = new();

        public string? Marca { get; set; }
        public string? Codigo_Producto { get; set; }

        public decimal? Precio_Antes { get; set; }
        public decimal? Descuento { get; set; }

        public string? Estado { get; set; }

        public string? Usuario_Registra { get; set; }

        public string? Descripcion1 { get; set; }
        public string? Garantia { get; set; }

        public int? IdSubcategoria { get; set; }

        public List<VarianteModel> Variantes { get; set; } = new();
    }

    public class VarianteModel
    {
        public int Id { get; set; }

        public string? Color { get; set; }

        public decimal Precio { get; set; }
        public decimal? Precio_Antes { get; set; }
        public decimal? Descuento { get; set; }

        public string? Estado { get; set; }

        public string? Codigo_Producto { get; set; }

        public int Stock { get; set; }

        public string? Descripcion { get; set; }
        public string? Descripcion1 { get; set; }
        public string? Garantia { get; set; }

        public List<EquipoImagenModel> Imagenes { get; set; } = new();
    }
}
