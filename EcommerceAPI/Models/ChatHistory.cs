using System;
using System.ComponentModel.DataAnnotations;

namespace ElectronicsEcommerce.API.Models
{
    public class ChatHistory
    {
        [Key]
        public int Id { get; set; }

        public int? UserId { get; set; } // Nullable for anonymous users

        [Required]
        public string Message { get; set; } = string.Empty;

        [Required]
        public bool IsUserMessage { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Optional: Store the AI response details
        public string? Response { get; set; }

        public string? Intent { get; set; } // e.g., "product_query", "comparison", "recommendation"

        // Navigation property
        public virtual User? User { get; set; }
    }
}