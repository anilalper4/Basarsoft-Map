using GeoPointAPI.Models;

namespace GeoPointAPI.Repository
{
    public interface IUnitOfWork
    {
        IRepository<PointEntity> Points { get; }
        Task<int> SaveChangesAsync();
    }
}
