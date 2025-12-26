namespace AllureModa.API.DTOs
{
    public class CheckoutRequestDto
    {
        public required string ShippingAddressId { get; set; }
        public string? BillingAddressId { get; set; }
        public decimal ShippingCost { get; set; }
        public Models.PaymentMethod PaymentMethod { get; set; }
        public string? CreditCardToken { get; set; }
        
        // For direct credit card processing (Server-Side)
        public CreditCardDto? CreditCard { get; set; }
    }

    public class CreditCardDto
    {
        public required string HolderName { get; set; }
        public required string Number { get; set; }
        public required string ExpiryMonth { get; set; }
        public required string ExpiryYear { get; set; }
        public required string Ccv { get; set; }
    }

    public class CheckoutResponseDto
    {
        public required string OrderId { get; set; }
        public required string OrderNumber { get; set; }
        public string? PaymentId { get; set; }
        public required string PaymentMethod { get; set; }
        public string? PixQrCode { get; set; }
        public string? PixCopyPaste { get; set; }
        public string? BoletoUrl { get; set; }
        public decimal Subtotal { get; set; }
        public decimal ShippingCost { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
