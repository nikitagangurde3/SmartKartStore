using System.ComponentModel.DataAnnotations;

namespace ElectronicsEcommerce.API.DTOs
{
    // For user registration
    public class RegisterDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;
    }

    // For user login
    public class LoginDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    // For returning user data (with token)
    public class UserResponseDTO
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    // For user profile (without sensitive data)
    public class UserProfileDTO
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    // For updating user profile
    public class UpdateUserDTO
    {
        public string Name { get; set; } = string.Empty;
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
    }

    // For admin user management
    public class UserDTO
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateRoleDTO
    {
        public string Role { get; set; } = string.Empty;
    }
}