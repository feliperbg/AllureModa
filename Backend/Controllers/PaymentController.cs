using AllureModa.API.Data;
using AllureModa.API.Models;
using AllureModa.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api/payments")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly AsaasService _asaasService;

        public PaymentController(ApplicationDbContext context, AsaasService asaasService)
        {
            _context = context;
            _asaasService = asaasService;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? throw new UnauthorizedAccessException("User not authenticated");

        /// <summary>
        /// Create a PIX payment for an order
        /// </summary>
        [HttpPost("pix/{orderId}")]
        public async Task<ActionResult<Payment>> CreatePixPayment(string orderId)
        {
            return await CreatePayment(orderId, PaymentMethod.PIX);
        }

        /// <summary>
        /// Create a Boleto payment for an order
        /// </summary>
        [HttpPost("boleto/{orderId}")]
        public async Task<ActionResult<Payment>> CreateBoletoPayment(string orderId)
        {
            return await CreatePayment(orderId, PaymentMethod.BOLETO);
        }

        /// <summary>
        /// Create a Credit Card payment for an order
        /// </summary>
        [HttpPost("credit-card/{orderId}")]
        public async Task<ActionResult<Payment>> CreateCreditCardPayment(string orderId, [FromBody] CreditCardRequest? request)
        {
            return await CreatePayment(orderId, PaymentMethod.CREDIT_CARD, request?.CreditCardToken);
        }

        /// <summary>
        /// Get payment status for an order
        /// </summary>
        [HttpGet("order/{orderId}")]
        public async Task<ActionResult<Payment>> GetPaymentByOrder(string orderId)
        {
            var userId = GetUserId();
            var payment = await _context.Payments
                .Include(p => p.Order)
                .FirstOrDefaultAsync(p => p.OrderId == orderId && p.Order!.UserId == userId);

            if (payment == null)
                return NotFound(new { message = "Payment not found for this order" });

            return payment;
        }

        /// <summary>
        /// Get all payments for the current user
        /// </summary>
        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<Payment>>> GetMyPayments()
        {
            var userId = GetUserId();
            return await _context.Payments
                .Include(p => p.Order)
                .Where(p => p.Order!.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        private async Task<ActionResult<Payment>> CreatePayment(string orderId, PaymentMethod method, string? creditCardToken = null)
        {
            var userId = GetUserId();

            // Get the order
            var order = await _context.Orders
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId);

            if (order == null)
                return NotFound(new { message = "Order not found" });

            if (order.Status != OrderStatus.PENDING)
                return BadRequest(new { message = "Order is not pending payment" });

            // Check if payment already exists
            var existingPayment = await _context.Payments.FirstOrDefaultAsync(p => p.OrderId == orderId);
            if (existingPayment != null)
                return BadRequest(new { message = "Payment already exists for this order", paymentId = existingPayment.Id });

            var user = order.User!;

            // Ensure user has Asaas customer ID
            if (string.IsNullOrEmpty(user.AsaasCustomerId))
            {
                try
                {
                    user.AsaasCustomerId = await _asaasService.CreateCustomerAsync(user);
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new { message = "Failed to create customer in Asaas", error = ex.Message });
                }
            }

            // Create payment in Asaas
            try
            {
                var asaasResponse = await _asaasService.CreatePaymentAsync(
                    user.AsaasCustomerId,
                    order,
                    method,
                    creditCardToken
                );

                // Create local payment record
                var payment = new Payment
                {
                    OrderId = orderId,
                    Method = method,
                    Status = PaymentStatus.PENDING,
                    Value = order.TotalPrice,
                    ExternalId = asaasResponse.GetProperty("id").GetString(),
                    InvoiceUrl = asaasResponse.TryGetProperty("invoiceUrl", out var inv) ? inv.GetString() : null,
                    BankSlipUrl = asaasResponse.TryGetProperty("bankSlipUrl", out var slip) ? slip.GetString() : null,
                    DueDate = asaasResponse.TryGetProperty("dueDate", out var due) 
                        ? DateTime.Parse(due.GetString()!) 
                        : DateTime.UtcNow.AddDays(3),
                    GatewayResponse = asaasResponse.ToString(),
                    TenantId = order.TenantId
                };

                // For PIX, get QR code info
                if (method == PaymentMethod.PIX)
                {
                    var pixInfo = await _asaasService.GetPixQrCodeAsync(payment.ExternalId!);
                    payment.PixQrCode = pixInfo.TryGetProperty("encodedImage", out var qr) ? qr.GetString() : null;
                    payment.PixCopyPaste = pixInfo.TryGetProperty("payload", out var cp) ? cp.GetString() : null;
                }

                _context.Payments.Add(payment);
                
                // Update order status
                order.Status = OrderStatus.AWAITING_PAYMENT;
                order.UpdatedAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetPaymentByOrder), new { orderId }, payment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create payment in Asaas", error = ex.Message });
            }
        }
    }

    public class CreditCardRequest
    {
        public string? CreditCardToken { get; set; }
    }
}
