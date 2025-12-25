using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AllureModa.API.Models
{
    public class Brand
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public required string Name { get; set; }

        [Required]
        public required string Slug { get; set; }

        public string? LogoUrl { get; set; }

        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
