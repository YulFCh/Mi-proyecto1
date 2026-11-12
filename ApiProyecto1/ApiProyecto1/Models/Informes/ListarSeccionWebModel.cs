
namespace ApiProyecto1.Models.Informes
{
    public class ListarSeccionWebModel
    {
        public int IdSeccion { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public int OrdenSeccion { get; set; }
        public bool Estado { get; set; }

        public DateTime FechRegist { get; set; }
        public string UsuaRegist { get; set; } = string.Empty;
        public DateTime? FechModif { get; set; }
        public string? UsuarModif { get; set; }

        public List<ListarElementoSeccionWebModel> Elementos { get; set; } = new();
    }
}
