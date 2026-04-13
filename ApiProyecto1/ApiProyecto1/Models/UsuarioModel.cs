namespace ApiProyecto1.Models
{
    public class UsuarioModel
    {
        public int Id { get; set; }

        public string? Nombres { get; set; }
        public string? Apellidos { get; set; }
        public string? Usuario { get; set; }
        public string? Password { get; set; }
        public string? Perfil { get; set; }

        public string? Estado { get; set; }

        public DateTime? Fecha_Registro { get; set; }

        public string? Usuario_Actualiza { get; set; }

        public DateTime? Fecha_Actualiza { get; set; }
    }
}