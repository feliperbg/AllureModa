using AllureModa.API.Data;
using AllureModa.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api/categories")]
    public class CategoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetAll()
        {
            // Include children for hierarchy
            return await _context.Categories.Include(c => c.Children).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetById(string id)
        {
            var category = await _context.Categories
                .Include(c => c.Children)
                .FirstOrDefaultAsync(c => c.Id == id);
                
            if (category == null) return NotFound(new { message = "Category not found" });
            return category;
        }

        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<Category>> Create(Category category)
        {
            _context.Categories.Add(category);
            try
            {
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
            }
            catch (DbUpdateException)
            {
                if (await _context.Categories.AnyAsync(c => c.Slug == category.Slug))
                {
                    return Conflict(new { message = "Slug already exists" });
                }
                throw;
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Update(string id, Category category)
        {
            if (id != category.Id) return BadRequest();

            _context.Entry(category).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Categories.AnyAsync(c => c.Id == id)) return NotFound();
                throw;
            }

            return Ok(category);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Delete(string id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
