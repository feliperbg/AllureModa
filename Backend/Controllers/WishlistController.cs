using AllureModa.API.Data;
using AllureModa.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api/wishlist")]
    [Authorize]
    public class WishlistController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public WishlistController(ApplicationDbContext context)
        {
            _context = context;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<WishlistItem>>> GetMyWishlist()
        {
            var userId = GetUserId();
            return await _context.WishlistItems
                .Include(w => w.Product)
                    .ThenInclude(p => p.Images)
                .Where(w => w.UserId == userId)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<WishlistItem>> AddToWishlist(WishlistItem item)
        {
            item.UserId = GetUserId();
            
            if (await _context.WishlistItems.AnyAsync(w => w.UserId == item.UserId && w.ProductId == item.ProductId))
            {
                return Conflict(new { message = "Product already in wishlist" });
            }

            _context.WishlistItems.Add(item);
            await _context.SaveChangesAsync();
            
            // Re-fetch to include product details if needed
             var newItem = await _context.WishlistItems
                .Include(w => w.Product)
                .FirstOrDefaultAsync(w => w.Id == item.Id);

            return CreatedAtAction(nameof(GetMyWishlist), new { id = item.Id }, newItem);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveFromWishlist(string id)
        {
            var userId = GetUserId();
            var item = await _context.WishlistItems.FirstOrDefaultAsync(w => w.Id == id && w.UserId == userId);

            if (item == null) return NotFound();

            _context.WishlistItems.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
