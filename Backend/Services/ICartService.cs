using AllureModa.API.Models;

namespace AllureModa.API.Services
{
    public interface ICartService
    {
        Task<Cart> GetCartAsync(string userId);
        Task<Cart> AddItemAsync(string userId, CartItem item);
        Task<Cart> RemoveItemAsync(string userId, string variantId);
        Task ClearCartAsync(string userId);
    }
}
