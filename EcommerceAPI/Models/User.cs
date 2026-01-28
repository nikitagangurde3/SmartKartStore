using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ElectronicsEcommerce.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [JsonIgnore]
        public string PasswordSalt { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        public string Role { get; set; } = "Customer"; // Admin, Customer

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<Address> Addresses { get; set; } = new List<Address>();
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual ICollection<ShoppingCart> CartItems { get; set; } = new List<ShoppingCart>();
        public virtual ICollection<Wishlist> WishlistItems { get; set; } = new List<Wishlist>();
        public virtual ICollection<ProductComparison> Comparisons { get; set; } = new List<ProductComparison>();
    }
}