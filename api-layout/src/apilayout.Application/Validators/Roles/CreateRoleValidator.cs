using apilayout.Application.DTOs.Roles;
using FluentValidation;

namespace apilayout.Application.Validators.Roles;

public class CreateRoleValidator : AbstractValidator<CreateRoleDto>
{
    public CreateRoleValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre del rol es requerido.")
            .MaximumLength(50).WithMessage("El nombre no puede superar 50 caracteres.");
    }
}
