using AllureModa.API.Data;
using AllureModa.API.DTOs;
using AllureModa.API.Models;
using AllureModa.API.Services.Email;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api/newsletter")]
    public class NewsletterController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<NewsletterController> _logger;

        public NewsletterController(ApplicationDbContext context, IEmailService emailService, ILogger<NewsletterController> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        [HttpPost("subscribe")]
        [AllowAnonymous]
        public async Task<IActionResult> Subscribe([FromBody] NewsletterSubscribeRequest request)
        {
            var existing = await _context.NewsletterSubscribers
                .FirstOrDefaultAsync(s => s.Email == request.Email);

            if (existing != null)
            {
                if (!existing.IsActive)
                {
                    existing.IsActive = true;
                    await _context.SaveChangesAsync();
                }
                return Ok(new { message = "Subscribed successfully" });
            }

            var subscriber = new NewsletterSubscriber
            {
                Email = request.Email,
                IsActive = true
            };

            _context.NewsletterSubscribers.Add(subscriber);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Subscribed successfully" });
        }

        [HttpGet("unsubscribe")]
        [AllowAnonymous]
        public async Task<IActionResult> Unsubscribe([FromQuery] string email)
        {
            if (string.IsNullOrEmpty(email)) return BadRequest("Email required");

            var subscriber = await _context.NewsletterSubscribers.FirstOrDefaultAsync(s => s.Email == email);
            if (subscriber != null)
            {
                subscriber.IsActive = false;
                await _context.SaveChangesAsync();
            }

            // Return a simple HTML page or redirect to frontend
            return Content("<h1>Unsubscribed successfully</h1><p>You will no longer receive our newsletter.</p>", "text/html");
        }

        [HttpGet("subscribers")]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<IEnumerable<NewsletterSubscriber>>> GetSubscribers()
        {
            return await _context.NewsletterSubscribers.ToListAsync();
        }

        [HttpPost("send")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> SendNewsletter([FromBody] SendNewsletterRequest request)
        {
            var subscribers = await _context.NewsletterSubscribers
                .Where(s => s.IsActive)
                .ToListAsync();

            if (!subscribers.Any())
            {
                return Ok(new { message = "No active subscribers found." });
            }

            // In a production scenario, this should be offloaded to a Background Job (Hangfire)
            // to avoid timeout and ensure delivery.
            // For now, we will fire and forget or await in a simplified manner.
            
            int count = 0;
            foreach (var sub in subscribers)
            {
                try 
                {
                    // Adding Unsubscribe Link logic would be ideal here
                    var bodyWithUnsub = request.Content + "<br/><br/><small>Environment: Development</small>";
                    
                    await _emailService.SendEmailAsync(sub.Email, request.Subject, bodyWithUnsub);
                    count++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send newsletter to {Email}", sub.Email);
                }
            }

            return Ok(new { message = $"Newsletter queued/sent to {count} subscribers." });
        }
    }
}
