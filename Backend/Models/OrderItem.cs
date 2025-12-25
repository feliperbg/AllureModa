using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AllureModa.API.Models
{
    public class OrderItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public int Quantity { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        public decimal PriceAtPurchase { get; set; }

        [Required]
        public required string OrderId { get; set; }
        public Order? Order { get; set; }

        [Required]
        public required string ProductVariantId { get; set; }
        public ProductVariant? ProductVariant { get; set; }
    }
}
