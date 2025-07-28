using GeoPointAPI.DTOs.Points;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace GeoPointAPI.Swagger.Examples
{
    public class PointUpdateDtoExample : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (context.Type == typeof(PointUpdateDTO))
            {
                schema.Example = new OpenApiObject
                {
                    ["name"] = new OpenApiString("string"),
                    ["wkt"] = new OpenApiString("POINT(30 40)")
                };
            }
        }
    }
}
