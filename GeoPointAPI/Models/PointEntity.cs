using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations.Schema;

namespace GeoPointAPI.Models
{
    public class PointEntity
    {
        public int Id { get; set; }
        public string? Name { get; set; }

        public string Wkt { get; set; } = null!;

        [Column(TypeName = "geometry(Geometry, 4326)")]
        public Geometry? Location { get; set; }
    }
}
