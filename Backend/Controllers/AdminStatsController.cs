using AllureModa.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api/admin/stats")]
    [Authorize(Roles = "ADMIN")]
    public class AdminStatsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminStatsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult> GetDashboardStats()
        {
            var now = DateTime.UtcNow;
            var thirtyDaysAgo = now.AddDays(-30);

            // Key metrics
            var totalRevenue = await _context.Orders
                .Where(o => o.PaymentStatus == Models.PaymentStatus.CONFIRMED || o.PaymentStatus == Models.PaymentStatus.RECEIVED)
                .SumAsync(o => o.TotalPrice);

            var totalOrders = await _context.Orders.CountAsync();
            var totalCustomers = await _context.Users.Where(u => u.Role == Models.Role.USER).CountAsync();
            var totalProducts = await _context.Products.CountAsync();

            // Revenue last 30 days (daily)
            var dailyRevenue = await _context.Orders
                .Where(o => o.CreatedAt >= thirtyDaysAgo && (o.PaymentStatus == Models.PaymentStatus.CONFIRMED || o.PaymentStatus == Models.PaymentStatus.RECEIVED))
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new { Date = g.Key, Revenue = g.Sum(o => o.TotalPrice), Orders = g.Count() })
                .OrderBy(x => x.Date)
                .ToListAsync();

            // Orders by status
            var ordersByStatus = await _context.Orders
                .GroupBy(o => o.Status)
                .Select(g => new { Status = g.Key.ToString(), Count = g.Count() })
                .ToListAsync();

            // Top selling products (last 30 days)
            var topProducts = await _context.OrderItems
                .Where(oi => oi.Order!.CreatedAt >= thirtyDaysAgo)
                .GroupBy(oi => new { oi.ProductVariant!.Product!.Id, oi.ProductVariant.Product.Name })
                .Select(g => new { 
                    ProductId = g.Key.Id, 
                    ProductName = g.Key.Name, 
                    QuantitySold = g.Sum(x => x.Quantity),
                    Revenue = g.Sum(x => x.Quantity * x.PriceAtPurchase)
                })
                .OrderByDescending(x => x.QuantitySold)
                .Take(5)
                .ToListAsync();

            // Low stock products
            var lowStockProducts = await _context.ProductVariants
                .Include(v => v.Product)
                .Where(v => v.Stock > 0 && v.Stock <= 5)
                .Select(v => new { v.Id, v.Sku, ProductName = v.Product!.Name, StockQuantity = v.Stock })
                .Take(10)
                .ToListAsync();

            // Recent orders
            var recentOrders = await _context.Orders
                .Include(o => o.User)
                .OrderByDescending(o => o.CreatedAt)
                .Take(5)
                .Select(o => new { 
                    o.Id, 
                    o.OrderNumber, 
                    o.Status, 
                    Total = o.TotalPrice, 
                    o.CreatedAt,
                    CustomerName = o.User!.FirstName + " " + o.User.LastName
                })
                .ToListAsync();

            return Ok(new
            {
                Metrics = new
                {
                    TotalRevenue = totalRevenue,
                    TotalOrders = totalOrders,
                    TotalCustomers = totalCustomers,
                    TotalProducts = totalProducts
                },
                DailyRevenue = dailyRevenue,
                OrdersByStatus = ordersByStatus,
                TopProducts = topProducts,
                LowStockProducts = lowStockProducts,
                RecentOrders = recentOrders
            });
        }
    }
}
