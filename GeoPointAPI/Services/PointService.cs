using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using GeoPointAPI.Helpers;
using GeoPointAPI.Models;
using GeoPointAPI.Repository;
using GeoPointAPI.Services.Interfaces;
using GeoPointAPI.DTOs.Points;

namespace GeoPointAPI.Services
{
    public class PointService : IPointService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PointService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse> AddPointAsync(PointAddDTO dto)
        {
            var reader = new WKTReader();
            Geometry geometry;
            try { geometry = reader.Read(dto.WKT); }
            catch { return new ApiResponse { Success = false, Message = "Invalid WKT" }; }

            if (geometry.GeometryType != "Point")
                return new ApiResponse { Success = false, Message = "Only Point is supported" };

            var point = new PointEntity { Name = dto.Name, Wkt = dto.WKT, Location = geometry };
            await _unitOfWork.Points.AddAsync(point);
            await _unitOfWork.SaveChangesAsync();

            return new ApiResponse { Success = true, Message = "Point created", Id = point.Id };
        }

        public async Task<ApiResponse> GetAllPointsAsync()
        {
            var points = await _unitOfWork.Points.GetAllAsync();
            var reader = new WKTWriter();
            var result = points.Select(p => new PointDTO
            {
                Id = p.Id,
                Name = p.Name,
                WKT = p.Location != null ? reader.Write(p.Location) : null
            });

            return new ApiResponse { Success = true, Id = result.ToList() };
        }

        public async Task<ApiResponse> GetByIdAsync(int id)
        {
            var point = await _unitOfWork.Points.GetByIdAsync(id);
            if (point == null)
                return new ApiResponse { Success = false, Message = "Not found" };

            var reader = new WKTWriter();
            return new ApiResponse
            {
                Success = true,
                Id = new PointDTO
                {
                    Id = point.Id,
                    Name = point.Name,
                    WKT = point.Location != null ? reader.Write(point.Location) : null
                }
            };
        }

        public async Task<ApiResponse> UpdateAsync(int id, PointUpdateDTO dto)
        {
            var point = await _unitOfWork.Points.GetByIdAsync(id);
            if (point == null)
                return new ApiResponse { Success = false, Message = "Not found" };

            var reader = new WKTReader();
            Geometry geometry;
            try { geometry = reader.Read(dto.WKT); }
            catch { return new ApiResponse { Success = false, Message = "Invalid WKT" }; }

            point.Name = dto.Name;
            point.Location = geometry;
            point.Wkt = dto.WKT;

            await _unitOfWork.SaveChangesAsync();
            return new ApiResponse { Success = true, Message = "Updated" };
        }

        public async Task<ApiResponse> DeleteAsync(int id)
        {
            var point = await _unitOfWork.Points.GetByIdAsync(id);
            if (point == null)
                return new ApiResponse { Success = false, Message = "Not found" };

            await _unitOfWork.Points.DeleteAsync(point);
            await _unitOfWork.SaveChangesAsync();
            return new ApiResponse { Success = true, Message = "Deleted" };
        }
    }
}