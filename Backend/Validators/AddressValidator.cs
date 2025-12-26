using FluentValidation;
using AllureModa.API.Models;

namespace AllureModa.API.Validators
{
    public class AddressValidator : AbstractValidator<Address>
    {
        public AddressValidator()
        {
            RuleFor(x => x.RecipientName).NotEmpty().WithMessage("Nome do destinatário é obrigatório");
            RuleFor(x => x.Street).NotEmpty().WithMessage("Rua é obrigatória");
            RuleFor(x => x.Number).NotEmpty().WithMessage("Número é obrigatório");
            RuleFor(x => x.Neighborhood).NotEmpty().WithMessage("Bairro é obrigatório");
            RuleFor(x => x.City).NotEmpty().WithMessage("Cidade é obrigatória");
            RuleFor(x => x.State).NotEmpty().Length(2).WithMessage("Estado deve ter 2 letras");
            RuleFor(x => x.PostalCode).NotEmpty().Matches(@"^\d{5}-?\d{3}$").WithMessage("CEP inválido");
        }
    }
}
