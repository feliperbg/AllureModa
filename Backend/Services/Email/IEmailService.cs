namespace AllureModa.API.Services.Email
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
        Task SendOrderCreatedAsync(Models.Order order, Models.User user);
        Task SendOrderPaidAsync(Models.Order order, Models.User user);
        Task SendWelcomeEmailAsync(Models.User user);
        Task SendPasswordResetAsync(Models.User user, string resetToken);
    }
}
