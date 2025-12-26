using AllureModa.API.Data;
using AllureModa.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api/addresses")]
    [Authorize]
    public class AddressController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AddressController(ApplicationDbContext context)
        {
            _context = context;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
            ?? throw new UnauthorizedAccessException("User not authenticated");

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Address>>> GetMyAddresses()
        {
            var userId = GetUserId();
            return await _context.Addresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.IsDefault)
                .ThenByDescending(a => a.Id)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Address>> GetAddress(string id)
        {
            var userId = GetUserId();
            var address = await _context.Addresses.FindAsync(id);
            
            if (address == null) return NotFound();
            
            // Security: User can only access their own addresses
            if (address.UserId != userId) return Forbid();
            
            return address;
        }

        [HttpPost]
        public async Task<ActionResult<Address>> CreateAddress([FromBody] AddressCreateDto dto)
        {
            var userId = GetUserId();

            var address = new Address
            {
                UserId = userId, // Enforce ownership - never trust frontend
                RecipientName = dto.RecipientName,
                Phone = dto.Phone,
                Street = dto.Street,
                Number = dto.Number,
                Neighborhood = dto.Neighborhood,
                City = dto.City,
                State = dto.State,
                PostalCode = dto.PostalCode,
                Country = dto.Country ?? "BR",
                AddressLine2 = dto.AddressLine2,
                Type = dto.Type,
                IsDefault = dto.IsDefault
            };

            // If this is marked as default, unset other defaults
            if (address.IsDefault)
            {
                await _context.Addresses
                    .Where(a => a.UserId == userId && a.IsDefault)
                    .ExecuteUpdateAsync(a => a.SetProperty(x => x.IsDefault, false));
            }

            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAddress), new { id = address.Id }, address);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAddress(string id, [FromBody] AddressCreateDto dto)
        {
            var userId = GetUserId();
            var address = await _context.Addresses.FindAsync(id);
            
            if (address == null) return NotFound();
            
            // Security: User can only update their own addresses
            if (address.UserId != userId) return Forbid();

            address.RecipientName = dto.RecipientName;
            address.Phone = dto.Phone;
            address.Street = dto.Street;
            address.Number = dto.Number;
            address.Neighborhood = dto.Neighborhood;
            address.City = dto.City;
            address.State = dto.State;
            address.PostalCode = dto.PostalCode;
            address.Country = dto.Country ?? "BR";
            address.AddressLine2 = dto.AddressLine2;
            address.Type = dto.Type;
            address.IsDefault = dto.IsDefault;

            // If this is marked as default, unset other defaults
            if (address.IsDefault)
            {
                await _context.Addresses
                    .Where(a => a.UserId == userId && a.Id != id && a.IsDefault)
                    .ExecuteUpdateAsync(a => a.SetProperty(x => x.IsDefault, false));
            }

            await _context.SaveChangesAsync();
            return Ok(address);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAddress(string id)
        {
            var userId = GetUserId();
            var address = await _context.Addresses.FindAsync(id);
            
            if (address == null) return NotFound();
            
            // Security: User can only delete their own addresses
            if (address.UserId != userId) return Forbid();

            // Check if address is being used in orders
            var inUse = await _context.Orders.AnyAsync(o => 
                o.ShippingAddressId == id || o.BillingAddressId == id);
            
            if (inUse)
            {
                return BadRequest(new { message = "Este endereço está vinculado a pedidos e não pode ser excluído." });
            }

            _context.Addresses.Remove(address);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class AddressCreateDto
    {
        public string? RecipientName { get; set; }
        public string? Phone { get; set; }
        public required string Street { get; set; }
        public required string Number { get; set; }
        public string? Neighborhood { get; set; }
        public required string City { get; set; }
        public required string State { get; set; }
        public required string PostalCode { get; set; }
        public string? Country { get; set; }
        public string? AddressLine2 { get; set; }
        public AddressType Type { get; set; } = AddressType.SHIPPING;
        public bool IsDefault { get; set; }
    }
}
