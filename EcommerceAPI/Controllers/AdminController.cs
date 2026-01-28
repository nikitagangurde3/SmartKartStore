using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ElectronicsEcommerce.API.Data;
using ElectronicsEcommerce.API.DTOs;
using ElectronicsEcommerce.API.Models;

namespace ElectronicsEcommerce.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/dashboard-stats
        [HttpGet("dashboard-stats")]
        public async Task<ActionResult<DashboardStatsDTO>> GetDashboardStats()
        {
            var totalOrders = await _context.Orders.CountAsync();
            var totalUsers = await _context.Users.CountAsync();
            var totalProducts = await _context.Products.CountAsync();
            var totalRevenue = await _context.Orders
                .Where(o => o.PaymentStatus == "Paid")
                .SumAsync(o => o.TotalAmount);

            var recentOrders = await _context.Orders
                .Include(o => o.User)
                .OrderByDescending(o => o.OrderDate)
                .Take(10)
                .Select(o => new OrderSummaryDTO
                {
                    Id = o.Id,
                    UserName = o.User.Name,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    OrderDate = o.OrderDate
                })
                .ToListAsync();

            return new DashboardStatsDTO
            {
                TotalOrders = totalOrders,
                TotalUsers = totalUsers,
                TotalProducts = totalProducts,
                TotalRevenue = totalRevenue,
                RecentOrders = recentOrders
            };
        }

        // GET: api/admin/users
        [HttpGet("users")]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new UserDTO
                {
                    Id = u.Id,
                    Email = u.Email,
                    Name = u.Name,
                    Role = u.Role,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return users;
        }

        // PUT: api/admin/users/5/role
        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateRoleDTO roleDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            user.Role = roleDto.Role;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/admin/products
        [HttpPost("products")]
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
                Specifications = productDto.Specifications,
                Images = System.Text.Json.JsonSerializer.Serialize(productDto.Images ?? new List<string>()),
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

        // PUT: api/admin/products/5
        [HttpPut("products/{id}")]
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

        // DELETE: api/admin/products/5
        [HttpDelete("products/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return NotFound();

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/admin/orders
        [HttpGet("orders")]
        public async Task<ActionResult<IEnumerable<AdminOrderDTO>>> GetOrders(
            [FromQuery] string? status = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(o => o.Status == status);

            if (startDate.HasValue)
                query = query.Where(o => o.OrderDate >= startDate);

            if (endDate.HasValue)
                query = query.Where(o => o.OrderDate <= endDate);

            var orders = await query
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(o => new AdminOrderDTO
            {
                Id = o.Id,
                UserName = o.User.Name,
                UserEmail = o.User.Email,
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                PaymentStatus = o.PaymentStatus,
                PaymentMethod = o.PaymentMethod,
                ItemsCount = o.OrderItems.Count
            }).ToList();
        }

        // PUT: api/admin/orders/5/status
        [HttpPut("orders/{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDTO statusDto)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound();

            order.Status = statusDto.Status;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<ProductDTO?> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return null;

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
                CreatedAt = product.CreatedAt
            };
        }
    }
}