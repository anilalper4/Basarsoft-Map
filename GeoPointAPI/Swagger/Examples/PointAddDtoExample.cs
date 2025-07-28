using GeoPointAPI.DTOs.Points;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace GeoPointAPI.Swagger.Examples
{
    public class PointAddDtoExample : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (context.Type == typeof(PointAddDTO))
            {
                schema.Example = new OpenApiObject
                {
                    ["name"] = new OpenApiString("string"),
                    ["wkt"] = new OpenApiString("POINT(29.0 41.0)")
                };
            }
        }
    }
}
