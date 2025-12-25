using System;
using System.ComponentModel.DataAnnotations;

namespace AllureModa.API.Models
{
    public class Review
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public int Rating { get; set; } // 1 a 5
        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public required string UserId { get; set; }
        public User? User { get; set; }

        [Required]
        public required string ProductId { get; set; }
        public Product? Product { get; set; }
    }
}
