using AllureModa.API.DTOs;
using AllureModa.API.Services;
using AllureModa.API.Services.Email;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthController(AuthService authService, IConfiguration configuration, IEmailService emailService)
        {
            _authService = authService;
            _configuration = configuration;
            _emailService = emailService;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            try
            {
                Console.WriteLine($"[API] Login request for: {request.Email} with password length: {request.Password?.Length ?? 0}");
                var response = await _authService.LoginAsync(request);
                
                // Set JWT in HttpOnly cookie
                SetTokenCookie(response.Token);
                
                // Return user info without token in body (more secure)
                return Ok(new { user = response.User, message = "Login successful" });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var response = await _authService.RegisterAsync(request);
                
                // Set JWT in HttpOnly cookie
                SetTokenCookie(response.Token);
                
                // Send Welcome Email
                try
                {
                    await _emailService.SendWelcomeEmailAsync(response.User);
                }
                catch
                {
                    // Non-blocking
                }
                
                return CreatedAtAction(nameof(Login), new { id = response.User.Id }, 
                    new { user = response.User, message = "Registration successful" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Remove the auth cookie
            Response.Cookies.Delete("access_token", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Path = "/"
            });

            return Ok(new { message = "Logged out successfully" });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult> GetCurrentUser()
        {
            var userId = User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "Not authenticated" });

            var user = await _authService.GetUserByIdAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                firstName = user.FirstName,
                lastName = user.LastName,
                phone = user.Phone,
                cpf = user.Cpf,
                role = user.Role.ToString()
            });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken()
        {
            var token = Request.Cookies["access_token"];
            if (string.IsNullOrEmpty(token))
                return Unauthorized(new { message = "No token provided" });

            try
            {
                var newToken = await _authService.RefreshTokenAsync(token);
                SetTokenCookie(newToken);
                return Ok(new { message = "Token refreshed" });
            }
            catch
            {
                return Unauthorized(new { message = "Invalid token" });
            }
        }
        


        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var user = await _authService.GenerateResetTokenAsync(request.Email);
            if (user != null)
            {
                // Send email
                try
                {
                    await _emailService.SendPasswordResetAsync(user, user.PasswordResetToken!);
                }
                catch
                {
                    // Log error but don't fail for user
                }
            }

            // Always return Ok to prevent email enumeration
            return Ok(new { message = "If the email exists, a reset link has been sent." });
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                await _authService.ResetPasswordAsync(request.Email, request.Token, request.NewPassword);
                return Ok(new { message = "Password reset successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private void SetTokenCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,          // JavaScript cannot access
                Secure = true,            // Only sent over HTTPS
                SameSite = SameSiteMode.Strict,  // CSRF protection
                Expires = DateTime.UtcNow.AddDays(7),
                Path = "/",
                IsEssential = true
            };

            // In development, allow non-HTTPS
            if (_configuration["ASPNETCORE_ENVIRONMENT"] == "Development")
            {
                cookieOptions.Secure = false;
                cookieOptions.SameSite = SameSiteMode.Lax;
            }

            Response.Cookies.Append("access_token", token, cookieOptions);
        }
    }
}
