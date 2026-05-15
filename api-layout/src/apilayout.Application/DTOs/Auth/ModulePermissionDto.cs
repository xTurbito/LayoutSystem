namespace apilayout.Application.DTOs.Auth;

public record ModulePermissionDto(
    string Name,
    string? Icon,
    string? Route,
    int Order,
    string[] Actions);
