using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AllureModa.API.Models
{
    public class ProductVariantAttributeValue
    {
        [Required]
        public required string ProductVariantId { get; set; }
        public ProductVariant? ProductVariant { get; set; }

        [Required]
        public required string AttributeValueId { get; set; }
        public AttributeValue? AttributeValue { get; set; }
    }
}
