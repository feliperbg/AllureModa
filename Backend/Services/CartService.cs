using AllureModa.API.Data;
using AllureModa.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AllureModa.API.Services
{
    public class CartService : ICartService
    {
        private readonly ApplicationDbContext _context;

        public CartService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Cart> GetCartAsync(string userId)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                    .ThenInclude(ci => ci.ProductVariant)
                        .ThenInclude(pv => pv.Product)
                .Include(c => c.Items)
                    .ThenInclude(ci => ci.ProductVariant)
                        .ThenInclude(pv => pv.Images)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null)
            {
                cart = new Cart { UserId = userId };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            return cart;
        }

        public async Task<Cart> AddItemAsync(string userId, CartItem item)
        {
            var cart = await GetCartAsync(userId); // Ensure cart exists

            var existingItem = cart.Items.FirstOrDefault(i => i.ProductVariantId == item.ProductVariantId);
            if (existingItem != null)
            {
                existingItem.Quantity += item.Quantity;
            }
            else
            {
                item.CartId = cart.Id;
                cart.Items.Add(item);
            }

            await _context.SaveChangesAsync();
            
            // Refresh to get full includes
            return await GetCartAsync(userId);
        }

        public async Task<Cart> RemoveItemAsync(string userId, string variantId)
        {
            var cart = await GetCartAsync(userId);
            var item = cart.Items.FirstOrDefault(i => i.ProductVariantId == variantId);

            if (item != null)
            {
                cart.Items.Remove(item);
                await _context.SaveChangesAsync();
            }

            return cart;
        }

        public async Task ClearCartAsync(string userId)
        {
             var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

             if (cart != null && cart.Items.Any())
             {
                 _context.CartItems.RemoveRange(cart.Items);
                 await _context.SaveChangesAsync();
             }
        }
    }
}
