using System.ComponentModel.DataAnnotations;

namespace AllureModa.API.Models
{
    public enum DiscountType
    {
        PERCENTAGE,
        FIXED
    }

    public class Coupon
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        public DiscountType Type { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Value { get; set; }

        public decimal? MinPurchase { get; set; }

        public DateTime? ExpirationDate { get; set; }

        public int? UsageLimit { get; set; }
        public int UsageCount { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
