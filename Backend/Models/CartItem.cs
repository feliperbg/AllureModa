using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AllureModa.API.Models
{
    public class CartItem
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public int Quantity { get; set; } = 1;

        [Required]
        public required string CartId { get; set; }
        public Cart? Cart { get; set; }

        [Required]
        public required string ProductVariantId { get; set; }
        public ProductVariant? ProductVariant { get; set; }
    }
}
