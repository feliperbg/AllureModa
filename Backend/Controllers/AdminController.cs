using AllureModa.API.Data;
using AllureModa.API.DTOs.Admin;
using AllureModa.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "ADMIN")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<AdminStatsResponse>> GetStats()
        {
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            // 1. Basic Counts (Parallel execution if possible, EF Core allows async mostly)
            // 1. Basic Counts (Execute sequentially to avoid DbContext concurrency issues)
            var usersCount = await _context.Users.CountAsync();
            var productsCount = await _context.Products.CountAsync();
            var ordersCount = await _context.Orders.CountAsync();
            var revenue = await _context.Orders.SumAsync(o => o.TotalPrice);

            // 2. Charts Data (Group By Date) - Optimized in DB
            // Note: Grouping by Date in EF Core with PostgreSQL can be tricky with timezones.
            // Using basic Truncate or explicit Date property if available. 
            // For now, we fetch minimal data or try EF.Functions.
            
            var dailyUsers = await _context.Users
                .Where(u => u.CreatedAt >= thirtyDaysAgo)
                .GroupBy(u => u.CreatedAt.Date)
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .ToListAsync();

            var dailyOrders = await _context.Orders
                .Where(o => o.CreatedAt >= thirtyDaysAgo)
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new { Date = g.Key, Count = g.Count(), Revenue = g.Sum(x => x.TotalPrice) })
                .ToListAsync();

            // 3. Top Products
            // Needs to join OrderItems -> ProductVariant -> Product
            var topVariants = await _context.OrderItems
                .GroupBy(oi => oi.ProductVariantId)
                .Select(g => new { VariantId = g.Key, Quantity = g.Sum(oi => oi.Quantity) })
                .OrderByDescending(x => x.Quantity)
                .Take(6)
                .ToListAsync();

            var variantIds = topVariants.Select(x => x.VariantId).ToList();
            
            var topProducts = await _context.ProductVariants
                .Where(v => variantIds.Contains(v.Id))
                .Select(v => v.Product!) // Select the parent product
                .Distinct()
                .Include(p => p.Category)
                .ToListAsync();

            // Format Charts
            var charts = new DashboardCharts();
            // Fill with 0 for missing days (Logic similar to Node)
            for (int i = 0; i < 30; i++)
            {
                var date = DateTime.UtcNow.AddDays(-i).Date.ToString("yyyy-MM-dd");
                charts.Users[date] = 0;
                charts.Orders[date] = 0;
                charts.Revenue[date] = 0;
            }

            foreach (var item in dailyUsers)
            {
                var date = item.Date.ToString("yyyy-MM-dd");
                if (charts.Users.ContainsKey(date)) charts.Users[date] = item.Count;
            }

            foreach (var item in dailyOrders)
            {
                var date = item.Date.ToString("yyyy-MM-dd");
                if (charts.Orders.ContainsKey(date))
                {
                    charts.Orders[date] = item.Count;
                    charts.Revenue[date] = item.Revenue;
                }
            }

            return Ok(new AdminStatsResponse
            {
                Users = usersCount,
                Products = productsCount,
                Orders = ordersCount,
                Revenue = revenue,
                TopProducts = topProducts,
                Charts = charts
            });
        }

        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<User>>> ListUsers([FromQuery] int page = 1, [FromQuery] int limit = 50)
        {
            var users = await _context.Users
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();
            
            return Ok(users);
        }

        [HttpGet("orders")]
        public async Task<ActionResult<IEnumerable<Order>>> ListOrders([FromQuery] int page = 1, [FromQuery] int limit = 50)
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            return Ok(orders);
        }
    }
}
