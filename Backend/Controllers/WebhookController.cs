using AllureModa.API.Data;
using AllureModa.API.Models;
using AllureModa.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api/webhook")]
    public class WebhookController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<WebhookController> _logger;

        public WebhookController(
            ApplicationDbContext context, 
            IConfiguration configuration,
            ILogger<WebhookController> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        /// <summary>
        /// Receive Asaas payment webhooks
        /// </summary>
        [HttpPost("asaas")]
        public async Task<IActionResult> AsaasWebhook([FromBody] JsonElement payload)
        {
            var webhookLog = new WebhookLog
            {
                Payload = payload.ToString(),
                Status = "RECEIVED"
            };

            try
            {
                // Validate webhook token (optional but recommended)
                var webhookToken = _configuration["Asaas:WebhookToken"];
                if (!string.IsNullOrEmpty(webhookToken))
                {
                    var authHeader = Request.Headers["asaas-access-token"].FirstOrDefault();
                    if (authHeader != webhookToken)
                    {
                        _logger.LogWarning("Invalid webhook token received");
                        webhookLog.Status = "ERROR";
                        webhookLog.ErrorMessage = "Invalid webhook token";
                        _context.WebhookLogs.Add(webhookLog);
                        await _context.SaveChangesAsync();
                        return Unauthorized();
                    }
                }

                // Parse event
                if (!payload.TryGetProperty("event", out var eventProp))
                {
                    webhookLog.Status = "ERROR";
                    webhookLog.ErrorMessage = "Missing event property";
                    _context.WebhookLogs.Add(webhookLog);
                    await _context.SaveChangesAsync();
                    return BadRequest(new { message = "Missing event property" });
                }

                var eventType = eventProp.GetString();
                webhookLog.Event = eventType;

                _logger.LogInformation("Received Asaas webhook: {Event}", eventType);

                // Get payment data
                if (!payload.TryGetProperty("payment", out var paymentData))
                {
                    webhookLog.Status = "ERROR";
                    webhookLog.ErrorMessage = "Missing payment data";
                    _context.WebhookLogs.Add(webhookLog);
                    await _context.SaveChangesAsync();
                    return BadRequest(new { message = "Missing payment data" });
                }

                var externalId = paymentData.GetProperty("id").GetString();
                var externalReference = paymentData.TryGetProperty("externalReference", out var extRef) 
                    ? extRef.GetString() 
                    : null;

                // Find payment by external ID
                var payment = await _context.Payments
                    .Include(p => p.Order)
                    .FirstOrDefaultAsync(p => p.ExternalId == externalId);

                if (payment == null && !string.IsNullOrEmpty(externalReference))
                {
                    // Try to find by order ID (externalReference)
                    payment = await _context.Payments
                        .Include(p => p.Order)
                        .FirstOrDefaultAsync(p => p.OrderId == externalReference);
                }

                if (payment == null)
                {
                    _logger.LogWarning("Payment not found for external ID: {ExternalId}", externalId);
                    webhookLog.Status = "ERROR";
                    webhookLog.ErrorMessage = $"Payment not found: {externalId}";
                    _context.WebhookLogs.Add(webhookLog);
                    await _context.SaveChangesAsync();
                    return NotFound(new { message = "Payment not found" });
                }

                // Update payment status based on event
                var newStatus = eventType switch
                {
                    "PAYMENT_CONFIRMED" or "PAYMENT_RECEIVED" => PaymentStatus.RECEIVED,
                    "PAYMENT_OVERDUE" => PaymentStatus.OVERDUE,
                    "PAYMENT_REFUNDED" => PaymentStatus.REFUNDED,
                    "PAYMENT_RECEIVED_IN_CASH" => PaymentStatus.RECEIVED_IN_CASH,
                    "PAYMENT_REFUND_REQUESTED" => PaymentStatus.REFUND_REQUESTED,
                    "PAYMENT_CHARGEBACK_REQUESTED" => PaymentStatus.CHARGEBACK_REQUESTED,
                    "PAYMENT_CHARGEBACK_DISPUTE" => PaymentStatus.CHARGEBACK_DISPUTE,
                    "PAYMENT_AWAITING_CHARGEBACK_REVERSAL" => PaymentStatus.AWAITING_CHARGEBACK_REVERSAL,
                    "PAYMENT_DUNNING_REQUESTED" => PaymentStatus.DUNNING_REQUESTED,
                    "PAYMENT_DUNNING_RECEIVED" => PaymentStatus.DUNNING_RECEIVED,
                    "PAYMENT_AWAITING_RISK_ANALYSIS" => PaymentStatus.AWAITING_RISK_ANALYSIS,
                    _ => payment.Status // Keep current status for unknown events
                };

                payment.Status = newStatus;
                payment.UpdatedAt = DateTime.UtcNow;

                // Update payment date if received
                if (newStatus == PaymentStatus.RECEIVED || newStatus == PaymentStatus.RECEIVED_IN_CASH)
                {
                    payment.PaymentDate = DateTime.UtcNow;
                    
                    // Update order status
                    if (payment.Order != null)
                    {
                        payment.Order.Status = OrderStatus.PAID;
                        payment.Order.UpdatedAt = DateTime.UtcNow;
                    }
                }

                // Store updated gateway response
                payment.GatewayResponse = payload.ToString();

                webhookLog.Status = "PROCESSED";
                webhookLog.TenantId = payment.TenantId;
                _context.WebhookLogs.Add(webhookLog);
                
                await _context.SaveChangesAsync();

                _logger.LogInformation("Payment {PaymentId} updated to status {Status}", payment.Id, newStatus);

                return Ok(new { message = "Webhook processed", paymentId = payment.Id, status = newStatus.ToString() });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing Asaas webhook");
                webhookLog.Status = "ERROR";
                webhookLog.ErrorMessage = ex.Message;
                _context.WebhookLogs.Add(webhookLog);
                await _context.SaveChangesAsync();
                
                return StatusCode(500, new { message = "Error processing webhook", error = ex.Message });
            }
        }

        /// <summary>
        /// Get webhook logs (Admin only)
        /// </summary>
        [HttpGet("logs")]
        // [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<IEnumerable<WebhookLog>>> GetLogs([FromQuery] int limit = 50)
        {
            return await _context.WebhookLogs
                .OrderByDescending(w => w.ProcessedAt)
                .Take(limit)
                .ToListAsync();
        }
    }
}
