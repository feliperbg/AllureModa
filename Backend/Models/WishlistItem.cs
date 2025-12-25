using System;
using System.ComponentModel.DataAnnotations;

namespace AllureModa.API.Models
{
    public class WishlistItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public required string UserId { get; set; }
        public User? User { get; set; }

        [Required]
        public required string ProductId { get; set; }
        public Product? Product { get; set; }
    }
}
