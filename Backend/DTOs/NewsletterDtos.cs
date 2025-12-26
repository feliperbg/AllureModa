using System.ComponentModel.DataAnnotations;

namespace AllureModa.API.DTOs
{
    public class NewsletterSubscribeRequest
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
    }

    public class SendNewsletterRequest
    {
        [Required]
        public required string Subject { get; set; }

        [Required]
        public required string Content { get; set; } // HTML Content
    }
}
