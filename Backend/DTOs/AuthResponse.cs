using AllureModa.API.Models;

namespace AllureModa.API.DTOs
{
    public class AuthResponse
    {
        public required string Token { get; set; }
        public required User User { get; set; }
    }
}
