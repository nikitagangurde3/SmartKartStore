using ElectronicsEcommerce.API.Data;
using ElectronicsEcommerce.API.DTOs;
using ElectronicsEcommerce.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ElectronicsEcommerce.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShoppingCartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ShoppingCartController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/shoppingcart/my-cart
        [HttpGet("my-cart")]
        public async Task<ActionResult<CartResponseDTO>> GetMyCart()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized("Please login to view your cart");

            var cartItems = await _context.ShoppingCart
                .Include(sc => sc.Product)
                .Where(sc => sc.UserId == userId)
                .ToListAsync();

            var cartItemsDTO = cartItems.Select(ci => new CartItemDTO
            {
                ProductId = ci.ProductId,
                ProductName = ci.Product.Name,
                Price = ci.Product.Price,
                Quantity = ci.Quantity,
                ImageUrl = GetFirstImage(ci.Product.Images)
            }).ToList();

            return new CartResponseDTO
            {
                Items = cartItemsDTO,
                TotalAmount = cartItemsDTO.Sum(ci => ci.Subtotal),
                TotalItems = cartItemsDTO.Sum(ci => ci.Quantity)
            };
        }

        // POST: api/shoppingcart/add
        [HttpPost("add")]
        public async Task<ActionResult> AddToCart([FromBody] AddToCartDTO cartDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized("Please login to add items to cart");

            // Check if product exists and has stock
            var product = await _context.Products.FindAsync(cartDto.ProductId);
            if (product == null)
                return NotFound("Product not found");

            if (product.Stock < cartDto.Quantity)
                return BadRequest($"Only {product.Stock} items available in stock");

            // Check if item already exists in cart
            var existingCartItem = await _context.ShoppingCart
                .FirstOrDefaultAsync(sc => sc.UserId == userId && sc.ProductId == cartDto.ProductId);

            if (existingCartItem != null)
            {
                // Update quantity
                existingCartItem.Quantity += cartDto.Quantity;
                existingCartItem.UpdatedAt = DateTime.UtcNow;

                // Check stock again
                if (product.Stock < existingCartItem.Quantity)
                    return BadRequest($"Cannot add more than {product.Stock} items");
            }
            else
            {
                // Add new item
                var cartItem = new ShoppingCart
                {
                    UserId = userId,
                    ProductId = cartDto.ProductId,
                    Quantity = cartDto.Quantity,
                    AddedAt = DateTime.UtcNow
                };
                _context.ShoppingCart.Add(cartItem);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Item added to cart successfully" });
        }

        // PUT: api/shoppingcart/update-quantity/5
        [HttpPut("update-quantity/{id}")]
        public async Task<ActionResult> UpdateQuantity(int id, [FromBody] UpdateQuantityDTO quantityDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var cartItem = await _context.ShoppingCart
                .Include(sc => sc.Product)
                .FirstOrDefaultAsync(sc => sc.Id == id && sc.UserId == userId);

            if (cartItem == null)
                return NotFound("Cart item not found");

            if (quantityDto.Quantity <= 0)
            {
                // Remove item if quantity is 0 or negative
                _context.ShoppingCart.Remove(cartItem);
            }
            else
            {
                // Check stock
                if (cartItem.Product.Stock < quantityDto.Quantity)
                    return BadRequest($"Only {cartItem.Product.Stock} items available");

                cartItem.Quantity = quantityDto.Quantity;
                cartItem.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Cart updated successfully" });
        }

        // DELETE: api/shoppingcart/remove/5
        [HttpDelete("remove/{id}")]
        public async Task<ActionResult> RemoveFromCart(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var cartItem = await _context.ShoppingCart
                .FirstOrDefaultAsync(sc => sc.Id == id && sc.UserId == userId);

            if (cartItem == null)
                return NotFound("Cart item not found");

            _context.ShoppingCart.Remove(cartItem);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Item removed from cart" });
        }

        // POST: api/shoppingcart/clear
        [HttpPost("clear")]
        public async Task<ActionResult> ClearCart()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var cartItems = await _context.ShoppingCart
                .Where(sc => sc.UserId == userId)
                .ToListAsync();

            if (!cartItems.Any())
                return Ok(new { message = "Cart is already empty" });

            _context.ShoppingCart.RemoveRange(cartItems);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cart cleared successfully" });
        }

        [HttpGet("count")]
        [Authorize] // Add this attribute
        public async Task<ActionResult<int>> GetCartItemCount()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var count = await _context.ShoppingCart
                .Where(sc => sc.UserId == userId)
                .SumAsync(sc => sc.Quantity);

            return count;
        }

        private string GetFirstImage(string imagesJson)
        {
            try
            {
                if (string.IsNullOrEmpty(imagesJson))
                    return "/images/default-product.jpg";

                var images = System.Text.Json.JsonSerializer.Deserialize<List<string>>(imagesJson);
                return images?.FirstOrDefault() ?? "/images/default-product.jpg";
            }
            catch
            {
                return "/images/default-product.jpg";
            }
        }
    }
}