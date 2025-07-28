using Microsoft.EntityFrameworkCore;
using System;
using System.Linq.Expressions;
using GeoPointAPI.Data;

namespace GeoPointAPI.Repository
{
    public class EfRepository<T> : IRepository<T> where T : class
    {
        private readonly AppDbContext _context;
        private readonly DbSet<T> _dbSet;

        public EfRepository(AppDbContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }

        public async Task AddAsync(T entity) => await _dbSet.AddAsync(entity);
        public async Task DeleteAsync(T entity) => _dbSet.Remove(entity);
        public async Task<IEnumerable<T>> GetAllAsync() => await _dbSet.ToListAsync();
        public async Task<T?> GetByIdAsync(int id) => await _dbSet.FindAsync(id);
        public async Task UpdateAsync(T entity) => _dbSet.Update(entity);
        public async Task<bool> ExistsAsync(Expression<Func<T, bool>> predicate) => await _dbSet.AnyAsync(predicate);
    }
}