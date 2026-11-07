using Proyecto1.Services;
using Proyecto1.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// MVC
builder.Services.AddControllersWithViews();

// AUTENTICACIÓN
builder.Services.AddAuthentication("Cookies")
    .AddCookie("Cookies", options =>
    {
        options.LoginPath = "/Login/Index";
        options.AccessDeniedPath = "/Login/Index";
    });

// ========================================
// CONFIGURACIÓN CENTRALIZADA DE LA API
// ========================================

var entornoActivo = builder.Configuration["ApiSettings:EntornoActivo"];

if (string.IsNullOrWhiteSpace(entornoActivo))
{
    throw new InvalidOperationException(
        "No se ha configurado ApiSettings:EntornoActivo."
    );
}

var apiUrl = builder.Configuration[$"ApiSettings:{entornoActivo}"];

if (!Uri.TryCreate(apiUrl, UriKind.Absolute, out var apiUri) ||
    (apiUri.Scheme != Uri.UriSchemeHttps &&
     !builder.Environment.IsDevelopment()))
{
    throw new InvalidOperationException(
        $"La URL configurada para '{entornoActivo}' no es válida."
    );
}

// CLIENTE HTTP COMPARTIDO
builder.Services.AddHttpClient<IApiClientService, ApiClientService>(client =>
{
    client.BaseAddress = apiUri;
    client.Timeout = TimeSpan.FromSeconds(30);
});

// ========================================

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Inicio}/{action=Index}/{id?}");

app.Run();
