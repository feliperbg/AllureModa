using System;

namespace AllureModa.API.Models
{
    public class WebhookLog
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        public string? Event { get; set; }
        public required string Payload { get; set; } // JSON body
        
        public string Status { get; set; } = "RECEIVED"; // RECEIVED, PROCESSED, ERROR
        public string? ErrorMessage { get; set; }

        public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
        
        // SaaS
        public string TenantId { get; set; } = "default";
    }
}
