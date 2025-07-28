using GeoPointAPI.DTOs.Points;
using GeoPointAPI.Helpers;

namespace GeoPointAPI.Services.Interfaces
{
    public interface IPointService
    {
        Task<ApiResponse> GetAllPointsAsync();
        Task<ApiResponse> AddPointAsync(PointAddDTO dto);
        Task<ApiResponse> GetByIdAsync(int id);
        Task<ApiResponse> UpdateAsync(int id, PointUpdateDTO dto);
        Task<ApiResponse> DeleteAsync(int id);
    }
}
