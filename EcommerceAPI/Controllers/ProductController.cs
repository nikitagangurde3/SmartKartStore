using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ElectronicsEcommerce.API.Data;
using ElectronicsEcommerce.API.DTOs;
using ElectronicsEcommerce.API.Models;
using System.Text.Json;

namespace ElectronicsEcommerce.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDTO>>> GetProducts(
    [FromQuery] string? category = null,
    [FromQuery] string? brand = null,
    [FromQuery] decimal? minPrice = null,
    [FromQuery] decimal? maxPrice = null,
    [FromQuery] string? search = null)
        {
            try
            {
                var query = _context.Products
                    .Include(p => p.Category)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(category))
                    query = query.Where(p => p.Category.Name == category);

                if (!string.IsNullOrEmpty(brand))
                    query = query.Where(p => p.Brand == brand);

                if (minPrice.HasValue)
                    query = query.Where(p => p.Price >= minPrice.Value);

                if (maxPrice.HasValue)
                    query = query.Where(p => p.Price <= maxPrice.Value);

                if (!string.IsNullOrEmpty(search))
                    query = query.Where(p => p.Name.Contains(search) || p.Description.Contains(search));

                var products = await query.ToListAsync();

                return products.Select(p => new ProductDTO
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category?.Name ?? "",
                    Brand = p.Brand,
                    Stock = p.Stock,
                    Images = JsonSerializer.Deserialize<List<string>>(p.Images ?? "[]") ?? new List<string>(),
                    CreatedAt = p.CreatedAt
                }).ToList();
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"Error in GetProducts: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");

                // Return a proper error response
                return StatusCode(500, new
                {
                    message = "An error occurred while fetching products",
                    error = ex.Message,
                    details = ex.InnerException?.Message
                });
            }
        }
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new
            {
                message = "API is working",
                timestamp = DateTime.UtcNow,
                version = "1.0"
            });
        }
        // GET: api/products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDTO>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return NotFound();

            return new ProductDTO
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                CategoryId = product.CategoryId,
                CategoryName = product.Category?.Name ?? "",
                Brand = product.Brand,
                Stock = product.Stock,
                Images = JsonSerializer.Deserialize<List<string>>(product.Images ?? "[]") ?? new List<string>(),
                Specifications = JsonSerializer.Deserialize<JsonDocument>(product.Specifications ?? "{}"),
                CreatedAt = product.CreatedAt
            };
        }

        // GET: api/products/categories
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<CategoryDTO>>> GetCategories()
        {
            var categories = await _context.Categories
                .Include(c => c.Products)
                .ToListAsync();

            return categories.Select(c => new CategoryDTO
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                ImageUrl = c.ImageUrl,
                ProductCount = c.Products.Count
            }).ToList();
        }

        // GET: api/products/brands
        [HttpGet("brands")]
        public async Task<ActionResult<IEnumerable<string>>> GetBrands()
        {
            var brands = await _context.Products
                .Select(p => p.Brand)
                .Distinct()
                .ToListAsync();

            return brands;
        }

        //// GET: api/products/search/{term}
        //[HttpGet("search/{term}")]
        //public async Task<ActionResult<IEnumerable<ProductDTO>>> SearchProducts(string term)
        //{
        //    var products = await _context.Products
        //        .Include(p => p.Category)
        //        .Where(p => p.Name.Contains(term) ||
        //                   p.Description.Contains(term) ||
        //                   p.Brand.Contains(term))
        //        .Take(10)
        //        .ToListAsync();

        //    return products.Select(p => new ProductDTO
        //    {
        //        Id = p.Id,
        //        Name = p.Name,
        //        Description = p.Description,
        //        Price = p.Price,
        //        CategoryId = p.CategoryId,
        //        CategoryName = p.Category?.Name ?? "",
        //        Brand = p.Brand,
        //        Stock = p.Stock,
        //        Images = JsonSerializer.Deserialize<List<string>>(p.Images ?? "[]") ?? new List<string>()
        //    }).ToList();
        //}
        // GET: api/products/search/{term}
        [HttpGet("search/{term}")]
        public async Task<ActionResult<IEnumerable<ProductDTO>>> SearchProducts(string term)
        {
            if (string.IsNullOrWhiteSpace(term))
                return BadRequest("Search term is required");

            var products = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.Name.Contains(term) ||
                           p.Description.Contains(term) ||
                           p.Brand.Contains(term) ||
                           p.Category.Name.Contains(term))
                .Take(10)
                .ToListAsync();

            return products.Select(p => new ProductDTO
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.Name ?? "",
                Brand = p.Brand,
                Stock = p.Stock,
                Images = JsonSerializer.Deserialize<List<string>>(p.Images ?? "[]") ?? new List<string>()
            }).ToList();
        }
        // POST: api/products (Admin only)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductDTO>> CreateProduct(CreateProductDTO productDto)
        {
            var category = await _context.Categories.FindAsync(productDto.CategoryId);
            if (category == null)
                return BadRequest("Invalid category");

            var product = new Product
            {
                Name = productDto.Name,
                Description = productDto.Description,
                Price = productDto.Price,
                CategoryId = productDto.CategoryId,
                Brand = productDto.Brand,
                Stock = productDto.Stock,
                Images = JsonSerializer.Serialize(productDto.Images ?? new List<string>()),
                Specifications = productDto.Specifications,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, new ProductDTO
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                CategoryId = product.CategoryId,
                CategoryName = category.Name,
                Brand = product.Brand,
                Stock = product.Stock,
                Images = productDto.Images ?? new List<string>()
            });
        }

        // PUT: api/products/5 (Admin only)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateProduct(int id, UpdateProductDTO productDto)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            product.Name = productDto.Name;
            product.Description = productDto.Description;
            product.Price = productDto.Price;
            product.CategoryId = productDto.CategoryId;
            product.Brand = productDto.Brand;
            product.Stock = productDto.Stock;
            product.Specifications = productDto.Specifications;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/products/5 (Admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}