using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AllureModa.API.Models
{
    public class Category
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public required string Name { get; set; }

        [Required]
        public required string Slug { get; set; }

        public string? ParentId { get; set; }
        public Category? Parent { get; set; }
        public ICollection<Category> Children { get; set; } = new List<Category>();

        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
