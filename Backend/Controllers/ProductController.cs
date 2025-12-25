using AllureModa.API.Data;
using AllureModa.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? categoryId,
            [FromQuery] string? brandId,
            [FromQuery] bool? isPromotional,
            [FromQuery] string? sort,
            [FromQuery] int page = 1,
            [FromQuery] int limit = 20)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Name.Contains(search) || p.Description.Contains(search));
            }

            if (!string.IsNullOrEmpty(categoryId))
            {
                query = query.Where(p => p.CategoryId == categoryId);
            }

            if (!string.IsNullOrEmpty(brandId))
            {
                query = query.Where(p => p.BrandId == brandId);
            }

            if (isPromotional.HasValue)
            {
                query = query.Where(p => p.IsPromotional == isPromotional.Value);
            }

            // Sorting
            query = sort switch
            {
                "price_asc" => query.OrderBy(p => p.BasePrice),
                "price_desc" => query.OrderByDescending(p => p.BasePrice),
                "newest" => query.OrderByDescending(p => p.CreatedAt),
                _ => query.OrderBy(p => p.Name)
            };

            // Pagination
            var products = await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("slug/{slug}")]
        public async Task<ActionResult<Product>> GetBySlug(string slug)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Images)
                .Include(p => p.Variants)
                    .ThenInclude(v => v.Attributes)
                        .ThenInclude(va => va.AttributeValue)
                            .ThenInclude(av => av.Attribute)
                .FirstOrDefaultAsync(p => p.Slug == slug);

            if (product == null) return NotFound(new { message = "Product not found" });
            return product;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetById(string id)
        {
             var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Images)
                .Include(p => p.Variants)
                .FirstOrDefaultAsync(p => p.Id == id);
            
            if (product == null) return NotFound(new { message = "Product not found" });
            return product;
        }

        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<Product>> Create(Product product)
        {
            _context.Products.Add(product);
            try
            {
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
            }
            catch (DbUpdateException)
            {
                if (await _context.Products.AnyAsync(p => p.Slug == product.Slug))
                {
                    return Conflict(new { message = "Slug already exists" });
                }
                throw;
            }
        }
        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<Product>> Update(string id, Product product)
        {
            if (id != product.Id) return BadRequest();

            // Transaction execution strategy for complex graphs
            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync<ActionResult<Product>>(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                   // 1. Check existing product
                   var existingProduct = await _context.Products.FindAsync(id);
                   if (existingProduct == null) return NotFound();

                   // 2. Update basic fields
                   existingProduct.Name = product.Name;
                   existingProduct.Description = product.Description;
                   existingProduct.Slug = product.Slug;
                   existingProduct.CategoryId = product.CategoryId;
                   existingProduct.BrandId = product.BrandId;
                   existingProduct.BasePrice = product.BasePrice;
                   existingProduct.PromotionalPrice = product.PromotionalPrice;
                   existingProduct.IsPromotional = product.IsPromotional;
                   existingProduct.UpdatedAt = DateTime.UtcNow;

                   // 3. Clear existing relations (Variants & Images) - Simplified approach
                   // Real-world: Check if variant is in OrderItem before deleting!
                   var variants = await _context.ProductVariants.Where(v => v.ProductId == id).ToListAsync();
                   var variantIds = variants.Select(v => v.Id).ToList();

                   if (await _context.OrderItems.AnyAsync(oi => variantIds.Contains(oi.ProductVariantId)))
                   {
                       return BadRequest(new { message = "Cannot update product because one or more variants are part of an existing order." });
                   }

                   _context.ProductVariants.RemoveRange(variants);
                   
                   // Remove CartItems for these variants
                   var cartItems = await _context.CartItems.Where(ci => variantIds.Contains(ci.ProductVariantId)).ToListAsync();
                   _context.CartItems.RemoveRange(cartItems);

                   // Remove old images
                   var images = await _context.ProductImages.Where(pi => pi.ProductId == id).ToListAsync();
                   _context.ProductImages.RemoveRange(images);
                   
                   await _context.SaveChangesAsync();

                   // 4. Add new variants and images
                   // Note: Incoming 'product' object should have Variants and Images populated
                   if (product.Variants != null)
                   {
                       foreach (var v in product.Variants)
                       {
                           v.ProductId = id; // Ensure ID link
                           v.Id = Guid.NewGuid().ToString(); // New IDs
                           _context.ProductVariants.Add(v);
                       }
                   }

                   if (product.Images != null)
                   {
                       foreach (var img in product.Images)
                       {
                           img.ProductId = id;
                           img.Id = Guid.NewGuid().ToString();
                           _context.ProductImages.Add(img);
                       }
                   }

                   await _context.SaveChangesAsync();
                   await transaction.CommitAsync();

                   return Ok(existingProduct);
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, new { message = ex.Message });
                }
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Delete(string id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();

            // Check if product is in any order (via variants)
            var variantIds = await _context.ProductVariants.Where(v => v.ProductId == id).Select(v => v.Id).ToListAsync();
            if (await _context.OrderItems.AnyAsync(oi => variantIds.Contains(oi.ProductVariantId)))
            {
                 // Soft delete or block
                 return BadRequest(new {message = "Cannot delete product that has existing orders."});
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("featured")]
        public async Task<ActionResult<IEnumerable<Product>>> GetFeatured([FromQuery] string? type)
        {
            if (type == "promo")
            {
                return await _context.Products
                    .Where(p => p.IsPromotional)
                    .Include(p => p.Images)
                    .Include(p => p.Brand)
                    .Include(p => p.Category)
                    .Take(8)
                    .ToListAsync();
            }

            // Top Selling logic
             var topVariants = await _context.OrderItems
                .GroupBy(oi => oi.ProductVariantId)
                .Select(g => new { VariantId = g.Key, Quantity = g.Sum(oi => oi.Quantity) })
                .OrderByDescending(x => x.Quantity)
                .Take(8)
                .ToListAsync();

            var variantIds = topVariants.Select(v => v.VariantId).ToList();
            
            if (!variantIds.Any()) return Ok(new List<Product>());

            var products = await _context.ProductVariants
                .Where(v => variantIds.Contains(v.Id))
                .Select(v => v.Product!)
                .Distinct()
                .Include(p => p.Images)
                .Include(p => p.Brand)
                .Include(p => p.Category)
                .ToListAsync();

            return Ok(products);
        }
    }
}
