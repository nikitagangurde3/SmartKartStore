using ElectronicsEcommerce.API.Data;
using ElectronicsEcommerce.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace ElectronicsEcommerce.API.Helpers
{
    public static class SeedData
    {
        public static async Task Initialize(AppDbContext context)
        {
            // Ensure database is created
            await context.Database.EnsureCreatedAsync();

            // Seed Categories if empty
            if (!await context.Categories.AnyAsync())
            {
                await SeedCategories(context);
            }

            // Seed Products if empty
            if (!await context.Products.AnyAsync())
            {
                await SeedProducts(context);
            }

            // Seed Admin User if empty
            if (!await context.Users.AnyAsync())
            {
                await SeedUsers(context);
            }
        }

        private static async Task SeedCategories(AppDbContext context)
        {
            var categories = new List<Category>
            {
                new Category
                {
                    Name = "Smartphones",
                    Description = "Latest smartphones from top brands",
                    ImageUrl = "/images/categories/smartphones.jpg"
                },
                new Category
                {
                    Name = "Laptops",
                    Description = "Laptops for work, gaming, and creativity",
                    ImageUrl = "/images/categories/laptops.jpg"
                },
                new Category
                {
                    Name = "Tablets",
                    Description = "Tablets for entertainment and productivity",
                    ImageUrl = "/images/categories/tablets.jpg"
                },
                new Category
                {
                    Name = "Wearables",
                    Description = "Smart watches and fitness trackers",
                    ImageUrl = "/images/categories/wearables.jpg"
                },
                new Category
                {
                    Name = "Accessories",
                    Description = "Cases, chargers, headphones and more",
                    ImageUrl = "/images/categories/accessories.jpg"
                },
                new Category
                {
                    Name = "Gaming",
                    Description = "Gaming consoles and accessories",
                    ImageUrl = "/images/categories/gaming.jpg"
                }
            };

            await context.Categories.AddRangeAsync(categories);
            await context.SaveChangesAsync();
        }

        private static async Task SeedProducts(AppDbContext context)
        {
            var smartphoneCategory = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Smartphones");
            var laptopCategory = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Laptops");
            var tabletCategory = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Tablets");
            var wearableCategory = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Wearables");

            if (smartphoneCategory == null || laptopCategory == null) return;

            var products = new List<Product>
            {
                // Smartphones
                new Product
                {
                    Name = "iPhone 15 Pro",
                    Description = "iPhone 15 Pro with Titanium design, A17 Pro chip, and advanced camera system",
                    Price = 999.99m,
                    CategoryId = smartphoneCategory.Id,
                    Brand = "Apple",
                    Stock = 50,
                    Images = JsonSerializer.Serialize(new List<string>
                    {
                        "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch?wid=5120&hei=2880&fmt=webp&qlt=70&.v=1693009279096"
                    }),
                    Specifications = JsonSerializer.Serialize(new Dictionary<string, string>
                    {
                        { "Display", "6.7-inch Super Retina XDR" },
                        { "Processor", "A17 Pro chip" },
                        { "RAM", "8GB" },
                        { "Storage", "256GB" },
                        { "Camera", "48MP Main + 12MP Ultra Wide + 12MP Telephoto" },
                        { "Battery", "4422 mAh" },
                        { "OS", "iOS 17" },
                        { "Weight", "221g" },
                        { "Water Resistance", "IP68" }
                    })
                },
                new Product
                {
                    Name = "Samsung Galaxy S24 Ultra",
                    Description = "Galaxy S24 Ultra with AI features and S Pen included",
                    Price = 1299.99m,
                    CategoryId = smartphoneCategory.Id,
                    Brand = "Samsung",
                    Stock = 40,
                    Images = JsonSerializer.Serialize(new List<string>
                    {
                        "https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-s24-s928-sm-s928bzvdinu-535866960"
                    }),
                    Specifications = JsonSerializer.Serialize(new Dictionary<string, string>
                    {
                        { "Display", "6.8-inch Dynamic AMOLED 2X" },
                        { "Processor", "Snapdragon 8 Gen 3" },
                        { "RAM", "12GB" },
                        { "Storage", "512GB" },
                        { "Camera", "200MP Main + 50MP Periscope + 12MP Ultra Wide + 10MP Telephoto" },
                        { "Battery", "5000 mAh" },
                        { "OS", "Android 14" },
                        { "Weight", "232g" },
                        { "Water Resistance", "IP68" }
                    })
                },
                new Product
                {
                    Name = "Google Pixel 8 Pro",
                    Description = "Pixel 8 Pro with Google AI, best-in-class camera",
                    Price = 999.00m,
                    CategoryId = smartphoneCategory.Id,
                    Brand = "Google",
                    Stock = 35,
                    Images = JsonSerializer.Serialize(new List<string>
                    {
                        "https://store.google.com/product/pixel_8_pro_image"
                    }),
                    Specifications = JsonSerializer.Serialize(new Dictionary<string, string>
                    {
                        { "Display", "6.7-inch LTPO OLED" },
                        { "Processor", "Google Tensor G3" },
                        { "RAM", "12GB" },
                        { "Storage", "256GB" },
                        { "Camera", "50MP Main + 48MP Ultra Wide + 48MP Telephoto" },
                        { "Battery", "5050 mAh" },
                        { "OS", "Android 14" },
                        { "Weight", "213g" },
                        { "Water Resistance", "IP68" }
                    })
                },
                
                // Laptops
                new Product
                {
                    Name = "MacBook Pro 16-inch",
                    Description = "MacBook Pro with M3 Pro chip for extreme performance",
                    Price = 2499.00m,
                    CategoryId = laptopCategory.Id,
                    Brand = "Apple",
                    Stock = 25,
                    Images = JsonSerializer.Serialize(new List<string>
                    {
                        "https://www.apple.com/v/macbook-pro-14-and-16/b/images/overview/hero/hero_intro_endframe__e6khcva4hkeq_large.jpg"
                    }),
                    Specifications = JsonSerializer.Serialize(new Dictionary<string, string>
                    {
                        { "Display", "16.2-inch Liquid Retina XDR" },
                        { "Processor", "Apple M3 Pro (12-core CPU)" },
                        { "RAM", "18GB" },
                        { "Storage", "512GB SSD" },
                        { "Graphics", "18-core GPU" },
                        { "Battery", "Up to 22 hours" },
                        { "Weight", "2.15kg" },
                        { "Ports", "3x Thunderbolt 4, HDMI, SDXC, MagSafe 3" }
                    })
                },
                new Product
                {
                    Name = "Dell XPS 15",
                    Description = "Dell XPS 15 with OLED display and Intel Core i9",
                    Price = 1999.99m,
                    CategoryId = laptopCategory.Id,
                    Brand = "Dell",
                    Stock = 30,
                    Images = JsonSerializer.Serialize(new List<string>
                    {
                        "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/notebook-xps-15-9530-nt-gallery-1.psd?fmt=png-alpha&pscan=auto&scl=1&hei=402&wid=536&qlt=100,1&resMode=sharp2&size=536,402&chrss=full"
                    }),
                    Specifications = JsonSerializer.Serialize(new Dictionary<string, string>
                    {
                        { "Display", "15.6-inch 3.5K OLED" },
                        { "Processor", "Intel Core i9-13900H" },
                        { "RAM", "32GB DDR5" },
                        { "Storage", "1TB SSD" },
                        { "Graphics", "NVIDIA RTX 4070 8GB" },
                        { "Battery", "86Wh" },
                        { "Weight", "1.92kg" },
                        { "OS", "Windows 11 Pro" }
                    })
                },
                new Product
                {
                    Name = "HP Spectre x360",
                    Description = "2-in-1 laptop with OLED touchscreen and Intel Evo platform",
                    Price = 1499.99m,
                    CategoryId = laptopCategory.Id,
                    Brand = "HP",
                    Stock = 20,
                    Images = JsonSerializer.Serialize(new List<string>
                    {
                        "https://www.hp.com/us-en/shop/app/assets/images/product/8T5K0AV_1/center_facing.png"
                    }),
                    Specifications = JsonSerializer.Serialize(new Dictionary<string, string>
                    {
                        { "Display", "16-inch 2.8K OLED Touch" },
                        { "Processor", "Intel Core i7-1360P" },
                        { "RAM", "16GB LPDDR5" },
                        { "Storage", "1TB SSD" },
                        { "Graphics", "Intel Iris Xe" },
                        { "Battery", "Up to 17 hours" },
                        { "Weight", "2.01kg" },
                        { "Features", "360° hinge, Pen included" }
                    })
                }
            };

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();
        }

        private static async Task SeedUsers(AppDbContext context)
        {
            // Create password hash for admin
            string adminPassword = "Admin@123";
            CreatePasswordHash(adminPassword, out byte[] adminHash, out byte[] adminSalt);

            var adminUser = new User
            {
                Email = "admin@example.com",
                Name = "Administrator",
                PasswordHash = Convert.ToBase64String(adminHash),
                PasswordSalt = Convert.ToBase64String(adminSalt),
                Role = "Admin",
                CreatedAt = DateTime.UtcNow
            };

            // Create regular user
            string userPassword = "User@123";
            CreatePasswordHash(userPassword, out byte[] userHash, out byte[] userSalt);

            var regularUser = new User
            {
                Email = "user@example.com",
                Name = "John Doe",
                PasswordHash = Convert.ToBase64String(userHash),
                PasswordSalt = Convert.ToBase64String(userSalt),
                Role = "Customer",
                CreatedAt = DateTime.UtcNow
            };

            await context.Users.AddRangeAsync(adminUser, regularUser);
            await context.SaveChangesAsync();

            // Add address for regular user
            var address = new Address
            {
                UserId = regularUser.Id,
                Street = "123 Main Street",
                City = "New York",
                State = "NY",
                ZipCode = "10001",
                Country = "USA",
                IsDefault = true
            };

            await context.Addresses.AddAsync(address);
            await context.SaveChangesAsync();
        }

        private static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using var hmac = new HMACSHA512();
            passwordSalt = hmac.Key;
            passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        }
    }
}