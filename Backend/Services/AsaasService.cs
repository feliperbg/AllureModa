using AllureModa.API.Models;
using System.Text;
using System.Text.Json;

namespace AllureModa.API.Services
{
    public class AsaasService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public AsaasService(IConfiguration configuration)
        {
            _apiKey = configuration["Asaas:ApiKey"] ?? throw new Exception("Asaas API Key not configured");
            _httpClient = new HttpClient
            {
                BaseAddress = new Uri(configuration["Asaas:BaseUrl"] ?? "https://sandbox.asaas.com/api/v3/")
            };
            _httpClient.DefaultRequestHeaders.Add("access_token", _apiKey);
        }

        public async Task<string> CreateCustomerAsync(User user)
        {
            var payload = new
            {
                name = $"{user.FirstName} {user.LastName}",
                email = user.Email,
                cpfCnpj = user.Cpf,
                phone = user.Phone,
                externalReference = user.Id
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("customers", content);
            
            response.EnsureSuccessStatusCode();
            
            var responseBody = await response.Content.ReadAsStringAsync();
            var json = JsonDocument.Parse(responseBody);
            return json.RootElement.GetProperty("id").GetString()!;
        }

        public async Task<JsonElement> CreatePaymentAsync(string customerId, Order order, PaymentMethod method, string? creditCardToken)
        {
            var billingType = method switch
            {
                PaymentMethod.PIX => "PIX",
                PaymentMethod.BOLETO => "BOLETO",
                PaymentMethod.CREDIT_CARD => "CREDIT_CARD",
                _ => throw new NotImplementedException()
            };

            var payload = new
            {
                customer = customerId,
                billingType,
                value = order.TotalPrice,
                dueDate = DateTime.UtcNow.AddDays(3).ToString("yyyy-MM-dd"),
                externalReference = order.Id,
                description = $"Pedido #{order.Id} - AllureModa",
                creditCardToken = creditCardToken // Only for credit card
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync("payments", content);

            response.EnsureSuccessStatusCode();
            var responseBody = await response.Content.ReadAsStringAsync();
            return JsonDocument.Parse(responseBody).RootElement;
        }

        public async Task<JsonElement> GetPixQrCodeAsync(string paymentId)
        {
            var response = await _httpClient.GetAsync($"payments/{paymentId}/pixQrCode");
            response.EnsureSuccessStatusCode();
            var responseBody = await response.Content.ReadAsStringAsync();
            return JsonDocument.Parse(responseBody).RootElement;
        }

        public async Task<JsonElement> GetPaymentStatusAsync(string paymentId)
        {
            var response = await _httpClient.GetAsync($"payments/{paymentId}");
            response.EnsureSuccessStatusCode();
            var responseBody = await response.Content.ReadAsStringAsync();
            return JsonDocument.Parse(responseBody).RootElement;
        }
    }
}
