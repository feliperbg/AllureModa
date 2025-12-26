using MailKit.Net.Smtp;
using MimeKit;

namespace AllureModa.API.Services.Email
{
    public class SmtpEmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<SmtpEmailService> _logger;

        public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var emailSettings = _configuration.GetSection("Email");
            var host = emailSettings["SmtpHost"];
            var port = int.Parse(emailSettings["SmtpPort"] ?? "587");
            var user = emailSettings["SmtpUser"];
            var pass = emailSettings["SmtpPass"]; // In prod this should come from UserSecrets/Env
            var fromEmail = emailSettings["FromEmail"];
            var fromName = emailSettings["FromName"];

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;

            message.Body = new TextPart("html")
            {
                Text = body
            };

            using var client = new SmtpClient();
            try
            {
                await client.ConnectAsync(host, port, MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(user, pass);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
                _logger.LogInformation($"Email sent to {to} with subject {subject}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email to {to}");
                throw; // Re-throw to allow Retry policies (Hangfire) to work
            }
        }
        public async Task SendOrderCreatedAsync(Models.Order order, Models.User user)
        {
            var subject = $"Pedido #{order.OrderNumber} Recebido - AllureModa";
            var body = $@"
                <h1>Olá {user.FirstName},</h1>
                <p>Recebemos seu pedido <strong>#{order.OrderNumber}</strong> com sucesso!</p>
                <p>Status atual: <strong>Aguardando Pagamento</strong></p>
                <p>Total: R$ {order.TotalPrice:N2}</p>
                <hr />
                <p>Assim que o pagamento for confirmado, enviaremos outra notificação.</p>
                <p>Obrigado por comprar na AllureModa!</p>
            ";

            await SendEmailAsync(user.Email, subject, body);
        }

        public async Task SendOrderPaidAsync(Models.Order order, Models.User user)
        {
            var subject = $"Pagamento Confirmado - Pedido #{order.OrderNumber} - AllureModa";
            var body = $@"
                <h1>Pagamento Aprovado!</h1>
                <p>Olá {user.FirstName},</p>
                <p>O pagamento do seu pedido <strong>#{order.OrderNumber}</strong> foi confirmado.</p>
                <p>Agora vamos separar seus produtos e enviá-los o mais rápido possível.</p>
                <hr />
                <p>Você pode acompanhar o status do pedido em 'Minha Conta'.</p>
                <p>Obrigado por comprar na AllureModa!</p>
            ";

            await SendEmailAsync(user.Email, subject, body);
        }

        public async Task SendWelcomeEmailAsync(Models.User user)
        {
            var subject = "Bem-vindo(a) à AllureModa!";
            var body = $@"
                <h1>Olá {user.FirstName},</h1>
                <p>Seja muito bem-vindo(a) à <strong>AllureModa</strong>!</p>
                <p>Estamos felizes em ter você conosco.</p>
                <p>Aproveite nossas ofertas exclusivas e as últimas tendências da moda.</p>
                <hr />
                <p>Qualquer dúvida, entre em contato conosco.</p>
                <p>Atenciosamente,<br/>Equipe AllureModa</p>
            ";

            await SendEmailAsync(user.Email, subject, body);
        }

        public async Task SendPasswordResetAsync(Models.User user, string resetToken)
        {
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
            var resetLink = $"{frontendUrl}/reset-password?token={resetToken}&email={user.Email}";

            var subject = "Redefinição de Senha - AllureModa";
            var body = $@"
                <h1>Recuperação de Senha</h1>
                <p>Olá {user.FirstName},</p>
                <p>Recebemos uma solicitação para redefinir sua senha.</p>
                <p>Clique no link abaixo para criar uma nova senha:</p>
                <p><a href='{resetLink}' style='background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none;'>Redefinir Senha</a></p>
                <p>Ou copie e cole este link no seu navegador:</p>
                <p>{resetLink}</p>
                <p>Este link expira em 1 hora.</p>
                <hr />
                <p>Se você não solicitou isso, ignore este email.</p>
            ";

            await SendEmailAsync(user.Email, subject, body);
        }
    }
}
