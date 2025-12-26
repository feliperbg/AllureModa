using AllureModa.API.Models;
using AllureModa.API.DTOs;
using System.Text.Json;

namespace AllureModa.API.Services
{
    public interface IAsaasService
    {
        Task<string> CreateCustomerAsync(User user);
        Task<JsonElement> CreatePaymentAsync(
            string customerId, 
            Order order, 
            PaymentMethod method, 
            string? creditCardToken,
            CreditCardDto? creditCard = null,
            User? holderInfo = null,
            Address? billingAddress = null);
        Task<JsonElement> GetPixQrCodeAsync(string paymentId);
        Task<JsonElement> GetPaymentStatusAsync(string paymentId);
    }
}
