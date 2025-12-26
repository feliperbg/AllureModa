using Hangfire;
using AllureModa.API.Data;
using Microsoft.EntityFrameworkCore;

namespace AllureModa.API.Jobs
{
    public class OrderCleanupJob
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<OrderCleanupJob> _logger;

        public OrderCleanupJob(ApplicationDbContext context, ILogger<OrderCleanupJob> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task ExecuteAsync()
        {
            _logger.LogInformation("Checking for expired orders...");
            
            // Example logic: Cancel orders pending for more than 24 hours
            var expiredOrders = await _context.Orders
                .Where(o => o.Status == Models.OrderStatus.PENDING && o.CreatedAt < DateTime.UtcNow.AddDays(-1))
                .ToListAsync();

            if (expiredOrders.Any())
            {
                foreach (var order in expiredOrders)
                {
                    order.Status = Models.OrderStatus.CANCELLED;
                    // Restore stock logic would go here
                }
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Cancelled {expiredOrders.Count} expired orders.");
            }
        }
    }
}
