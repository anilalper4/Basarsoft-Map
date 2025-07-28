using System.ComponentModel.DataAnnotations;
using Swashbuckle.AspNetCore.Annotations;
using GeoPointAPI.Validation;

namespace GeoPointAPI.DTOs.Points
{
    public class PointAddDTO
    {
        [RequiredTrimmed(ErrorMessage = "Name cannot be empty or whitespace")]
        [NoDigits(ErrorMessage = "Name cannot contain digits")]
        [MaxLength200(ErrorMessage = "Name cannot exceed 200 characters")]
        [SwaggerSchema("Noktanın adı", Nullable = false)]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "WKT is required")]
        [RegularExpression(@"^POINT\s?\((-?\d+(\.\d+)?\s-?\d+(\.\d+)?)\)$",
            ErrorMessage = "WKT formatı hatalı. Sadece 'POINT(x y)' formatı destekleniyor.")]
        [SwaggerSchema("Geometrik verinin WKT formatı. Örnek: 'POINT(29.0 41.0)'", Nullable = false)]
        public string WKT { get; set; } = null!;
    }
}
