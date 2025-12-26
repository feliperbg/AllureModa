using AllureModa.API.Models;

namespace AllureModa.API.Services
{
    public interface IProductService
    {
        Task<IEnumerable<Product>> GetProductsAsync(string? search, string? categoryId, string? brandId, bool? isPromotional, string? sort, int page, int limit);
        Task<Product?> GetProductBySlugAsync(string slug);
        Task<Product?> GetProductByIdAsync(string id);
        Task<Product> CreateProductAsync(Product product);
        Task<Product> UpdateProductAsync(string id, Product product);
        Task DeleteProductAsync(string id);
        Task<IEnumerable<Product>> GetFeaturedProductsAsync(string? type);
    }
}
