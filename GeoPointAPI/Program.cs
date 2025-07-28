using GeoPointAPI;
using GeoPointAPI.Data;
using GeoPointAPI.Repository;
using GeoPointAPI.Services;
using GeoPointAPI.Services.Interfaces;
using GeoPointAPI.Swagger.Examples;
using Microsoft.EntityFrameworkCore;



var builder = WebApplication.CreateBuilder(args);


builder.Services.AddScoped<IPointService, PointService>();

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder.WithOrigins("http://localhost:3000")
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.EnableAnnotations();
    c.SchemaFilter<GeoPointAPI.Swagger.Examples.PointAddDtoExample>();
    c.SchemaFilter<PointUpdateDtoExample>();
});


builder.Services.AddScoped<IPointService, PointService>();



builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
                      npgsqlOptions => npgsqlOptions.UseNetTopologySuite()));


builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();


var app = builder.Build();



if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowFrontend");


app.UseAuthorization();

app.MapControllers();

app.Run();