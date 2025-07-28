using GeoPointAPI.Data;
using GeoPointAPI.Models;

namespace GeoPointAPI.Repository
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        public IRepository<PointEntity> Points { get; }

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
            Points = new EfRepository<PointEntity>(context);
        }

        public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();
    }
}
