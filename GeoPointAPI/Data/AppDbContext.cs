using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using GeoPointAPI.Models;

namespace GeoPointAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<PointEntity> Points => Set<PointEntity>();
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<PointEntity>()
                .Property(p => p.Location)
                .HasColumnType("geometry(Geometry, 4326)");
        }
    }
}
