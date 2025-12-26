using AllureModa.API.Controllers;
using AllureModa.API.Models;
using AllureModa.API.DTOs;

namespace AllureModa.API.Services
{
    public interface ICheckoutService
    {
        Task<CheckoutResponseDto> ProcessCheckoutAsync(string userId, CheckoutRequestDto request);
    }
}
