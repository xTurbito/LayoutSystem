using apilayout.Application.DTOs.Auth;
using apilayout.Application.DTOs.Users;
using apilayout.Application.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace apilayout.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService, IUserService userService, ICurrentUserContext currentUserContext) : ControllerBase
{
    [EnableRateLimiting("login")]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await authService.LoginAsync(request, ct);

        if (!result.IsSuccess)
            return Unauthorized(new { message = result.Error, code = result.ErrorCode });

        var data = result.Value!;
        SetRefreshTokenCookie(data.RefreshToken, data.RefreshTokenExpiresAt);
        return Ok(new { data.Token, data.ExpiresAt, data.UserId, data.Name, data.Email, data.Role, data.Modules });
    }

    [EnableRateLimiting("refresh")]
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(CancellationToken ct)
    {
        var refreshToken = Request.Cookies["refresh_token"];
        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized(new { message = "Sesión expirada.", code = "REFRESH_TOKEN_MISSING" });

        var result = await authService.RefreshAsync(refreshToken, ct);

        if (!result.IsSuccess)
            return Unauthorized(new { message = result.Error, code = result.ErrorCode });

        var data = result.Value!;
        SetRefreshTokenCookie(data.RefreshToken, data.RefreshTokenExpiresAt);
        return Ok(new { data.Token, data.ExpiresAt });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var refreshToken = Request.Cookies["refresh_token"];
        if (!string.IsNullOrEmpty(refreshToken))
            await authService.LogoutAsync(refreshToken, ct);

        Response.Cookies.Delete("refresh_token");
        return NoContent();
    }

    private void SetRefreshTokenCookie(string token, DateTime expires)
    {
        Response.Cookies.Append("refresh_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = expires,
            Path = "/"
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var result = await userService.GetUserByIdAsync(currentUserContext.UserId!.Value, ct);

        if(!result.IsSuccess)
            return NotFound();

        return Ok(result.Value);
    }

    [HttpPatch("me")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto, IValidator<UpdateProfileDto> validator, CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return BadRequest(new { message = string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)) });

        var result = await userService.UpdateProfileAsync(currentUserContext.UserId!.Value, dto, ct);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error });

        return NoContent();
    }

    [HttpPatch("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto, IValidator<ChangePasswordDto> validator, CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return BadRequest(new { message = string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)) });

        var result = await userService.ChangePasswordAsync(currentUserContext.UserId!.Value, dto, ct);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error });

        return NoContent();
    }
}
