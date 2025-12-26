using AllureModa.API.Controllers;
using AllureModa.API.Data;
using AllureModa.API.Models;
using Microsoft.EntityFrameworkCore;
using AllureModa.API.DTOs;
using AllureModa.API.Services.Email;

namespace AllureModa.API.Services
{
    public class CheckoutService : ICheckoutService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAsaasService _asaasService;
        private readonly ICartService _cartService;
        private readonly IProductService _productService;
        private readonly IEmailService _emailService;

        public CheckoutService(
            ApplicationDbContext context, 
            ICartService cartService, 
            IProductService productService,
            IAsaasService asaasService,
            IEmailService emailService)
        {
            _context = context;
            _cartService = cartService;
            _productService = productService;
            _asaasService = asaasService;
            _emailService = emailService;
        }

        public async Task<CheckoutResponseDto> ProcessCheckoutAsync(string userId, CheckoutRequestDto request)
        {
            var cart = await _cartService.GetCartAsync(userId);

            if (!cart.Items.Any())
            {
                throw new InvalidOperationException("Cart is empty");
            }

            // 1. Stock Validation
            foreach (var item in cart.Items)
            {
                var variant = await _context.ProductVariants.FindAsync(item.ProductVariantId);
                if (variant == null || variant.Stock < item.Quantity)
                {
                    throw new InvalidOperationException($"Insufficient stock for variant {item.ProductVariantId}");
                }
            }

            // 2. Create Order
            var orderId = Guid.NewGuid().ToString();
            var order = new Order
            {
                Id = orderId,
                UserId = userId,
                OrderNumber = new Random().Next(100000, 999999).ToString(),
                Status = OrderStatus.PENDING,
                TotalPrice = cart.Items.Sum(i => (i.ProductVariant?.Price ?? 0) * i.Quantity) + request.ShippingCost, // Simplified calculation
                ShippingAddressId = request.ShippingAddressId,
                BillingAddressId = request.BillingAddressId ?? request.ShippingAddressId,
                // PaymentMethod is stored in Payment entity
                ShippingFee = request.ShippingCost,
                Items = cart.Items.Select(i => new OrderItem
                {
                    OrderId = orderId,
                    ProductVariantId = i.ProductVariantId,
                    Quantity = i.Quantity,
                    PriceAtPurchase = i.ProductVariant?.Price ?? 0
                }).ToList()
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // 3. Decrement Stock
            foreach (var item in cart.Items)
            {
                var variant = await _context.ProductVariants.FindAsync(item.ProductVariantId);
                if (variant != null)
                {
                    variant.Stock -= item.Quantity;
                }
            }

            // 4. Process Payment (Asaas)
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null) throw new InvalidOperationException("User not found");

                // Ensure Asaas Customer Exists
                if (string.IsNullOrEmpty(user.AsaasCustomerId))
                {
                    try 
                    {
                        user.AsaasCustomerId = await _asaasService.CreateCustomerAsync(user);
                        await _context.SaveChangesAsync();
                    }
                    catch (Exception ex)
                    {
                        // Log and rethrow or handle graceful degradation
                         throw new InvalidOperationException("Failed to create payment profile", ex);
                    }
                }

                var billingAddress = await _context.Addresses.FindAsync(order.BillingAddressId);

                // Use injected AsaasService
                var paymentJson = await _asaasService.CreatePaymentAsync(
                    user.AsaasCustomerId, 
                    order, 
                    request.PaymentMethod, 
                    request.CreditCardToken, 
                    request.CreditCard, 
                    user, 
                    billingAddress);

                // SAFELY extract properties from JsonElement
                var paymentId = paymentJson.GetProperty("id").GetString();
                var bankSlipUrl = paymentJson.TryGetProperty("bankSlipUrl", out var urlProp) ? urlProp.GetString() : null;
                var pixQrCode = paymentJson.TryGetProperty("pixQrCode", out var qrProp) ? qrProp.GetString() : null;
                var pixCopyPaste = paymentJson.TryGetProperty("pixCopyPasteAddress", out var copyProp) ? copyProp.GetString() : null;
                var status = paymentJson.GetProperty("status").GetString();

                // Create Payment record associated with Order
                var payment = new Payment
                {
                    OrderId = order.Id,
                    ExternalId = paymentId,
                    Method = request.PaymentMethod,
                    Status = PaymentStatus.PENDING,
                    Value = order.TotalPrice,
                    BankSlipUrl = bankSlipUrl,
                    PixQrCode = pixQrCode,
                    PixCopyPaste = pixCopyPaste
                };
                
                _context.Payments.Add(payment);

                if (request.PaymentMethod == Models.PaymentMethod.CREDIT_CARD)
                {
                     // In real Asaas, status can be CONFIRMED or PENDING immediately
                     if (status == "CONFIRMED" || status == "RECEIVED")
                     {
                         order.Status = OrderStatus.PAID;
                         payment.Status = PaymentStatus.CONFIRMED;
                     }
                }

                await _context.SaveChangesAsync();
                
                await _context.SaveChangesAsync();
                
                // 5. Send Email (Fire and Forget or awaited)
                try 
                {
                    await _emailService.SendOrderCreatedAsync(order, user);
                }
                catch 
                { 
                    // Do not fail checkout if email fails
                }

                // 6. Clear Cart using Service
                await _cartService.ClearCartAsync(userId);
                
                return new CheckoutResponseDto
                {
                    OrderId = order.Id,
                    OrderNumber = order.OrderNumber,
                    PaymentId = payment.ExternalId,
                    PaymentMethod = payment.Method.ToString(),
                    PixQrCode = payment.PixQrCode,
                    PixCopyPaste = payment.PixCopyPaste,
                    BoletoUrl = payment.BankSlipUrl,
                    Subtotal = order.TotalPrice - order.ShippingFee,
                    ShippingCost = order.ShippingFee,
                    TotalPrice = order.TotalPrice
                };
            }
            catch
            {
                // Rollback Stock (Basic compensation, better with transaction)
                 foreach (var item in cart.Items)
                {
                    var variant = await _context.ProductVariants.FindAsync(item.ProductVariantId);
                    if (variant != null) variant.Stock += item.Quantity;
                }
                _context.Orders.Remove(order);
                await _context.SaveChangesAsync();
                throw;
            }
        }
    }
}
