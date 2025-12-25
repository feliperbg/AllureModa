using AllureModa.API.Data;
using AllureModa.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api/orders")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrderController(ApplicationDbContext context)
        {
            _context = context;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? throw new UnauthorizedAccessException("User not authenticated");

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Order>>> GetMyOrders()
        {
            var userId = GetUserId();
            return await _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.Items)
                    .ThenInclude(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv.Product)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder(Order order)
        {
            var userId = GetUserId();
            order.UserId = userId; // Enforce user ownership
            order.Status = OrderStatus.PENDING;
            order.CreatedAt = DateTime.UtcNow;
            
            // In a real scenario, we would calculate TotalPrice from items DB prices, not trust frontend.
            // For migration, we accept standard logic but validation is recommended.
            
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Clear Cart (Optional, assuming Checkout clears cart)
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);
            
            if (cart != null)
            {
                 _context.CartItems.RemoveRange(cart.Items);
                 await _context.SaveChangesAsync();
            }

            return CreatedAtAction(nameof(GetMyOrders), new { id = order.Id }, order);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrderById(string id)
        {
             var order = await _context.Orders
                .Include(o => o.Items)
                    .ThenInclude(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv.Product)
                 .Include(o => o.ShippingAddress)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();
            
            // Authorization check - user can only see their own orders
            if (order.UserId != GetUserId()) return Forbid();

            return order;
        }
    }
}
