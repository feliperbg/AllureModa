using AllureModa.API.Data;
using AllureModa.API.Models;
using AllureModa.API.Services;
using AllureModa.API.Services.Email;
using AllureModa.API.DTOs;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api/checkout")]
    [Authorize]
    public class CheckoutController : ControllerBase
    {
        private readonly ICheckoutService _checkoutService;
        private readonly IEmailService _emailService;
        private readonly ApplicationDbContext _context; // Kept for Summary endpoint (security validation)
        private readonly ILogger<CheckoutController> _logger;

        public CheckoutController(
            ICheckoutService checkoutService,
            IEmailService emailService,
            ApplicationDbContext context,
            ILogger<CheckoutController> logger)
        {
            _checkoutService = checkoutService;
            _emailService = emailService;
            _context = context;
            _logger = logger;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? throw new UnauthorizedAccessException("User not authenticated");

        /// <summary>
        /// Get checkout summary - validates cart and calculates totals server-side
        /// </summary>
        [HttpGet("summary")]
        public async Task<ActionResult> GetCheckoutSummary()
        {
            var userId = GetUserId();

            var cart = await _context.Carts
                .Include(c => c.Items)
                    .ThenInclude(i => i.ProductVariant)
                        .ThenInclude(pv => pv!.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null || !cart.Items.Any())
            {
                return BadRequest(new { message = "Carrinho vazio" });
            }

            // SECURITY: Calculate all prices server-side from database
            var items = cart.Items.Select(item => new
            {
                item.Id,
                ProductVariantId = item.ProductVariantId,
                ProductName = item.ProductVariant?.Product?.Name,
                Sku = item.ProductVariant?.Sku,
                item.Quantity,
                // Use promotional price if available, otherwise regular price
                UnitPrice = item.ProductVariant?.PromotionalPrice ?? item.ProductVariant?.Price ?? 0,
                Stock = item.ProductVariant?.Stock ?? 0
            }).ToList();

            // Validate stock
            var outOfStock = items.Where(i => i.Quantity > i.Stock).ToList();
            if (outOfStock.Any())
            {
                return BadRequest(new { 
                    message = "Alguns itens estão sem estoque suficiente",
                    outOfStock = outOfStock.Select(i => new { i.ProductName, i.Quantity, i.Stock })
                });
            }

            var subtotal = items.Sum(i => i.UnitPrice * i.Quantity);

            return Ok(new
            {
                Items = items.Select(i => new
                {
                    i.Id,
                    i.ProductVariantId,
                    i.ProductName,
                    i.Sku,
                    i.Quantity,
                    i.UnitPrice,
                    TotalPrice = i.UnitPrice * i.Quantity
                }),
                Subtotal = subtotal,
                ItemCount = items.Sum(i => i.Quantity)
            });
        }

        /// <summary>
        /// Process checkout - creates order and initiates payment
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<CheckoutResponseDto>> ProcessCheckout(CheckoutRequestDto request)
        {
            var userId = GetUserId();

            try
            {
                var response = await _checkoutService.ProcessCheckoutAsync(userId, request);

                // Send Email Notification
                var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
                if (!string.IsNullOrEmpty(userEmail))
                {
                    try 
                    {
                        var paymentMethodText = response.PaymentMethod;
                        var shippingText = response.ShippingCost > 0 ? $"Frete: R$ {response.ShippingCost:F2}" : "Frete Grátis";
                        
                        await _emailService.SendEmailAsync(
                            userEmail, 
                            $"Pedido Confirmado #{response.OrderNumber}", 
                            $@"
                                <h1>Obrigado pela sua compra!</h1>
                                <p>Seu pedido <strong>#{response.OrderNumber}</strong> foi recebido com sucesso.</p>
                                <p>Valor Total: R$ {response.TotalPrice:F2}</p>
                                <p>{shippingText}</p>
                                <p>Forma de Pagamento: {paymentMethodText}</p>
                            ");
                    }
                    catch (Exception ex)
                    {
                         _logger.LogError(ex, "Failed to send email for order {OrderNumber}", response.OrderNumber);
                    }
                }

                return Ok(response);
            }
            catch (InvalidOperationException ex)
            {
                 return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing checkout for user {UserId}", userId);
                return StatusCode(500, new { message = "An error occurred processing your order.", details = ex.Message });
            }
        }
    }

}
