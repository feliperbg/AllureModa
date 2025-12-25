using AllureModa.API.Data;
using AllureModa.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        private string GetUserId() => User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;

        [HttpGet("profile")]
        public async Task<ActionResult<User>> GetProfile()
        {
            var userId = GetUserId();
            var user = await _context.Users.FindAsync(userId);

            if (user == null) return NotFound();
            return user;
        }

        [HttpPut("profile")]
        public async Task<ActionResult<User>> UpdateProfile(User userUpdate)
        {
            var userId = GetUserId();
            var user = await _context.Users.FindAsync(userId);

            if (user == null) return NotFound();

            // Update allowed fields
            if (!string.IsNullOrEmpty(userUpdate.FirstName)) user.FirstName = userUpdate.FirstName;
            if (!string.IsNullOrEmpty(userUpdate.LastName)) user.LastName = userUpdate.LastName;
            if (!string.IsNullOrEmpty(userUpdate.Phone)) user.Phone = userUpdate.Phone;
            if (!string.IsNullOrEmpty(userUpdate.Cpf)) user.Cpf = userUpdate.Cpf;
            if (userUpdate.BirthDate.HasValue) user.BirthDate = userUpdate.BirthDate;

            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return user;
        }

        [HttpDelete("profile")]
        public async Task<IActionResult> DeleteAccount()
        {
            var userId = GetUserId();
            var user = await _context.Users.FindAsync(userId);

            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
