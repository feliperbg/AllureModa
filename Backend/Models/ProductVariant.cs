using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AllureModa.API.Models
{
    public class ProductVariant
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public required string Sku { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        public decimal? PromotionalPrice { get; set; }

        public int Stock { get; set; } = 0;

        [Required]
        public required string ProductId { get; set; }
        public Product? Product { get; set; }

        public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        public ICollection<ProductVariantAttributeValue> Attributes { get; set; } = new List<ProductVariantAttributeValue>();
    }
}
