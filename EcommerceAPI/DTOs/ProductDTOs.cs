using System.Text.Json;

namespace ElectronicsEcommerce.API.DTOs
{
    public class ProductDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public List<string> Images { get; set; } = new List<string>();
        public int Stock { get; set; }
        public JsonDocument? Specifications { get; set; } // Made nullable
        public DateTime CreatedAt { get; set; }
    }

    public class CreateProductDTO
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
        public string Brand { get; set; } = string.Empty;
        public int Stock { get; set; }
        public string Specifications { get; set; } = string.Empty; // JSON string
        public List<string> Images { get; set; } = new List<string>();
    }

    public class UpdateProductDTO
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int CategoryId { get; set; }
        public string Brand { get; set; } = string.Empty;
        public int Stock { get; set; }
        public string Specifications { get; set; } = string.Empty;
    }

    public class CategoryDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int ProductCount { get; set; }
    }

    public class ComparisonResponseDTO
    {
        public ProductDTO Product1 { get; set; } = null!;
        public ProductDTO Product2 { get; set; } = null!;
        public Dictionary<string, ComparisonItem> ComparisonTable { get; set; } = new Dictionary<string, ComparisonItem>();
    }

    public class ComparisonItem
    {
        public string Product1Value { get; set; } = string.Empty;
        public string Product2Value { get; set; } = string.Empty;
        public string Winner { get; set; } = string.Empty; // "product1", "product2", "equal"
    }

    public class CompareRequest
    {
        public int Product1Id { get; set; }
        public int Product2Id { get; set; }
    }

    public class ComparisonHistoryDTO
    {
        public int Id { get; set; }
        public string Product1Name { get; set; } = string.Empty;
        public string Product2Name { get; set; } = string.Empty;
        public DateTime ComparedAt { get; set; }
    }
}