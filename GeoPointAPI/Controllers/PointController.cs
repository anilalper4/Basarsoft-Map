using Microsoft.AspNetCore.Mvc;
using GeoPointAPI.Services.Interfaces;
using GeoPointAPI.DTOs.Points;

namespace GeoPointAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PointController : ControllerBase
    {
        private readonly IPointService _pointService;

        public PointController(IPointService pointService)
        {
            _pointService = pointService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _pointService.GetAllPointsAsync());

        [HttpPost]
        public async Task<IActionResult> Add(PointAddDTO dto) => Ok(await _pointService.AddPointAsync(dto));

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id) => Ok(await _pointService.GetByIdAsync(id));

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, PointUpdateDTO dto) => Ok(await _pointService.UpdateAsync(id, dto));

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id) => Ok(await _pointService.DeleteAsync(id));
    }
}