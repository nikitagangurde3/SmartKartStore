using System.ComponentModel.DataAnnotations;

namespace ElectronicsEcommerce.API.DTOs
{
    public class AddToCartDTO
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, 100)]
        public int Quantity { get; set; } = 1;
    }

    public class UpdateQuantityDTO
    {
        [Required]
        [Range(0, 100)]
        public int Quantity { get; set; }
    }
}