//using Microsoft.EntityFrameworkCore;
//using ElectronicsEcommerce.API.Models;
//using System.ComponentModel.DataAnnotations;
//using System.ComponentModel.DataAnnotations.Schema;

//namespace ElectronicsEcommerce.API.Data
//{
//    public class AppDbContext : DbContext
//    {
//        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
//        {
//        }

//        // Users
//        public DbSet<User> Users { get; set; }

//        // Products
//        public DbSet<Product> Products { get; set; }
//        public DbSet<Category> Categories { get; set; }

//        // Orders
//        public DbSet<Order> Orders { get; set; }
//        public DbSet<OrderItem> OrderItems { get; set; }

//        // Shopping
//        public DbSet<Address> Addresses { get; set; }
//        public DbSet<ShoppingCart> ShoppingCart { get; set; }
//        public DbSet<Wishlist> Wishlist { get; set; }

//        // Special Features
//        public DbSet<ProductComparison> ProductComparisons { get; set; }
//        public DbSet<ChatHistory> ChatHistory { get; set; }

//        protected override void OnModelCreating(ModelBuilder modelBuilder)
//        {
//            base.OnModelCreating(modelBuilder);

//            // User configuration
//            modelBuilder.Entity<User>(entity =>
//            {
//                entity.HasIndex(u => u.Email)
//                      .IsUnique();

//                entity.Property(u => u.Email)
//                      .IsRequired()
//                      .HasMaxLength(100);

//                entity.Property(u => u.Name)
//                      .IsRequired()
//                      .HasMaxLength(100);

//                entity.Property(u => u.Role)
//                      .HasDefaultValue("Customer")
//                      .HasMaxLength(20);

//                entity.Property(u => u.CreatedAt)
//                      .HasDefaultValueSql("GETUTCDATE()");
//            });

//            // Category configuration
//            modelBuilder.Entity<Category>(entity =>
//            {
//                entity.HasIndex(c => c.Name)
//                      .IsUnique();

//                entity.Property(c => c.Name)
//                      .IsRequired()
//                      .HasMaxLength(100);

//                entity.Property(c => c.Description)
//                      .HasMaxLength(500);

//                // Self-referencing relationship for parent category
//                entity.HasOne(c => c.ParentCategory)
//                      .WithMany(c => c.SubCategories)
//                      .HasForeignKey(c => c.ParentCategoryId)
//                      .OnDelete(DeleteBehavior.Restrict);
//            });

//            // Product configuration
//            modelBuilder.Entity<Product>(entity =>
//            {
//                entity.Property(p => p.Name)
//                      .IsRequired()
//                      .HasMaxLength(200);

//                entity.Property(p => p.Price)
//                      .HasColumnType("decimal(18,2)");

//                entity.Property(p => p.Brand)
//                      .IsRequired()
//                      .HasMaxLength(100);

//                entity.Property(p => p.CreatedAt)
//                      .HasDefaultValueSql("GETUTCDATE()");

//                // Relationship with Category
//                entity.HasOne(p => p.Category)
//                      .WithMany(c => c.Products)
//                      .HasForeignKey(p => p.CategoryId)
//                      .OnDelete(DeleteBehavior.Restrict);
//            });

//            // Order configuration
//            modelBuilder.Entity<Order>(entity =>
//            {
//                entity.Property(o => o.Status)
//                      .HasDefaultValue("Pending")
//                      .HasMaxLength(50);

//                entity.Property(o => o.PaymentMethod)
//                      .IsRequired()
//                      .HasMaxLength(50);

//                entity.Property(o => o.PaymentStatus)
//                      .HasDefaultValue("Pending")
//                      .HasMaxLength(50);

//                entity.Property(o => o.TotalAmount)
//                      .HasColumnType("decimal(18,2)");

//                entity.Property(o => o.OrderDate)
//                      .HasDefaultValueSql("GETUTCDATE()");

//                // Relationship with User
//                entity.HasOne(o => o.User)
//                      .WithMany(u => u.Orders)
//                      .HasForeignKey(o => o.UserId)
//                      .OnDelete(DeleteBehavior.Cascade);
//            });

//            // OrderItem configuration
//            modelBuilder.Entity<OrderItem>(entity =>
//            {
//                entity.Property(oi => oi.Price)
//                      .HasColumnType("decimal(18,2)");

//                entity.Property(oi => oi.Quantity)
//                      .HasDefaultValue(1);

//                // Relationships
//                entity.HasOne(oi => oi.Order)
//                      .WithMany(o => o.OrderItems)
//                      .HasForeignKey(oi => oi.OrderId)
//                      .OnDelete(DeleteBehavior.Cascade);

//                entity.HasOne(oi => oi.Product)
//                      .WithMany(p => p.OrderItems)
//                      .HasForeignKey(oi => oi.ProductId)
//                      .OnDelete(DeleteBehavior.Restrict);
//            });

//            // Address configuration
//            modelBuilder.Entity<Address>(entity =>
//            {
//                entity.Property(a => a.Street)
//                      .IsRequired()
//                      .HasMaxLength(200);

//                entity.Property(a => a.City)
//                      .IsRequired()
//                      .HasMaxLength(100);

//                entity.Property(a => a.State)
//                      .IsRequired()
//                      .HasMaxLength(100);

//                entity.Property(a => a.ZipCode)
//                      .IsRequired()
//                      .HasMaxLength(20);

//                entity.Property(a => a.Country)
//                      .HasDefaultValue("USA")
//                      .HasMaxLength(100);

//                // Relationship with User
//                entity.HasOne(a => a.User)
//                      .WithMany(u => u.Addresses)
//                      .HasForeignKey(a => a.UserId)
//                      .OnDelete(DeleteBehavior.Cascade);
//            });

//            // ShoppingCart configuration
//            modelBuilder.Entity<ShoppingCart>(entity =>
//            {
//                entity.HasIndex(sc => new { sc.UserId, sc.ProductId })
//                      .IsUnique();

//                entity.Property(sc => sc.Quantity)
//                      .HasDefaultValue(1);

//                entity.Property(sc => sc.AddedAt)
//                      .HasDefaultValueSql("GETUTCDATE()");

//                // Relationships
//                entity.HasOne(sc => sc.User)
//                      .WithMany(u => u.CartItems)
//                      .HasForeignKey(sc => sc.UserId)
//                      .OnDelete(DeleteBehavior.Cascade);

//                entity.HasOne(sc => sc.Product)
//                      .WithMany()
//                      .HasForeignKey(sc => sc.ProductId)
//                      .OnDelete(DeleteBehavior.Cascade);
//            });

//            // Wishlist configuration
//            modelBuilder.Entity<Wishlist>(entity =>
//            {
//                entity.HasIndex(w => new { w.UserId, w.ProductId })
//                      .IsUnique();

//                entity.Property(w => w.AddedAt)
//                      .HasDefaultValueSql("GETUTCDATE()");

//                // Relationships
//                entity.HasOne(w => w.User)
//                      .WithMany(u => u.WishlistItems)
//                      .HasForeignKey(w => w.UserId)
//                      .OnDelete(DeleteBehavior.Cascade);

//                entity.HasOne(w => w.Product)
//                      .WithMany()
//                      .HasForeignKey(w => w.ProductId)
//                      .OnDelete(DeleteBehavior.Cascade);
//            });

//            // ProductComparison configuration
//            modelBuilder.Entity<ProductComparison>(entity =>
//            {
//                entity.HasIndex(pc => new { pc.UserId, pc.Product1Id, pc.Product2Id })
//                      .IsUnique();

//                entity.Property(pc => pc.ComparedAt)
//                      .HasDefaultValueSql("GETUTCDATE()");

//                // Relationships
//                entity.HasOne(pc => pc.User)
//                      .WithMany(u => u.Comparisons)
//                      .HasForeignKey(pc => pc.UserId)
//                      .OnDelete(DeleteBehavior.Cascade);

//                entity.HasOne(pc => pc.Product1)
//                      .WithMany()
//                      .HasForeignKey(pc => pc.Product1Id)
//                      .OnDelete(DeleteBehavior.Restrict);

//                entity.HasOne(pc => pc.Product2)
//                      .WithMany()
//                      .HasForeignKey(pc => pc.Product2Id)
//                      .OnDelete(DeleteBehavior.Restrict);
//            });

//            // ChatHistory configuration
//            modelBuilder.Entity<ChatHistory>(entity =>
//            {
//                entity.Property(ch => ch.Message)
//                      .IsRequired();

//                entity.Property(ch => ch.Timestamp)
//                      .HasDefaultValueSql("GETUTCDATE()");

//                entity.Property(ch => ch.Intent)
//                      .HasMaxLength(100);

//                // Relationship with User (optional)
//                entity.HasOne(ch => ch.User)
//                      .WithMany()
//                      .HasForeignKey(ch => ch.UserId)
//                      .OnDelete(DeleteBehavior.SetNull);
//            });
//        }

//        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
//        {
//            UpdateTimestamps();
//            return base.SaveChangesAsync(cancellationToken);
//        }

//        public override int SaveChanges()
//        {
//            UpdateTimestamps();
//            return base.SaveChanges();
//        }

//        private void UpdateTimestamps()
//        {
//            var entries = ChangeTracker.Entries()
//                .Where(e => e.Entity is BaseEntity &&
//                    (e.State == EntityState.Added || e.State == EntityState.Modified));

//            foreach (var entityEntry in entries)
//            {
//                ((BaseEntity)entityEntry.Entity).UpdatedAt = DateTime.UtcNow;

//                if (entityEntry.State == EntityState.Added)
//                {
//                    ((BaseEntity)entityEntry.Entity).CreatedAt = DateTime.UtcNow;
//                }
//            }
//        }
//    }

//    // Optional: Base entity class for common properties
//    public abstract class BaseEntity
//    {
//        public DateTime CreatedAt { get; set; }
//        public DateTime? UpdatedAt { get; set; }
//    }
//}

using Microsoft.EntityFrameworkCore;
using ElectronicsEcommerce.API.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace ElectronicsEcommerce.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Users
        public DbSet<User> Users => Set<User>();

        // Products
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Category> Categories => Set<Category>();

        // Orders
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();

        // Shopping
        public DbSet<Address> Addresses => Set<Address>();
        public DbSet<ShoppingCart> ShoppingCart => Set<ShoppingCart>();
        public DbSet<Wishlist> Wishlist => Set<Wishlist>();

        // Special Features
        public DbSet<ProductComparison> ProductComparisons => Set<ProductComparison>();
        public DbSet<ChatHistory> ChatHistory => Set<ChatHistory>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.Email).IsRequired().HasMaxLength(100);
                entity.Property(u => u.Name).IsRequired().HasMaxLength(100);
                entity.Property(u => u.Role).HasDefaultValue("Customer").HasMaxLength(20);
                entity.Property(u => u.CreatedAt).HasDefaultValueSql("GETDATE()");
            });

            // Category configuration
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasIndex(c => c.Name).IsUnique();
                entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
                entity.Property(c => c.Description).HasMaxLength(500);
                entity.HasOne(c => c.ParentCategory)
                      .WithMany(c => c.SubCategories)
                      .HasForeignKey(c => c.ParentCategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Product configuration
            modelBuilder.Entity<Product>(entity =>
            {
                entity.Property(p => p.Name).IsRequired().HasMaxLength(200);
                entity.Property(p => p.Price).HasColumnType("decimal(18,2)");
                entity.Property(p => p.Brand).IsRequired().HasMaxLength(100);
                entity.Property(p => p.CreatedAt).HasDefaultValueSql("GETDATE()");
                entity.HasOne(p => p.Category)
                      .WithMany(c => c.Products)
                      .HasForeignKey(p => p.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Order configuration
            modelBuilder.Entity<Order>(entity =>
            {
                entity.Property(o => o.Status).HasDefaultValue("Pending").HasMaxLength(50);
                entity.Property(o => o.PaymentMethod).IsRequired().HasMaxLength(50);
                entity.Property(o => o.PaymentStatus).HasDefaultValue("Pending").HasMaxLength(50);
                entity.Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");
                entity.Property(o => o.OrderDate).HasDefaultValueSql("GETDATE()");
                entity.HasOne(o => o.User)
                      .WithMany(u => u.Orders)
                      .HasForeignKey(o => o.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // OrderItem configuration
            modelBuilder.Entity<OrderItem>(entity =>
            {
                entity.Property(oi => oi.Price).HasColumnType("decimal(18,2)");
                entity.Property(oi => oi.Quantity).HasDefaultValue(1);
                entity.HasOne(oi => oi.Order)
                      .WithMany(o => o.OrderItems)
                      .HasForeignKey(oi => oi.OrderId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(oi => oi.Product)
                      .WithMany(p => p.OrderItems)
                      .HasForeignKey(oi => oi.ProductId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ShoppingCart configuration
            modelBuilder.Entity<ShoppingCart>(entity =>
            {
                entity.HasIndex(sc => new { sc.UserId, sc.ProductId }).IsUnique();
                entity.Property(sc => sc.Quantity).HasDefaultValue(1);
                entity.Property(sc => sc.AddedAt).HasDefaultValueSql("GETDATE()");
                entity.HasOne(sc => sc.User)
                      .WithMany(u => u.CartItems)
                      .HasForeignKey(sc => sc.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(sc => sc.Product)
                      .WithMany()
                      .HasForeignKey(sc => sc.ProductId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ProductComparison configuration
            modelBuilder.Entity<ProductComparison>(entity =>
            {
                entity.HasIndex(pc => new { pc.UserId, pc.Product1Id, pc.Product2Id }).IsUnique();
                entity.Property(pc => pc.ComparedAt).HasDefaultValueSql("GETDATE()");
                entity.HasOne(pc => pc.User)
                      .WithMany(u => u.Comparisons)
                      .HasForeignKey(pc => pc.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(pc => pc.Product1)
                      .WithMany()
                      .HasForeignKey(pc => pc.Product1Id)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(pc => pc.Product2)
                      .WithMany()
                      .HasForeignKey(pc => pc.Product2Id)
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}