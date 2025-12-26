using AllureModa.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api/shipping")]
    public class ShippingController : ControllerBase
    {
        private readonly IShippingService _shippingService;

        public ShippingController(IShippingService shippingService)
        {
            _shippingService = shippingService;
        }

        [HttpPost("calculate")]
        public async Task<ActionResult<ShippingQuoteResponse>> CalculateShipping([FromBody] ShippingCalculateRequest request)
        {
            if (string.IsNullOrEmpty(request.CepDestino) || request.CepDestino.Length < 8)
            {
                return BadRequest(new { message = "CEP inválido" });
            }

            // Remove non-numeric characters from CEP
            var cep = new string(request.CepDestino.Where(char.IsDigit).ToArray());
            if (cep.Length != 8)
            {
                return BadRequest(new { message = "CEP deve ter 8 dígitos" });
            }

            var shippingRequest = new ShippingQuoteRequest
            {
                CepDestino = cep,
                Weight = request.Weight ?? 0.3m,
                Height = request.Height ?? 5,
                Width = request.Width ?? 20,
                Length = request.Length ?? 30,
                Value = request.ProductValue ?? 100
            };

            var result = await _shippingService.CalculateShipping(shippingRequest);
            return Ok(result);
        }
    }

    public class ShippingCalculateRequest
    {
        public required string CepDestino { get; set; }
        public decimal? Weight { get; set; }
        public decimal? Height { get; set; }
        public decimal? Width { get; set; }
        public decimal? Length { get; set; }
        public decimal? ProductValue { get; set; }
    }
}
