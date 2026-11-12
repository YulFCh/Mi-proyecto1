
namespace ApiProyecto1.Models.Informes
{
    public class GuardarSeccionWebModel
    {
        public string Titulo { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public int OrdenSeccion { get; set; }
        public bool Estado { get; set; } = true;

        public string Usuario { get; set; } = string.Empty;

        public List<GuardarElementoSeccionWebModel> Elementos { get; set; } = new();
    }
}
