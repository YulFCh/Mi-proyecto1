
using ApiProyecto1.Middleware;
using ApiProyecto1.Services;
using ApiProyecto1.Services.Caracteristicas;
using ApiProyecto1.Services.Carrusel;
using ApiProyecto1.Services.Catalogos;
using ApiProyecto1.Services.Informes;
using ApiProyecto1.Services.Nosotros;
using ApiProyecto1.Services.Pedidos;
using ApiProyecto1.Services.Servicios;
using Microsoft.OpenApi;


var builder = WebApplication.CreateBuilder(args);

// CONTROLLERS
builder.Services.AddControllers();

// SWAGGER
builder.Services.AddEndpointsApiExplorer();


builder.Services.AddSwaggerGen(options =>
{
    options.CustomSchemaIds(type => type.FullName);

    // AUTORIZACIÓN MEDIANTE TOKEN
    options.AddSecurityDefinition("ApiKey", new OpenApiSecurityScheme
    {
        Description = "Introduce el token secreto de acceso a la API.",
        Name = "X-API-KEY",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey
    });

    options.AddSecurityRequirement(document =>
        new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference("ApiKey", document)] = []
        }
    );
});


// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTodo", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddScoped<UsuarioService>();
builder.Services.AddScoped<RegistrosService>();
builder.Services.AddScoped<EditarEquiposService>();
builder.Services.AddScoped<PedidosService>();
builder.Services.AddScoped<TicketService>();
builder.Services.AddScoped<VerPedidosService>();
builder.Services.AddScoped<CarruselService>();
builder.Services.AddScoped<CaracteristicasEquiposService>();
builder.Services.AddScoped<ServiciosService>();
builder.Services.AddHttpClient<CloudinaryService>();
builder.Services.AddScoped<NosotrosService>();
builder.Services.AddHttpClient<CloudinaryNosotrosService>();
builder.Services.AddScoped<InformesService>();
builder.Services.AddScoped<EquiposService>();

var app = builder.Build();

// SWAGGER
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

// CORS
app.UseCors("PermitirTodo");

// VALIDAR TOKEN
app.UseMiddleware<ApiKeyMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.Run();
