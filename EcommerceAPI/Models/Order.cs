using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ElectronicsEcommerce.API.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        [Required]
        [Range(0.01, 1000000)]
        public decimal TotalAmount { get; set; }

        [Required]
        public string Status { get; set; } = "Pending"; // Pending, Processing, Shipped, Delivered, Cancelled

        [Required]
        public string ShippingAddress { get; set; } = string.Empty;

        [Required]
        public string PaymentMethod { get; set; } = string.Empty; // CreditCard, PayPal, COD

        public string? PaymentStatus { get; set; } = "Pending";

        public string? TransactionId { get; set; }

        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}