using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AllureModa.API.Models
{
    public enum PaymentMethod
    {
        PIX,
        CREDIT_CARD,
        BOLETO
    }

    public enum PaymentStatus
    {
        PENDING,
        RECEIVED,
        CONFIRMED,
        OVERDUE,
        REFUNDED,
        RECEIVED_IN_CASH,
        REFUND_REQUESTED,
        CHARGEBACK_REQUESTED,
        CHARGEBACK_DISPUTE,
        AWAITING_CHARGEBACK_REVERSAL,
        DUNNING_REQUESTED,
        DUNNING_RECEIVED,
        AWAITING_RISK_ANALYSIS
    }

    public class Payment
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public required string OrderId { get; set; }
        public Order? Order { get; set; }

        public string? ExternalId { get; set; } // Asaas Payment ID

        public PaymentMethod Method { get; set; }
        public PaymentStatus Status { get; set; } = PaymentStatus.PENDING;

        [Column(TypeName = "decimal(10, 2)")]
        public decimal Value { get; set; }

        public string? InvoiceUrl { get; set; }
        public string? BankSlipUrl { get; set; } // URL do boleto
        public string? PixQrCode { get; set; } 
        public string? PixCopyPaste { get; set; }

        public DateTime? DueDate { get; set; }
        public DateTime? PaymentDate { get; set; }

        public string? GatewayResponse { get; set; } // JSON response backup

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // SaaS
        public string TenantId { get; set; } = "default";
    }
}
