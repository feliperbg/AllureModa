using AllureModa.API.Data;
using AllureModa.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api/coupons")]
    public class CouponController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CouponController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<IEnumerable<Coupon>>> GetCoupons()
        {
            return await _context.Coupons.OrderByDescending(c => c.CreatedAt).ToListAsync();
        }

        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<Coupon>> CreateCoupon(Coupon coupon)
        {
            if (await _context.Coupons.AnyAsync(c => c.Code == coupon.Code))
            {
                return BadRequest(new { message = "Já existe um cupom com este código." });
            }

            _context.Coupons.Add(coupon);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCoupons), new { id = coupon.Id }, coupon);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateCoupon(string id, Coupon coupon)
        {
            if (id != coupon.Id) return BadRequest();

            var existing = await _context.Coupons.FindAsync(id);
            if (existing == null) return NotFound();

            // Update allowed fields
            existing.Code = coupon.Code;
            existing.Type = coupon.Type;
            existing.Value = coupon.Value;
            existing.MinPurchase = coupon.MinPurchase;
            existing.ExpirationDate = coupon.ExpirationDate;
            existing.UsageLimit = coupon.UsageLimit;
            existing.IsActive = coupon.IsActive;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CouponExists(id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteCoupon(string id)
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null) return NotFound();

            _context.Coupons.Remove(coupon);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("validate/{code}")]
        public async Task<ActionResult<object>> ValidateCoupon(string code)
        {
            var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code == code);

            if (coupon == null)
                return NotFound(new { message = "Cupom inválido." });

            if (!coupon.IsActive)
                return BadRequest(new { message = "Este cupom está inativo." });

            if (coupon.ExpirationDate.HasValue && coupon.ExpirationDate.Value < DateTime.UtcNow)
                return BadRequest(new { message = "Este cupom expirou." });

            if (coupon.UsageLimit.HasValue && coupon.UsageCount >= coupon.UsageLimit.Value)
                return BadRequest(new { message = "Este cupom atingiu o limite de uso." });

            return new
            {
                coupon.Id,
                coupon.Code,
                coupon.Type,
                coupon.Value,
                coupon.MinPurchase
            };
        }

        private bool CouponExists(string id)
        {
            return _context.Coupons.Any(e => e.Id == id);
        }
    }
}
