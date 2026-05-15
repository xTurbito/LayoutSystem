using apilayout.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using apilayout.Application.DTOs.Roles;


namespace apilayout.Api.Controllers;

[ApiController]
[Route("api/roles")]
[Authorize]
public class RolesController(IRolesService rolesService) : ControllerBase
{
    [HttpGet("list")]
    public async Task<IActionResult> GetActiveRoles(CancellationToken ct = default)
    {
        var result = await rolesService.GetActiveRolesAsync(ct);
        return Ok(result.Value);
    }

    [HttpGet]
    [Authorize(Policy = "Roles.View")]
    public async Task<IActionResult> GetAll(CancellationToken ct = default)
    {
        var result = await rolesService.GetAllRolesAsync(ct);
        return Ok(result.Value);
    }

    [HttpPost]
    [Authorize(Policy = "Roles.Create")]
    public async Task<IActionResult> Create([FromBody] CreateRoleDto dto, CancellationToken ct = default)
    {
        var result = await rolesService.CreateRoleAsync(dto, ct);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error });

        return Ok();
    }

    [HttpGet("{id}/activities")]
    [Authorize(Policy = "Roles.View")]
    public async Task<IActionResult> GetActivities(Guid id, CancellationToken ct = default)
    {
        var result = await rolesService.GetRoleActivitiesAsync(id, ct);
        if (!result.IsSuccess)
            return NotFound(new { message = result.Error });

        return Ok(result.Value);
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "Roles.Edit")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRoleDto dto, CancellationToken ct = default)
    {
        var result = await rolesService.UpdateRoleAsync(id, dto, ct);
        if (!result.IsSuccess) return BadRequest(new { message = result.Error });
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "Roles.Delete")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct = default)
    {
        var result = await rolesService.DeleteRoleAsync(id, ct);
        if (!result.IsSuccess) return BadRequest(new { message = result.Error });
        return NoContent();
    }

    [HttpPatch("{id}/permissions")]
    [Authorize(Policy = "Roles.Edit")]
    public async Task<IActionResult> UpdatePermission(Guid id, [FromBody] UpdateRolePermissionDto dto, CancellationToken ct = default)
    {
        var result = await rolesService.UpdatePermissionAsync(id, dto, ct);
        if (!result.IsSuccess)
            return BadRequest(new { message = result.Error });

        return NoContent();
    }

}

