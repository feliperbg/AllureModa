using AllureModa.API.Controllers;
using AllureModa.API.Data;
using AllureModa.API.DTOs;
using AllureModa.API.Models;
using AllureModa.API.Services.Email;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using System.Threading.Tasks;
using Xunit;

namespace AllureModa.Tests.Controllers
{
    public class NewsletterControllerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<IEmailService> _mockEmailService;
        private readonly Mock<ILogger<NewsletterController>> _mockLogger;
        private readonly NewsletterController _controller;

        public NewsletterControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
            _context = new ApplicationDbContext(options);

            _mockEmailService = new Mock<IEmailService>();
            _mockLogger = new Mock<ILogger<NewsletterController>>();

            _controller = new NewsletterController(_context, _mockEmailService.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task Subscribe_ShouldAddSubscriber_WhenNew()
        {
            // Arrange
            var request = new NewsletterSubscribeRequest { Email = "new@example.com" };

            // Act
            var result = await _controller.Subscribe(request);

            // Assert
            Assert.IsType<OkObjectResult>(result);
            var sub = await _context.NewsletterSubscribers.FirstOrDefaultAsync(s => s.Email == "new@example.com");
            Assert.NotNull(sub);
            Assert.True(sub.IsActive);
        }

        [Fact]
        public async Task Subscribe_ShouldReactivate_WhenInactive()
        {
            // Arrange
            var existing = new NewsletterSubscriber { Email = "old@example.com", IsActive = false };
            _context.NewsletterSubscribers.Add(existing);
            await _context.SaveChangesAsync();
            
            var request = new NewsletterSubscribeRequest { Email = "old@example.com" };

            // Act
            await _controller.Subscribe(request);

            // Assert
            var sub = await _context.NewsletterSubscribers.FirstAsync(s => s.Email == "old@example.com");
            Assert.True(sub.IsActive);
        }

        [Fact]
        public async Task SendNewsletter_ShouldSendEmail_ToActiveSubscribers()
        {
            // Arrange
            _context.NewsletterSubscribers.AddRange(
                new NewsletterSubscriber { Email = "a@test.com", IsActive = true },
                new NewsletterSubscriber { Email = "b@test.com", IsActive = true },
                new NewsletterSubscriber { Email = "c@test.com", IsActive = false }
            );
            await _context.SaveChangesAsync();

            var request = new SendNewsletterRequest { Subject = "News", Content = "Hello" };

            // Act
            await _controller.SendNewsletter(request);

            // Assert
            _mockEmailService.Verify(x => x.SendEmailAsync("a@test.com", "News", It.IsAny<string>()), Times.Once);
            _mockEmailService.Verify(x => x.SendEmailAsync("b@test.com", "News", It.IsAny<string>()), Times.Once);
            _mockEmailService.Verify(x => x.SendEmailAsync("c@test.com", It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }
    }
}
