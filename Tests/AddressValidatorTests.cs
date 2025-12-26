using Xunit;
using FluentValidation.TestHelper;
using AllureModa.API.Validators;
using AllureModa.API.Models;

namespace AllureModa.Tests
{
    public class AddressValidatorTests
    {
        private readonly AddressValidator _validator = new AddressValidator();

        [Fact]
        public void Should_Have_Error_When_RecipientName_Is_Empty()
        {
            var model = new Address { RecipientName = "", UserId = "1", Street = "Rua", Number = "1", City = "City", State = "SP", PostalCode = "12345-678", Country = "BR" };
            var result = _validator.TestValidate(model);
            result.ShouldHaveValidationErrorFor(person => person.RecipientName);
        }

        [Fact]
        public void Should_Not_Have_Error_When_Address_Is_Valid()
        {
            var model = new Address
            {
                RecipientName = "Felipe",
                Street = "Rua Teste",
                Number = "123",
                Neighborhood = "Centro",
                City = "São Paulo",
                State = "SP",
                PostalCode = "12345-678",
                UserId = "user1",
                Country = "BR"
            };
            var result = _validator.TestValidate(model);
            result.ShouldNotHaveValidationErrorFor(person => person.RecipientName);
            result.ShouldNotHaveValidationErrorFor(person => person.PostalCode);
        }

        [Fact]
        public void Should_Have_Error_When_PostalCode_Is_Invalid()
        {
             var model = new Address { PostalCode = "invalid", Street = "Rua", Number = "1", City = "City", State = "SP", Country = "BR", UserId = "1" };
             var result = _validator.TestValidate(model);
             result.ShouldHaveValidationErrorFor(x => x.PostalCode);
        }
    }
}
