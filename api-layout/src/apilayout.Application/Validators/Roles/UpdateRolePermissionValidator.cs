using apilayout.Application.DTOs.Roles;
using FluentValidation;

namespace apilayout.Application.Validators.Roles;

public class UpdateRolePermissionValidator : AbstractValidator<UpdateRolePermissionDto>
{
    public UpdateRolePermissionValidator()
    {
        RuleFor(x => x.ModuleId)
            .NotEmpty().WithMessage("El módulo es requerido.");

        // 0..31 = suma de todos los flags (View|Create|Edit|Delete|Export)
        RuleFor(x => x.Actions)
            .InclusiveBetween(0, 31).WithMessage("El valor de permisos no es válido.");
    }
}
