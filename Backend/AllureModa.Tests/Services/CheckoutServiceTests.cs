using AllureModa.API.Controllers;
using AllureModa.API.Data;
using AllureModa.API.Models;
using AllureModa.API.Services;
using AllureModa.API.Services.Email;
using AllureModa.API.DTOs;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace AllureModa.Tests.Services
{
    public class CheckoutServiceTests
    {
        private readonly Mock<ICartService> _mockCartService;
        private readonly Mock<IProductService> _mockProductService;
        private readonly Mock<IAsaasService> _mockAsaasService;
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly ApplicationDbContext _context;
        private readonly CheckoutService _checkoutService;

        public CheckoutServiceTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);

            _mockCartService = new Mock<ICartService>();
            _mockProductService = new Mock<IProductService>();
            _mockAsaasService = new Mock<IAsaasService>();
            _mockEmailService = new Mock<IEmailService>();
            
            _checkoutService = new CheckoutService(
                _context, 
                _mockCartService.Object, 
                _mockProductService.Object, 
                _mockAsaasService.Object, 
                _mockEmailService.Object);
        }

        [Fact]
        public async Task ProcessCheckout_ShouldThrow_WhenCartIsEmpty()
        {
            // Arrange
            var userId = "user1";
            _mockCartService.Setup(x => x.GetCartAsync(userId))
                .ReturnsAsync(new Cart { UserId = userId, Items = new List<CartItem>() });

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => 
                _checkoutService.ProcessCheckoutAsync(userId, new CheckoutRequestDto { ShippingAddressId = "addr1", PaymentMethod = PaymentMethod.CREDIT_CARD , ShippingCost=0}));
        }

        [Fact]
        public async Task ProcessCheckout_ShouldThrow_WhenStockIsInsufficient()
        {
            // Arrange
            var userId = "user1";
            var variantId = "var1";
            
            // Setup DB with low stock
            var product = new Product { Id="p1", Name="Prod1", Description="Desc", Slug="prod-1", CategoryId="c1", BrandId="b1" };
            var variant = new ProductVariant { Id = variantId, ProductId = "p1", Stock = 1, Sku = "sku-1" };
            _context.Products.Add(product);
            _context.ProductVariants.Add(variant);
            await _context.SaveChangesAsync();

            // Setup Cart requesting 5 items
            var cartId = "cart1";
            var cart = new Cart { 
                Id = cartId,
                UserId = userId, 
                Items = new List<CartItem> { new CartItem { CartId = cartId, ProductVariantId = variantId, Quantity = 5 } } 
            };
            _mockCartService.Setup(x => x.GetCartAsync(userId)).ReturnsAsync(cart);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => 
                _checkoutService.ProcessCheckoutAsync(userId, new CheckoutRequestDto { ShippingAddressId = "addr1", PaymentMethod = PaymentMethod.CREDIT_CARD, ShippingCost=0 }));
            
            Assert.Contains("Insufficient stock", ex.Message);
        }
    }
}
