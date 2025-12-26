using AllureModa.API.Services;
using AllureModa.API.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;
using System.Linq;

namespace AllureModa.Tests
{
    public class CustomWebApplicationFactory<TProgram> : WebApplicationFactory<TProgram> where TProgram : class
    {
        public Mock<IAsaasService> AsaasServiceMock { get; } = new Mock<IAsaasService>();

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureServices(services =>
            {
                // Remove existing DbContext options
                var options = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<ApplicationDbContext>));
                if (options != null) services.Remove(options);

                // Also remove the Context itself if registered directly (common in some setups)
                var context = services.SingleOrDefault(d => d.ServiceType == typeof(ApplicationDbContext));
                if (context != null) services.Remove(context);

                // Ensure no Npgsql connection is floating
                var dbConnection = services.SingleOrDefault(d => d.ServiceType == typeof(System.Data.Common.DbConnection));
                if (dbConnection != null) services.Remove(dbConnection);

                services.AddSingleton(AsaasServiceMock.Object);

                // Mock Authentication
                services.AddAuthentication("Test")
                    .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, TestAuthHandler>("Test", null);
                
                // Authorize all requests with "Test" scheme if needed, or rely on client setting the header.
                // But since we have multiple auth schemes in Program.cs, we might need to enforce this one.
                // The easiest way for specific tests is to use client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Test");
            });
        }
    }
}
