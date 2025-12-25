using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AllureModa.API.Models
{
    public class Order
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public OrderStatus Status { get; set; } = OrderStatus.PENDING;

        [Column(TypeName = "decimal(10, 2)")]
        public decimal SubTotal { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        public decimal ShippingFee { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        public decimal DiscountAmount { get; set; } = 0.00m;

        public string? CouponCode { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        public decimal TotalPrice { get; set; }

        public string? TrackingNumber { get; set; }

        // SaaS Multi-tenancy
        public string TenantId { get; set; } = "default";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public required string UserId { get; set; }
        public User? User { get; set; }

        [Required]
        public required string ShippingAddressId { get; set; }
        public Address? ShippingAddress { get; set; }

        [Required]
        public required string BillingAddressId { get; set; }
        public Address? BillingAddress { get; set; }

        public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}
