using apilayout.Application.DTOs.Users;
using apilayout.Application.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace apilayout.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController(IUserService userService) : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "Usuarios.View")]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null,
        CancellationToken ct = default)
    {
        var result = await userService.GetUsersAsync(page, pageSize, search, isActive, ct);
        return Ok(result.Value);
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "Usuarios.View")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct = default)
    {
        var result = await userService.GetUserByIdAsync(id, ct);
        if (!result.IsSuccess)
            return NotFound(new { message = result.Error });

        return Ok(result.Value);
    }

    [HttpPost]
    [Authorize(Policy = "Usuarios.Create")]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto, IValidator<CreateUserDto> validator, CancellationToken ct = default)
    {
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return BadRequest(new { message = string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)) });

        var result = await userService.CreateUserAsync(dto, ct);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error });

        return Ok();
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "Usuarios.Edit")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDto dto, IValidator<UpdateUserDto> validator, CancellationToken ct = default)
    {
        var validation = await validator.ValidateAsync(dto, ct);
        if (!validation.IsValid)
            return BadRequest(new { message = string.Join(", ", validation.Errors.Select(e => e.ErrorMessage)) });

        var result = await userService.UpdateUserAsync(id, dto, ct);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error });

        return NoContent();
    }

}