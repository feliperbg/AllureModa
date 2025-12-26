using AllureModa.API.Data;
using AllureModa.API.Models;
using AllureModa.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
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
            var products = await _productService.GetProductsAsync(search, categoryId, brandId, isPromotional, sort, page, limit);
            return Ok(products);
        }

        [HttpGet("slug/{slug}")]
        public async Task<ActionResult<Product>> GetBySlug(string slug)
        {
            var product = await _productService.GetProductBySlugAsync(slug);
            if (product == null) return NotFound(new { message = "Product not found" });
            return product;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetById(string id)
        {
             var product = await _productService.GetProductByIdAsync(id);
            if (product == null) return NotFound(new { message = "Product not found" });
            return product;
        }

        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<Product>> Create(Product product)
        {
            try
            {
                var createdProduct = await _productService.CreateProductAsync(product);
                return CreatedAtAction(nameof(GetById), new { id = createdProduct.Id }, createdProduct);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<Product>> Update(string id, Product product)
        {
            if (id != product.Id) return BadRequest();

            try
            {
                var updatedProduct = await _productService.UpdateProductAsync(id, product);
                return Ok(updatedProduct);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                await _productService.DeleteProductAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("featured")]
        public async Task<ActionResult<IEnumerable<Product>>> GetFeatured([FromQuery] string? type)
        {
            var products = await _productService.GetFeaturedProductsAsync(type);
            return Ok(products);
        }
    }
}
