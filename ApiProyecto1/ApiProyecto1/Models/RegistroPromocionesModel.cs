
namespace ApiProyecto1.Models
{
    public class RegistroPromocionesModel
    {
        public int Id_Prom { get; set; }

        public string Url_Imagen_Prom { get; set; } = string.Empty;

        public int Fila_Prom { get; set; }

        public int Orden_Prom { get; set; } = 1;

        public string? Enlace_Prom { get; set; }

        public bool Activo_Prom { get; set; } = true;

        // Auditoría
        public string? Usuaregist_Prom { get; set; }

        public DateTime? Fechregist_Prom { get; set; }

        public string? Usuarmodif_Prom { get; set; }

        public DateTime? Fechmodif_Prom { get; set; }
    }
}
