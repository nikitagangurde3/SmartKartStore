using System;
using System.Collections.Generic;

namespace ElectronicsEcommerce.API.DTOs
{
    public class OrderDTO
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string? PaymentStatus { get; set; }
        public List<OrderItemDTO> Items { get; set; } = new List<OrderItemDTO>();
    }

    public class OrderItemDTO
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal Subtotal => Quantity * Price;
    }

    public class AddressDTO
    {
        public int Id { get; set; }
        public string Street { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }

    public class CreateAddressDTO
    {
        public string Street { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }

    public class CartItemDTO
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public decimal Subtotal => Price * Quantity;
    }

    public class CartResponseDTO
    {
        public List<CartItemDTO> Items { get; set; } = new List<CartItemDTO>();
        public decimal TotalAmount { get; set; }
        public int TotalItems { get; set; }
    }

    public class CheckoutDTO
    {
        public string ShippingAddress { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty; // CreditCard, PayPal, COD
        public bool SaveAddress { get; set; }
    }

    public class PaymentResponseDTO
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? PaymentUrl { get; set; }
        public string? TransactionId { get; set; }
        public int OrderId { get; set; }
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