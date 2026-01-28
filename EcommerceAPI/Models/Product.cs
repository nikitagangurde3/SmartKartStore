using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ElectronicsEcommerce.API.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(0.01, 1000000)]
        public decimal Price { get; set; }

        public int CategoryId { get; set; }

        [Required]
        public string Brand { get; set; } = string.Empty;

        public string Images { get; set; } = string.Empty; // JSON array of image URLs

        [Range(0, 10000)]
        public int Stock { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Specifications as JSON (for comparison module)
        public string Specifications { get; set; } = string.Empty; // JSON object

        // Navigation properties
        [ForeignKey("CategoryId")]
        public virtual Category Category { get; set; } = null!;
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}