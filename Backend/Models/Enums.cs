namespace AllureModa.API.Models
{
    public enum OrderStatus
    {
        PENDING,
        AWAITING_PAYMENT,
        PAID,
        PROCESSING,
        SHIPPED,
        DELIVERED,
        CANCELLED,
        REFUNDED
    }

    public enum Role
    {
        USER,
        ADMIN
    }

    public enum AddressType
    {
        SHIPPING,
        BILLING
    }
}
