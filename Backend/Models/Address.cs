using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AllureModa.API.Models
{
    public class Address
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public string? RecipientName { get; set; }
        public string? Phone { get; set; }

        [Required]
        public required string Street { get; set; }

        [Required]
        public required string Number { get; set; }

        public string? Neighborhood { get; set; }

        [Required]
        public required string City { get; set; }

        [Required]
        public required string State { get; set; }

        [Required]
        public required string PostalCode { get; set; }

        [Required]
        public required string Country { get; set; }

        public string? AddressLine2 { get; set; }

        public AddressType Type { get; set; } = AddressType.SHIPPING;
        public bool IsDefault { get; set; } = false;

        [Required]
        public required string UserId { get; set; }
        public User? User { get; set; }

        public ICollection<Order> ShippingOrders { get; set; } = new List<Order>();
        public ICollection<Order> BillingOrders { get; set; } = new List<Order>();
    }
}
