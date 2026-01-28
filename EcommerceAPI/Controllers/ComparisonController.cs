using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ElectronicsEcommerce.API.Data;
using ElectronicsEcommerce.API.DTOs;
using System.Security.Claims;
using ElectronicsEcommerce.API.Models;

namespace ElectronicsEcommerce.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ComparisonController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ComparisonController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/comparison/compare
        [HttpPost("compare")]
        public async Task<ActionResult<ComparisonResponseDTO>> CompareProducts([FromBody] CompareRequest request)
        {
            var product1 = await _context.Products.FindAsync(request.Product1Id);
            var product2 = await _context.Products.FindAsync(request.Product2Id);

            if (product1 == null || product2 == null)
                return NotFound("One or both products not found");

            // Parse specifications
            var specs1 = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(
                product1.Specifications ?? "{}") ?? new Dictionary<string, string>();

            var specs2 = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(
                product2.Specifications ?? "{}") ?? new Dictionary<string, string>();

            // Create comparison table
            var comparisonTable = new Dictionary<string, ComparisonItem>();

            // Get all unique specification keys
            var allKeys = specs1.Keys.Union(specs2.Keys);

            foreach (var key in allKeys)
            {
                var item = new ComparisonItem
                {
                    Product1Value = specs1.ContainsKey(key) ? specs1[key] : "N/A",
                    Product2Value = specs2.ContainsKey(key) ? specs2[key] : "N/A"
                };

                // Determine winner (for numeric comparisons)
                if (decimal.TryParse(item.Product1Value, out decimal val1) &&
                    decimal.TryParse(item.Product2Value, out decimal val2))
                {
                    item.Winner = val1 > val2 ? "product1" :
                                 val2 > val1 ? "product2" : "equal";
                }
                else
                {
                    item.Winner = "equal";
                }

                comparisonTable[key] = item;
            }

            // Save comparison to history (if user is logged in)
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim != null && int.TryParse(userIdClaim, out int userId))
            {
                var comparison = new ProductComparison
                {
                    UserId = userId,
                    Product1Id = product1.Id,
                    Product2Id = product2.Id,
                    ComparedAt = DateTime.UtcNow
                };

                _context.ProductComparisons.Add(comparison);
                await _context.SaveChangesAsync();
            }

            return new ComparisonResponseDTO
            {
                Product1 = new ProductDTO
                {
                    Id = product1.Id,
                    Name = product1.Name,
                    Price = product1.Price,
                    Brand = product1.Brand,
                    Images = System.Text.Json.JsonSerializer.Deserialize<List<string>>(product1.Images ?? "[]") ?? new List<string>(),
                    CategoryId = product1.CategoryId,
                    CreatedAt = product1.CreatedAt
                },
                Product2 = new ProductDTO
                {
                    Id = product2.Id,
                    Name = product2.Name,
                    Price = product2.Price,
                    Brand = product2.Brand,
                    Images = System.Text.Json.JsonSerializer.Deserialize<List<string>>(product2.Images ?? "[]") ?? new List<string>(),
                    CategoryId = product2.CategoryId,
                    CreatedAt = product2.CreatedAt
                },
                ComparisonTable = comparisonTable
            };
        }

        // GET: api/comparison/history
        [HttpGet("history")]
        public async Task<ActionResult<IEnumerable<ComparisonHistoryDTO>>> GetComparisonHistory()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var comparisons = await _context.ProductComparisons
                .Include(pc => pc.Product1)
                .Include(pc => pc.Product2)
                .Where(pc => pc.UserId == userId)
                .OrderByDescending(pc => pc.ComparedAt)
                .ToListAsync();

            return comparisons.Select(pc => new ComparisonHistoryDTO
            {
                Id = pc.Id,
                Product1Name = pc.Product1.Name,
                Product2Name = pc.Product2.Name,
                ComparedAt = pc.ComparedAt
            }).ToList();
        }
    }
}