using AllureModa.API.Models;
using AllureModa.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api/cart")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        private string GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? throw new UnauthorizedAccessException("User not authenticated");
        }

        [HttpGet]
        public async Task<ActionResult<Cart>> GetCart()
        {
            var cart = await _cartService.GetCartAsync(GetUserId());
            return Ok(cart);
        }

        [HttpPost("items")]
        public async Task<ActionResult<Cart>> AddItem(CartItem item)
        {
            var cart = await _cartService.AddItemAsync(GetUserId(), item);
            return Ok(cart);
        }

        [HttpDelete("items/{variantId}")]
        public async Task<ActionResult<Cart>> RemoveItem(string variantId)
        {
            var cart = await _cartService.RemoveItemAsync(GetUserId(), variantId);
            return Ok(cart);
        }
    }
}
