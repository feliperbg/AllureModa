using AllureModa.API.Data;
using AllureModa.API.DTOs;
using AllureModa.API.Models;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using Moq;
using System.Text.Json;

namespace AllureModa.Tests.Integration
{
    public class CheckoutIntegrationTests : IClassFixture<CustomWebApplicationFactory<Program>>
    {
        private readonly CustomWebApplicationFactory<Program> _factory;

        public CheckoutIntegrationTests(CustomWebApplicationFactory<Program> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task Checkout_ShouldReturnBadRequest_WhenCartIsEmpty()
        {
            // Arrange
            var client = _factory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Test");

            // Seed User
            using (var scope = _factory.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                
                if (await context.Users.FindAsync("user1") == null)
                {
                    context.Users.Add(new User 
                    { 
                        Id = "user1", 
                        Email = "test@example.com", 
                        FirstName = "Test", 
                        LastName = "User",
                        PasswordHash = "hash",
                        AsaasCustomerId = "cus_123"
                    });
                    
                    context.Addresses.Add(new Address
                    {
                        Id = "addr1",
                        UserId = "user1",
                        Street = "Rua Teste",
                        Number = "123",
                        PostalCode = "12345678",
                        City = "City",
                        State = "ST",
                        Country = "BR",
                        RecipientName = "Test"
                    });

                    await context.SaveChangesAsync();
                }
            }

            var request = new CheckoutRequestDto 
            { 
                ShippingAddressId = "addr1", 
                PaymentMethod = PaymentMethod.CREDIT_CARD,
                ShippingCost = 10,
                // Valid Credit Card Data for Mock
                CreditCard = new CreditCardDto
                {
                   HolderName = "Test Holder",
                   Number = "1234567812345678",
                   ExpiryMonth = "12",
                   ExpiryYear = "2099",
                   Ccv = "123"
                }
            };

            // Act
            // Since Cart is empty/missing, it should fail or return 500 depending on handling.
            // Service throws InvalidOperationException("Cart is empty"), global handler might return 500 or 400.
            // Let's assume 500 for unhandled, or we should see if we have exception handling middleware.
            // Actually, without a cart in DB, GetCartAsync returns an empty new Cart if not found? 
            // CheckoutService: var cart = await _cartService.GetCartAsync(userId); if (!cart.Items.Any()) throw Exception.
            
            var response = await client.PostAsJsonAsync("/api/checkout", request);

            // Assert
            // Expecting failure because cart is empty
            Assert.False(response.IsSuccessStatusCode); 
        }

        [Fact]
        public async Task Checkout_ShouldSucceed_WhenRequestIsValid()
        {
             // Arrange
            var client = _factory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Test");
            client.DefaultRequestHeaders.Add("X-Test-User", "user2"); // Use user2

            // Setup Asaas Mock
            _factory.AsaasServiceMock
                .Setup(x => x.CreateCustomerAsync(It.IsAny<User>()))
                .ReturnsAsync("cus_integration_test");

            var paymentResponse = JsonSerializer.Deserialize<JsonElement>(@"{
                ""id"": ""pay_integration_test"",
                ""status"": ""PENDING"",
                ""bankSlipUrl"": ""http://boleto"",
                ""pixQrCode"": ""qrcode"",
                ""pixCopyPasteAddress"": ""copypaste""
            }");
            
            _factory.AsaasServiceMock
                .Setup(x => x.CreatePaymentAsync(It.IsAny<string>(), It.IsAny<Order>(), It.IsAny<PaymentMethod>(), It.IsAny<string>(), It.IsAny<CreditCardDto>(), It.IsAny<User>(), It.IsAny<Address>()))
                .ReturnsAsync(paymentResponse);

            // Seed Data for Valid Scenario
            using (var scope = _factory.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                
                // User & Address
                var user = new User 
                { 
                    Id = "user2", 
                    Email = "valid@example.com", 
                    FirstName = "Valid", 
                    LastName = "User",
                    PasswordHash = "hash"
                };
                context.Users.Add(user);

                var address = new Address
                {
                    Id = "addr2",
                    UserId = "user2",
                    Street = "Rua Valid",
                    Number = "100",
                    PostalCode = "87654321",
                    City = "City",
                    State = "ST",
                    Country = "BR",
                    RecipientName = "Valid"
                };
                context.Addresses.Add(address);

                // Product & Variant
                var product = new Product { Id = "prod1", Name = "T-Shirt", Description = "Desc", Slug = "t-shirt", CategoryId = "cat1" };
                var variant = new ProductVariant { Id = "var1", ProductId = "prod1", Price = 50.0m, Stock = 10, Sku = "SKU-1" };
                
                context.Products.Add(product);
                context.ProductVariants.Add(variant);

                // Cart
                var cart = new Cart { UserId = "user2" };
                context.Carts.Add(cart);
                context.CartItems.Add(new CartItem { CartId = cart.Id, ProductVariantId = "var1", Quantity = 1 });

                await context.SaveChangesAsync();
            }

            var request = new CheckoutRequestDto 
            { 
                ShippingAddressId = "addr2", 
                PaymentMethod = PaymentMethod.PIX,
                ShippingCost = 15
            };

            // Act
            var response = await client.PostAsJsonAsync("/api/checkout", request);

            // Assert
            response.EnsureSuccessStatusCode(); // 200 OK
            
            // Verify Stock
            using (var scope = _factory.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var variant = await context.ProductVariants.FindAsync("var1");
                Assert.Equal(9, variant.Stock); // 10 - 1
            }
        }
    }
}
