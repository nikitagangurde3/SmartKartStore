using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ElectronicsEcommerce.API.Models
{
    public class ProductComparison
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int Product1Id { get; set; }

        [Required]
        public int Product2Id { get; set; }

        public DateTime ComparedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("Product1Id")]
        public virtual Product Product1 { get; set; } = null!;

        [ForeignKey("Product2Id")]
        public virtual Product Product2 { get; set; } = null!;
    }
}