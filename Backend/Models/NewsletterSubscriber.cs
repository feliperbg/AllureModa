using System;
using System.ComponentModel.DataAnnotations;

namespace AllureModa.API.Models
{
    public class NewsletterSubscriber
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
