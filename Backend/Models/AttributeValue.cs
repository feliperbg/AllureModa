using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AllureModa.API.Models
{
    public class AttributeValue
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public required string Value { get; set; }

        public string? Meta { get; set; }

        [Required]
        public required string AttributeId { get; set; }
        public Attribute? Attribute { get; set; }

        public ICollection<ProductVariantAttributeValue> VariantAttributes { get; set; } = new List<ProductVariantAttributeValue>();
    }
}
