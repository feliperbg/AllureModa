using System.ComponentModel.DataAnnotations;

namespace AllureModa.API.Models
{
    public class PageConfig
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// Page identifier (e.g., "homepage")
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string PageSlug { get; set; } = null!;

        /// <summary>
        /// True = draft version, False = published version
        /// </summary>
        public bool IsDraft { get; set; } = true;

        /// <summary>
        /// Collection of blocks that make up this page
        /// </summary>
        public List<PageBlock> Blocks { get; set; } = new();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
