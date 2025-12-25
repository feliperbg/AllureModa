using AllureModa.API.Data;
using AllureModa.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using ProductAttr = AllureModa.API.Models.Attribute;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api/attributes")]
    public class AttributeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AttributeController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/attributes - Get all attribute values (for product forms)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AttributeValue>>> GetAllValues()
        {
            return await _context.AttributeValues
                .Include(av => av.Attribute)
                .ToListAsync();
        }

        // GET: api/attributes/grouped - Get attributes with their values grouped
        [HttpGet("grouped")]
        public async Task<ActionResult<IEnumerable<object>>> GetGrouped()
        {
            var attributes = await _context.Attributes
                .Include(a => a.Values)
                .Select(a => new
                {
                    a.Id,
                    a.Name,
                    Values = a.Values.Select(v => new
                    {
                        v.Id,
                        v.Value,
                        v.Meta
                    })
                })
                .ToListAsync();

            return Ok(attributes);
        }

        // GET: api/attributes/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductAttr>> GetById(string id)
        {
            var attr = await _context.Attributes
                .Include(a => a.Values)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (attr == null) return NotFound();
            return attr;
        }

        // POST: api/attributes - Create new attribute
        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<ProductAttr>> Create([FromBody] CreateAttributeDto dto)
        {
            var attr = new ProductAttr
            {
                Id = Guid.NewGuid().ToString(),
                Name = dto.Name,
                Slug = dto.Name.ToLower().Replace(" ", "-")
            };

            _context.Attributes.Add(attr);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = attr.Id }, attr);
        }

        // PUT: api/attributes/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Update(string id, [FromBody] CreateAttributeDto dto)
        {
            var attr = await _context.Attributes.FindAsync(id);
            if (attr == null) return NotFound();

            attr.Name = dto.Name;
            await _context.SaveChangesAsync();

            return Ok(attr);
        }

        // DELETE: api/attributes/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Delete(string id)
        {
            var attr = await _context.Attributes
                .Include(a => a.Values)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (attr == null) return NotFound();

            // Remove all values first
            _context.AttributeValues.RemoveRange(attr.Values);
            _context.Attributes.Remove(attr);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/attributes/{id}/values - Add value to attribute
        [HttpPost("{id}/values")]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<AttributeValue>> AddValue(string id, [FromBody] CreateValueDto dto)
        {
            var attr = await _context.Attributes.FindAsync(id);
            if (attr == null) return NotFound();

            var value = new AttributeValue
            {
                Id = Guid.NewGuid().ToString(),
                AttributeId = id,
                Value = dto.Value,
                Meta = dto.Meta
            };

            _context.AttributeValues.Add(value);
            await _context.SaveChangesAsync();

            return Ok(value);
        }

        // DELETE: api/attributes/values/{valueId}
        [HttpDelete("values/{valueId}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteValue(string valueId)
        {
            var value = await _context.AttributeValues.FindAsync(valueId);
            if (value == null) return NotFound();

            _context.AttributeValues.Remove(value);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class CreateAttributeDto
    {
        public string Name { get; set; } = string.Empty;
    }

    public class CreateValueDto
    {
        public string Value { get; set; } = string.Empty;
        public string? Meta { get; set; }
    }
}
