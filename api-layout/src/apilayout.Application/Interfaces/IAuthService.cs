using apilayout.Application.Common;
using apilayout.Application.DTOs.Auth;

namespace apilayout.Application.Interfaces;

public interface IAuthService
{
    Task<Result<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<Result<LoginResponse>> RefreshAsync(string refreshToken, CancellationToken ct = default);
    Task<Result> LogoutAsync(string refreshToken, CancellationToken ct = default);
}
