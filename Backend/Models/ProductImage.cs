using System;
using System.ComponentModel.DataAnnotations;

namespace AllureModa.API.Models
{
    public class ProductImage
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public required string Url { get; set; }

        public string? AltText { get; set; }
        public int Priority { get; set; } = 0;

        [Required]
        public required string ProductId { get; set; }
        public Product? Product { get; set; }

        public string? ProductVariantId { get; set; }
        public ProductVariant? ProductVariant { get; set; }
    }
}
