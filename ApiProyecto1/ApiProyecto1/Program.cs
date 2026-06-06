using ApiProyecto1.Services;

var builder = WebApplication.CreateBuilder(args);

// 👉 Controllers
builder.Services.AddControllers();

// 👉 Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// 🚀 CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTodo",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});


// 👉 REGISTRAR SERVICES (IMPORTANTE)
builder.Services.AddScoped<UsuarioService>();
builder.Services.AddScoped<RegistrosService>();
builder.Services.AddScoped<EditarEquiposService>();


var app = builder.Build();


// 👉 Swagger
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();


// 🚀 ACTIVAR CORS
app.UseCors("PermitirTodo");

app.UseAuthorization();

app.MapControllers();

app.Run();