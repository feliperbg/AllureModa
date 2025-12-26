using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace AllureModa.API.Services
{
    public interface IShippingService
    {
        Task<ShippingQuoteResponse> CalculateShipping(ShippingQuoteRequest request);
    }

    public class ShippingQuoteRequest
    {
        public required string CepDestino { get; set; }
        public decimal Weight { get; set; } = 0.3m; // Default 300g
        public decimal Height { get; set; } = 5;  // cm
        public decimal Width { get; set; } = 20;  // cm
        public decimal Length { get; set; } = 30; // cm
        public decimal Value { get; set; } = 100; // Product value
    }

    public class ShippingQuoteResponse
    {
        public List<ShippingOption> Options { get; set; } = new();
    }

    public class ShippingOption
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public string Company { get; set; } = "";
        public decimal Price { get; set; }
        public int DeliveryDays { get; set; }
        public string? Error { get; set; }
    }

    public class MelhorEnvioService : IShippingService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<MelhorEnvioService> _logger;

        private const string SANDBOX_URL = "https://sandbox.melhorenvio.com.br/api/v2";
        private const string PRODUCTION_URL = "https://melhorenvio.com.br/api/v2";

        public MelhorEnvioService(HttpClient httpClient, IConfiguration configuration, ILogger<MelhorEnvioService> logger)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<ShippingQuoteResponse> CalculateShipping(ShippingQuoteRequest request)
        {
            var response = new ShippingQuoteResponse();

            try
            {
                var token = _configuration["MelhorEnvio:Token"];
                var cepOrigem = _configuration["MelhorEnvio:CepOrigem"] ?? "01310100"; // Default: São Paulo

                if (string.IsNullOrEmpty(token))
                {
                    // Return mock data when no token is configured
                    return GetMockShippingOptions(request);
                }

                var baseUrl = _configuration["MelhorEnvio:UseSandbox"] == "true" ? SANDBOX_URL : PRODUCTION_URL;

                var payload = new
                {
                    from = new { postal_code = cepOrigem },
                    to = new { postal_code = request.CepDestino },
                    products = new[]
                    {
                        new
                        {
                            weight = request.Weight,
                            width = (int)request.Width,
                            height = (int)request.Height,
                            length = (int)request.Length,
                            insurance_value = request.Value
                        }
                    }
                };

                var jsonPayload = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "AllureModa (contato@allure.com.br)");

                var httpResponse = await _httpClient.PostAsync($"{baseUrl}/me/shipment/calculate", content);
                var responseContent = await httpResponse.Content.ReadAsStringAsync();

                if (httpResponse.IsSuccessStatusCode)
                {
                    var options = JsonSerializer.Deserialize<List<MelhorEnvioQuote>>(responseContent);
                    if (options != null)
                    {
                        foreach (var opt in options.Where(o => o.error == null && o.price != null))
                        {
                            response.Options.Add(new ShippingOption
                            {
                                Id = opt.id?.ToString() ?? "",
                                Name = opt.name ?? "",
                                Company = opt.company?.name ?? "",
                                Price = decimal.Parse(opt.price ?? "0"),
                                DeliveryDays = opt.delivery_time ?? 0
                            });
                        }
                    }
                }
                else
                {
                    _logger.LogWarning("MelhorEnvio API error: {StatusCode} - {Response}", httpResponse.StatusCode, responseContent);
                    return GetMockShippingOptions(request);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating shipping");
                return GetMockShippingOptions(request);
            }

            return response;
        }

        private ShippingQuoteResponse GetMockShippingOptions(ShippingQuoteRequest request)
        {
            // Mock shipping options for development/demo
            return new ShippingQuoteResponse
            {
                Options = new List<ShippingOption>
                {
                    new ShippingOption
                    {
                        Id = "sedex",
                        Name = "SEDEX",
                        Company = "Correios",
                        Price = 25.90m,
                        DeliveryDays = 3
                    },
                    new ShippingOption
                    {
                        Id = "pac",
                        Name = "PAC",
                        Company = "Correios",
                        Price = 18.50m,
                        DeliveryDays = 8
                    },
                    new ShippingOption
                    {
                        Id = "jadlog",
                        Name = ".Package",
                        Company = "Jadlog",
                        Price = 21.00m,
                        DeliveryDays = 5
                    }
                }
            };
        }
    }

    // MelhorEnvio API response models
    public class MelhorEnvioQuote
    {
        public int? id { get; set; }
        public string? name { get; set; }
        public string? price { get; set; }
        public int? delivery_time { get; set; }
        public MelhorEnvioCompany? company { get; set; }
        public string? error { get; set; }
    }

    public class MelhorEnvioCompany
    {
        public int? id { get; set; }
        public string? name { get; set; }
        public string? picture { get; set; }
    }
}
