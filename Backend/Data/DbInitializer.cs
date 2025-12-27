using AllureModa.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AllureModa.API.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            Console.WriteLine("Applying Database Seeding...");

            var adminUser = context.Users.FirstOrDefault(u => u.Email == "admin@alluremoda.com");

            if (adminUser != null)
            {
                Console.WriteLine("Admin user exists. Updating password to ensure correctness...");
                adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("G0ncalves@");
                context.SaveChanges();
                Console.WriteLine("Admin password updated successfully.");
                return;
            }

            Console.WriteLine("Creating Admin user...");
            adminUser = new User
            {
                FirstName = "Admin",
                LastName = "User",
                Email = "admin@alluremoda.com",
                Phone = "11999999999",
                Role = Role.ADMIN,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("G0ncalves@"),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.Users.Add(adminUser);
            context.SaveChanges();
            Console.WriteLine("Admin user created successfully.");

            // Seed Homepage CMS Config
            SeedHomepageConfig(context);
        }

        private static void SeedHomepageConfig(ApplicationDbContext context)
        {
            var homepageExists = context.PageConfigs.Any(p => p.PageSlug == "homepage");
            if (homepageExists)
            {
                Console.WriteLine("Homepage config already exists.");
                return;
            }

            Console.WriteLine("Creating default homepage config...");

            // Create published version with default blocks
            var publishedConfig = new PageConfig
            {
                PageSlug = "homepage",
                IsDraft = false,
                Blocks = new List<PageBlock>
                {
                    new PageBlock
                    {
                        Type = BlockType.HeroBanner,
                        Order = 0,
                        ConfigJson = System.Text.Json.JsonSerializer.Serialize(new
                        {
                            imageUrl = "https://www.chanel.com/puls-img/c_limit,w_1920/q_auto:good,dpr_auto,f_auto/1761661153726-ww-homepage-corpo-one-desktop_1255x2880.png",
                            mobileImageUrl = "",
                            title = "Elegância que Desperta",
                            subtitle = "Descubra peças que causam impacto com qualidade premium.",
                            buttonText = "Conheça a Coleção",
                            buttonLink = "/products",
                            overlayOpacity = 0.2,
                            textColor = "#ffffff"
                        })
                    },
                    new PageBlock
                    {
                        Type = BlockType.FeaturedProducts,
                        Order = 1,
                        ConfigJson = System.Text.Json.JsonSerializer.Serialize(new
                        {
                            title = "Produtos em Destaque",
                            mode = "newest",
                            productIds = new string[] { },
                            limit = 4
                        })
                    },
                    new PageBlock
                    {
                        Type = BlockType.FeaturedProducts,
                        Order = 2,
                        ConfigJson = System.Text.Json.JsonSerializer.Serialize(new
                        {
                            title = "Produtos em Promoção",
                            mode = "promotional",
                            productIds = new string[] { },
                            limit = 4
                        })
                    }
                }
            };

            // Create draft version (copy of published)
            var draftConfig = new PageConfig
            {
                PageSlug = "homepage",
                IsDraft = true,
                Blocks = publishedConfig.Blocks.Select(b => new PageBlock
                {
                    Type = b.Type,
                    Order = b.Order,
                    ConfigJson = b.ConfigJson
                }).ToList()
            };

            context.PageConfigs.AddRange(publishedConfig, draftConfig);
            context.SaveChanges();
            Console.WriteLine("Homepage config created successfully.");
        }
    }
}
