using Microsoft.EntityFrameworkCore;
using AllureModa.API.Models;

namespace AllureModa.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Address> Addresses { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<ProductVariant> ProductVariants { get; set; }
        public DbSet<AllureModa.API.Models.Attribute> Attributes { get; set; }
        public DbSet<AttributeValue> AttributeValues { get; set; }
        public DbSet<ProductVariantAttributeValue> ProductVariantAttributeValues { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<WishlistItem> WishlistItems { get; set; }
        public DbSet<NewsletterSubscriber> NewsletterSubscribers { get; set; }
        
        // SaaS & Asaas
        public DbSet<Payment> Payments { get; set; }
        public DbSet<WebhookLog> WebhookLogs { get; set; }
        public DbSet<Coupon> Coupons { get; set; }

        // CMS
        public DbSet<PageConfig> PageConfigs { get; set; }
        public DbSet<PageBlock> PageBlocks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Enums as Strings for compatibility
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>();

            modelBuilder.Entity<Address>()
                .Property(a => a.Type)
                .HasConversion<string>();

            modelBuilder.Entity<Order>()
                .Property(o => o.Status)
                .HasConversion<string>();
            
            modelBuilder.Entity<Coupon>()
                .Property(c => c.Type)
                .HasConversion<string>();

            // Unique Indexes (mapped from Prisma @unique)
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
            
            modelBuilder.Entity<Coupon>()
                .HasIndex(c => c.Code)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Cpf)
                .IsUnique();

            modelBuilder.Entity<Category>()
                .HasIndex(c => c.Slug)
                .IsUnique();

            modelBuilder.Entity<Brand>()
                .HasIndex(b => b.Slug)
                .IsUnique();

            modelBuilder.Entity<Product>()
                .HasIndex(p => p.Slug)
                .IsUnique();

            modelBuilder.Entity<AllureModa.API.Models.Attribute>()
                .HasIndex(a => a.Name)
                .IsUnique();

            modelBuilder.Entity<AllureModa.API.Models.Attribute>()
                .HasIndex(a => a.Slug)
                .IsUnique();

            modelBuilder.Entity<ProductVariant>()
                .HasIndex(v => v.Sku)
                .IsUnique();

            // Composite Keys & Indexes
            modelBuilder.Entity<ProductVariantAttributeValue>()
                .HasKey(va => new { va.ProductVariantId, va.AttributeValueId });

            modelBuilder.Entity<CartItem>()
                .HasIndex(ci => new { ci.CartId, ci.ProductVariantId })
                .IsUnique();

            modelBuilder.Entity<Review>()
                .HasIndex(r => new { r.UserId, r.ProductId })
                .IsUnique();
            
            modelBuilder.Entity<WishlistItem>()
                .HasIndex(w => new { w.UserId, w.ProductId })
                .IsUnique();

            // Optimization Indexes (Requested in Plan)
            modelBuilder.Entity<User>()
                .HasIndex(u => u.CreatedAt);

            modelBuilder.Entity<Order>()
                .HasIndex(o => o.CreatedAt);

            // Payment Configuration
            modelBuilder.Entity<Payment>()
                .Property(p => p.Method).HasConversion<string>();
            modelBuilder.Entity<Payment>()
                .Property(p => p.Status).HasConversion<string>();
            modelBuilder.Entity<Payment>()
                .HasIndex(p => p.ExternalId); // Fast lookup by Asaas ID

            // Relationships
            modelBuilder.Entity<Order>()
                .HasOne(o => o.ShippingAddress)
                .WithMany(a => a.ShippingOrders)
                .HasForeignKey(o => o.ShippingAddressId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.BillingAddress)
                .WithMany(a => a.BillingOrders)
                .HasForeignKey(o => o.BillingAddressId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Category>()
                .HasOne(c => c.Parent)
                .WithMany(c => c.Children)
                .HasForeignKey(c => c.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            // CMS Configuration
            modelBuilder.Entity<PageConfig>()
                .HasIndex(p => new { p.PageSlug, p.IsDraft })
                .IsUnique();

            modelBuilder.Entity<PageBlock>()
                .Property(b => b.Type)
                .HasConversion<string>();

            modelBuilder.Entity<PageBlock>()
                .HasOne(b => b.PageConfig)
                .WithMany(p => p.Blocks)
                .HasForeignKey(b => b.PageConfigId)
                .OnDelete(DeleteBehavior.Cascade);

            // decimal precision
             foreach (var property in modelBuilder.Model.GetEntityTypes()
                .SelectMany(t => t.GetProperties())
                .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
            {
                property.SetColumnType("decimal(10, 2)");
            }
        }
    }
}
