using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ElectronicsEcommerce.API.Data;
using ElectronicsEcommerce.API.DTOs;
using ElectronicsEcommerce.API.Models;
using Stripe;
using Stripe.Checkout;

namespace ElectronicsEcommerce.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public OrdersController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
            StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
        }

        // GET: api/orders/myorders
        [HttpGet("myorders")]
        public async Task<ActionResult<IEnumerable<OrderDTO>>> GetMyOrders()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return orders.Select(o => new OrderDTO
            {
                Id = o.Id,
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,
                Status = o.Status,
                ShippingAddress = o.ShippingAddress,
                PaymentMethod = o.PaymentMethod,
                PaymentStatus = o.PaymentStatus,
                Items = o.OrderItems.Select(oi => new OrderItemDTO
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Product.Name,
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            }).ToList();
        }

        // GET: api/orders/5
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDTO>> GetOrder(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            if (order == null)
                return NotFound();

            return new OrderDTO
            {
                Id = order.Id,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                Status = order.Status,
                ShippingAddress = order.ShippingAddress,
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus,
                Items = order.OrderItems.Select(oi => new OrderItemDTO
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Product.Name,
                    Quantity = oi.Quantity,
                    Price = oi.Price
                }).ToList()
            };
        }

        // POST: api/orders/create
        [HttpPost("create")]
        public async Task<ActionResult<OrderResponseDTO>> CreateOrder(CreateOrderDTO orderDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            // Get user cart items
            var cartItems = await _context.ShoppingCart
                .Include(sc => sc.Product)
                .Where(sc => sc.UserId == userId)
                .ToListAsync();

            if (!cartItems.Any())
                return BadRequest("Cart is empty");

            // Calculate total
            decimal totalAmount = cartItems.Sum(ci => ci.Quantity * ci.Product.Price);

            // Create order
            var order = new Order
            {
                UserId = userId,
                TotalAmount = totalAmount,
                Status = "Pending",
                ShippingAddress = orderDto.ShippingAddress,
                PaymentMethod = orderDto.PaymentMethod,
                PaymentStatus = "Pending"
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Add order items
            foreach (var cartItem in cartItems)
            {
                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = cartItem.ProductId,
                    Quantity = cartItem.Quantity,
                    Price = cartItem.Product.Price
                };
                _context.OrderItems.Add(orderItem);

                // Update product stock
                cartItem.Product.Stock -= cartItem.Quantity;
            }

            // Clear user's cart
            _context.ShoppingCart.RemoveRange(cartItems);

            await _context.SaveChangesAsync();

            // If payment method is card, create Stripe session
            if (orderDto.PaymentMethod == "CreditCard")
            {
                var session = await CreateStripeSession(order, orderDto.ReturnUrl);

                return new OrderResponseDTO
                {
                    OrderId = order.Id,
                    Message = "Order created successfully",
                    RequiresPayment = true,
                    PaymentUrl = session.Url,
                    SessionId = session.Id
                };
            }

            return new OrderResponseDTO
            {
                OrderId = order.Id,
                Message = "Order created successfully. Pay on delivery.",
                RequiresPayment = false
            };
        }

        // POST: api/orders/confirm-payment
        [HttpPost("confirm-payment")]
        public async Task<ActionResult> ConfirmPayment(ConfirmPaymentDTO paymentDto)
        {
            var service = new SessionService();
            var session = await service.GetAsync(paymentDto.SessionId);

            if (session.PaymentStatus == "paid")
            {
                var orderId = int.Parse(session.Metadata["orderId"]);
                var order = await _context.Orders.FindAsync(orderId);

                if (order != null)
                {
                    order.PaymentStatus = "Paid";
                    order.Status = "Processing";
                    order.TransactionId = session.PaymentIntentId;
                    await _context.SaveChangesAsync();

                    return Ok(new { message = "Payment confirmed successfully" });
                }
            }

            return BadRequest("Payment not confirmed");
        }

        private async Task<Session> CreateStripeSession(Order order, string returnUrl)
        {
            var lineItems = new List<SessionLineItemOptions>();

            var orderItems = await _context.OrderItems
                .Include(oi => oi.Product)
                .Where(oi => oi.OrderId == order.Id)
                .ToListAsync();

            foreach (var item in orderItems)
            {
                lineItems.Add(new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        UnitAmount = (long)(item.Price * 100), // Convert to cents
                        Currency = "usd",
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = item.Product.Name,
                            Description = item.Product.Description
                        }
                    },
                    Quantity = item.Quantity
                });
            }

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = lineItems,
                Mode = "payment",
                SuccessUrl = $"{returnUrl}?success=true&session_id={{CHECKOUT_SESSION_ID}}",
                CancelUrl = $"{returnUrl}?canceled=true",
                Metadata = new Dictionary<string, string>
                {
                    { "orderId", order.Id.ToString() },
                    { "userId", order.UserId.ToString() }
                }
            };

            var service = new SessionService();
            return await service.CreateAsync(options);
        }
    }

    public class CreateOrderDTO
    {
        public string ShippingAddress { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty; // CreditCard, PayPal, COD
        public string ReturnUrl { get; set; } = "http://localhost:3000/order-success";
    }

    public class ConfirmPaymentDTO
    {
        public string SessionId { get; set; } = string.Empty;
    }

    public class OrderResponseDTO
    {
        public int OrderId { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool RequiresPayment { get; set; }
        public string? PaymentUrl { get; set; }
        public string? SessionId { get; set; }
    }
}