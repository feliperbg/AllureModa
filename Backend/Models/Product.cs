using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AllureModa.API.Models
{
    public class Product
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public required string Name { get; set; }

        [Required]
        public required string Description { get; set; }

        [Required]
        public required string Slug { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        public decimal BasePrice { get; set; }

        // SaaS Multi-tenancy
        public string TenantId { get; set; } = "default";

        [Column(TypeName = "decimal(10, 2)")]
        public decimal? PromotionalPrice { get; set; }

        public bool IsPromotional { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public required string CategoryId { get; set; }
        public Category? Category { get; set; }

        public string? BrandId { get; set; }
        public Brand? Brand { get; set; }

        public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
        public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
    }
}
