using ElectronicsEcommerce.API.Data;
using ElectronicsEcommerce.API.DTOs;
using ElectronicsEcommerce.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace ElectronicsEcommerce.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // In AuthController.cs - check the Register method
        [HttpPost("register")]
        public async Task<ActionResult<UserResponseDTO>> Register(RegisterDTO registerDto)
        {
            try
            {
                // Check if user exists
                if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
                {
                    return BadRequest(new { message = "User with this email already exists" });
                }

                // Create password hash
                CreatePasswordHash(registerDto.Password, out byte[] passwordHash, out byte[] passwordSalt);

                var user = new User
                {
                    Email = registerDto.Email,
                    Name = registerDto.Name,
                    PasswordHash = Convert.ToBase64String(passwordHash),
                    PasswordSalt = Convert.ToBase64String(passwordSalt),
                    Role = "Customer",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);

                // Save changes to database
                int rowsAffected = await _context.SaveChangesAsync();

                if (rowsAffected == 0)
                {
                    return BadRequest(new { message = "Failed to save user to database" });
                }

                // Generate token
                var token = GenerateToken(user);

                return Ok(new UserResponseDTO
                {
                    Id = user.Id,
                    Email = user.Email,
                    Name = user.Name,
                    Role = user.Role,
                    Token = token
                });
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"Registration error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");

                return StatusCode(500, new
                {
                    message = "An error occurred during registration",
                    error = ex.Message
                });
            }
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<UserResponseDTO>> Login(LoginDTO loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            // Verify password
            if (!VerifyPasswordHash(loginDto.Password,
                Convert.FromBase64String(user.PasswordHash),
                Convert.FromBase64String(user.PasswordSalt)))
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            // Generate token
            var token = GenerateToken(user);

            return Ok(new UserResponseDTO
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role,
                Token = token
            });
        }
        //// POST: api/auth/validate-token
        //[HttpPost("validate-token")]
        //public IActionResult ValidateToken()
        //{
        //    var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

        //    if (string.IsNullOrEmpty(token))
        //        return Unauthorized();

        //    try
        //    {
        //        var tokenHandler = new JwtSecurityTokenHandler();
        //        var key = Encoding.ASCII.GetBytes(_configuration["JWT:Secret"]!);

        //        tokenHandler.ValidateToken(token, new TokenValidationParameters
        //        {
        //            ValidateIssuerSigningKey = true,
        //            IssuerSigningKey = new SymmetricSecurityKey(key),
        //            ValidateIssuer = false,
        //            ValidateAudience = false,
        //            ClockSkew = TimeSpan.Zero
        //        }, out SecurityToken validatedToken);

        //        return Ok(new { valid = true });
        //    }
        //    catch
        //    {
        //        return Unauthorized();
        //    }
        //}

        // POST: api/auth/validate-token
        [HttpPost("validate-token")]
        [Authorize] // This ensures only authenticated users can access
        public IActionResult ValidateToken()
        {
            // If we reach here, the token is valid (Authorize attribute validated it)
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            return Ok(new
            {
                valid = true,
                userId,
                userEmail,
                userName,
                userRole,
                message = "Token is valid"
            });
        }

        // Alternative: Simple validation endpoint (no authentication required)
        [HttpGet("check-token")]
        public IActionResult CheckToken([FromHeader] string authorization)
        {
            if (string.IsNullOrEmpty(authorization) || !authorization.StartsWith("Bearer "))
            {
                return Unauthorized(new { valid = false, message = "No token provided" });
            }

            var token = authorization.Substring("Bearer ".Length).Trim();

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]!);

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return Ok(new { valid = true, message = "Token is valid" });
            }
            catch
            {
                return Unauthorized(new { valid = false, message = "Invalid token" });
            }
        }
        
        private string GenerateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _configuration["JWT:Secret"]!));

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using var hmac = new HMACSHA512();
            passwordSalt = hmac.Key;
            passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        }

        private bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
        {
            using var hmac = new HMACSHA512(storedSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            return computedHash.SequenceEqual(storedHash);
        }
    }
}