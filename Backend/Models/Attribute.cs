using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AllureModa.API.Models
{
    public class Attribute
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public required string Name { get; set; }

        [Required]
        public required string Slug { get; set; }

        public ICollection<AttributeValue> Values { get; set; } = new List<AttributeValue>();
    }
}
