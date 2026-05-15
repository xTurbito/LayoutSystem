using apilayout.Application.DTOs.Users;
using FluentValidation;

namespace apilayout.Application.Validators.Users;

public class UpdateUserValidator : AbstractValidator<UpdateUserDto>
{
    public UpdateUserValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre es requerido.")
            .MaximumLength(100).WithMessage("El nombre no puede superar 100 caracteres.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El correo es requerido.")
            .EmailAddress().WithMessage("El correo no tiene un formato válido.")
            .MaximumLength(150).WithMessage("El correo no puede superar 150 caracteres.");

        RuleFor(x => x.RoleId)
            .NotEmpty().WithMessage("El rol es requerido.");

        RuleFor(x => x.Password)
            .MinimumLength(8).WithMessage("La contraseña debe tener al menos 8 caracteres.")
            .Matches("[A-Z]").WithMessage("La contraseña debe tener al menos una letra mayúscula.")
            .Matches("[0-9]").WithMessage("La contraseña debe tener al menos un número.")
            .Matches("[^a-zA-Z0-9]").WithMessage("La contraseña debe tener al menos un carácter especial.")
            .When(x => !string.IsNullOrEmpty(x.Password));
    }
}
