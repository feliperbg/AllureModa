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
        [Obsolete("Use /api/checkout instead")]
        public ActionResult<Order> CreateOrder(Order order)
        {
            // Deprecated to ensure data integrity (Stock management, proper payment flows).
            return StatusCode(410, new { message = "This endpoint is deprecated. Please use /api/checkout." });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Order>> GetOrderById(string id)
        {
             var order = await _context.Orders
                .Include(o => o.Items)
                    .ThenInclude(oi => oi.ProductVariant)
                        .ThenInclude(pv => pv.Product)
                 .Include(o => o.ShippingAddress)
                 .Include(o => o.Payments)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();
            
            // Authorization check - user can only see their own orders
            if (order.UserId != GetUserId()) return Forbid();

            return order;
        }
    }
}
