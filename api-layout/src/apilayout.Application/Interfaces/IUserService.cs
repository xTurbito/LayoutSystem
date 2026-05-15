using apilayout.Application.Common;
using apilayout.Application.DTOs.Users;



namespace apilayout.Application.Interfaces;

public interface IUserService
{
    Task<Result<PagedResult<UserListDto>>> GetUsersAsync(int page, int pageSize, string? search = null, bool? isActive = null, CancellationToken ct = default);

    Task<Result> CreateUserAsync(CreateUserDto dto, CancellationToken ct = default);

    Task<Result<UserDetailDto>> GetUserByIdAsync(Guid id, CancellationToken ct = default);

    Task<Result> UpdateUserAsync(Guid id, UpdateUserDto dto, CancellationToken ct = default);

    Task<Result> UpdateProfileAsync(Guid id, UpdateProfileDto dto, CancellationToken ct = default);

    Task<Result> ChangePasswordAsync(Guid id, ChangePasswordDto dto, CancellationToken ct = default);

}