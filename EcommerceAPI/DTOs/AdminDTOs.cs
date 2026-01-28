using System.Collections.Generic;

namespace ElectronicsEcommerce.API.DTOs
{
    public class DashboardStatsDTO
    {
        public int TotalOrders { get; set; }
        public int TotalUsers { get; set; }
        public int TotalProducts { get; set; }
        public decimal TotalRevenue { get; set; }
        public List<OrderSummaryDTO> RecentOrders { get; set; } = new List<OrderSummaryDTO>();
    }

    public class OrderSummaryDTO
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
    }

    public class AdminOrderDTO
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public int ItemsCount { get; set; }
    }

    public class UpdateOrderStatusDTO
    {
        public string Status { get; set; } = string.Empty;
    }
}