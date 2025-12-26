using AllureModa.API.Data;
using AllureModa.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AllureModa.API.Services
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;

        public ProductService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Product>> GetProductsAsync(string? search, string? categoryId, string? brandId, bool? isPromotional, string? sort, int page, int limit)
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

            query = sort switch
            {
                "price_asc" => query.OrderBy(p => p.BasePrice),
                "price_desc" => query.OrderByDescending(p => p.BasePrice),
                "newest" => query.OrderByDescending(p => p.CreatedAt),
                _ => query.OrderBy(p => p.Name)
            };

            return await query
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<Product?> GetProductBySlugAsync(string slug)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .Include(p => p.Images)
                .Include(p => p.Variants)
                    .ThenInclude(v => v.Attributes)
                        .ThenInclude(va => va.AttributeValue)
                            .ThenInclude(av => av.Attribute)
                .FirstOrDefaultAsync(p => p.Slug == slug);
        }

        public async Task<Product?> GetProductByIdAsync(string id)
        {
            return await _context.Products
               .Include(p => p.Category)
               .Include(p => p.Brand)
               .Include(p => p.Images)
               .Include(p => p.Variants)
               .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Product> CreateProductAsync(Product product)
        {
            if (await _context.Products.AnyAsync(p => p.Slug == product.Slug))
            {
                throw new InvalidOperationException("Slug already exists");
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<Product> UpdateProductAsync(string id, Product product)
        {
            // Transaction execution strategy for complex graphs
            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var existingProduct = await _context.Products.FindAsync(id);
                    if (existingProduct == null) throw new KeyNotFoundException("Product not found");

                    // Update basic fields
                    existingProduct.Name = product.Name;
                    existingProduct.Description = product.Description;
                    existingProduct.Slug = product.Slug;
                    existingProduct.CategoryId = product.CategoryId;
                    existingProduct.BrandId = product.BrandId;
                    existingProduct.BasePrice = product.BasePrice;
                    existingProduct.PromotionalPrice = product.PromotionalPrice;
                    existingProduct.IsPromotional = product.IsPromotional;
                    existingProduct.UpdatedAt = DateTime.UtcNow;

                    // Clear existing relations (Variants & Images)
                    var variants = await _context.ProductVariants.Where(v => v.ProductId == id).ToListAsync();
                    var variantIds = variants.Select(v => v.Id).ToList();

                    if (await _context.OrderItems.AnyAsync(oi => variantIds.Contains(oi.ProductVariantId)))
                    {
                        throw new InvalidOperationException("Cannot update product because one or more variants are part of an existing order.");
                    }

                    _context.ProductVariants.RemoveRange(variants);

                    var cartItems = await _context.CartItems.Where(ci => variantIds.Contains(ci.ProductVariantId)).ToListAsync();
                    _context.CartItems.RemoveRange(cartItems);

                    var images = await _context.ProductImages.Where(pi => pi.ProductId == id).ToListAsync();
                    _context.ProductImages.RemoveRange(images);

                    await _context.SaveChangesAsync();

                    // Add new variants and images
                    if (product.Variants != null)
                    {
                        foreach (var v in product.Variants)
                        {
                            v.ProductId = id; 
                            v.Id = Guid.NewGuid().ToString();
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

                    return existingProduct;
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }

        public async Task DeleteProductAsync(string id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) throw new KeyNotFoundException("Product not found");

            var variantIds = await _context.ProductVariants.Where(v => v.ProductId == id).Select(v => v.Id).ToListAsync();
            if (await _context.OrderItems.AnyAsync(oi => variantIds.Contains(oi.ProductVariantId)))
            {
                throw new InvalidOperationException("Cannot delete product that has existing orders.");
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Product>> GetFeaturedProductsAsync(string? type)
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

            var topVariants = await _context.OrderItems
               .GroupBy(oi => oi.ProductVariantId)
               .Select(g => new { VariantId = g.Key, Quantity = g.Sum(oi => oi.Quantity) })
               .OrderByDescending(x => x.Quantity)
               .Take(8)
               .ToListAsync();

            var variantIds = topVariants.Select(v => v.VariantId).ToList();

            if (!variantIds.Any()) return new List<Product>();

            return await _context.ProductVariants
                .Where(v => variantIds.Contains(v.Id))
                .Select(v => v.Product!)
                .Distinct()
                .Include(p => p.Images)
                .Include(p => p.Brand)
                .Include(p => p.Category)
                .ToListAsync();
        }
    }
}
