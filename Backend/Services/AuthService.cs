using AllureModa.API.Data;
using AllureModa.API.DTOs;
using AllureModa.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace AllureModa.API.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                 Console.WriteLine($"[Auth] User not found: {request.Email}");
                 throw new Exception("Credenciais inválidas");
            }

            Console.WriteLine($"[Auth] User Found. ID: {user.Id}, Hash: {user.PasswordHash}");
            
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
            Console.WriteLine($"[Auth] BCrypt Verify Result: {isPasswordValid}");

            if (!isPasswordValid)
            {
                 Console.WriteLine($"[Auth] Password mismatch for: {request.Email}");
                 throw new Exception("Credenciais inválidas");
            }

            var token = GenerateJwtToken(user);
            return new AuthResponse { Token = token, User = user };
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            {
                throw new Exception("Email already exists");
            }

            var user = new User
            {
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone,
                Role = Role.USER
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);
            return new AuthResponse { Token = token, User = user };
        }

        public async Task<User?> GetUserByIdAsync(string userId)
        {
            return await _context.Users.FindAsync(userId);
        }

        public async Task<string> RefreshTokenAsync(string token)
        {
            var principal = ValidateToken(token);
            if (principal == null)
                throw new Exception("Invalid token");

            var userId = principal.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
                throw new Exception("Invalid token");

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                throw new Exception("User not found");

            return GenerateJwtToken(user);
        }

        private ClaimsPrincipal? ValidateToken(string token)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"]!);

            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out _);

                return principal;
            }
            catch
            {
                return null;
            }
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["Secret"]!);

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("sub", user.Id), // Standard Subject claim
                    new Claim("email", user.Email),
                    new Claim("role", user.Role.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<User> GenerateResetTokenAsync(string email)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                // Don't reveal that the user does not exist
                return null;
            }

            user.PasswordResetToken = Guid.NewGuid().ToString("N");
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);

            await _context.SaveChangesAsync();
            return user;
        }

        public async Task ResetPasswordAsync(string email, string token, string newPassword)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) throw new Exception("Invalid request");

            if (user.PasswordResetToken != token || user.PasswordResetTokenExpiry < DateTime.UtcNow)
            {
                throw new Exception("Invalid or expired token");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;

            await _context.SaveChangesAsync();
        }
    }
}
