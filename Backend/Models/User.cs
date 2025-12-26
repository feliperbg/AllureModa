using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace AllureModa.API.Models
{
    public class User
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [EmailAddress]
        public required string Email { get; set; }

        [JsonIgnore]
        public string PasswordHash { get; set; } = null!;

        [Required]
        public required string FirstName { get; set; }

        [Required]
        public required string LastName { get; set; }

        public string? Phone { get; set; }
        public string? Cpf { get; set; }
        public DateTime? BirthDate { get; set; }

        public Role Role { get; set; } = Role.USER;

        // Asaas Integration
        public string? AsaasCustomerId { get; set; }

        // SaaS Multi-tenancy
        public string TenantId { get; set; } = "default";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public ICollection<Address> Addresses { get; set; } = new List<Address>();
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
        public Cart? Cart { get; set; }
    }
}
