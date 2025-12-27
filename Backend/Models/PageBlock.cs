using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AllureModa.API.Models
{
    public class PageBlock
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string PageConfigId { get; set; } = null!;

        [ForeignKey("PageConfigId")]
        public PageConfig PageConfig { get; set; } = null!;

        [Required]
        public BlockType Type { get; set; }

        /// <summary>
        /// Order of this block within the page (0 = first)
        /// </summary>
        public int Order { get; set; }

        /// <summary>
        /// JSON configuration specific to the block type
        /// </summary>
        [Required]
        public string ConfigJson { get; set; } = "{}";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
