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
        }
    }
}
