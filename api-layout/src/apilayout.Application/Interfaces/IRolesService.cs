using apilayout.Application.Common;
using apilayout.Application.DTOs.Roles;


namespace apilayout.Application.Interfaces;

public interface IRolesService
{
    Task<Result<List<RolesSelectDto>>> GetActiveRolesAsync(CancellationToken ct = default);

    Task<Result> CreateRoleAsync(CreateRoleDto dto, CancellationToken ct = default);    

    Task<Result<List<RoleListDto>>> GetAllRolesAsync(CancellationToken ct = default);
    
    Task<Result<RoleActivitiesResponse>> GetRoleActivitiesAsync(Guid roleId, CancellationToken ct = default);

    Task<Result> UpdatePermissionAsync(Guid roleId, UpdateRolePermissionDto dto, CancellationToken ct = default);

    Task<Result> UpdateRoleAsync(Guid roleId, UpdateRoleDto dto, CancellationToken ct = default);

    Task<Result> DeleteRoleAsync(Guid roleId, CancellationToken ct = default);
}