using apilayout.Domain.Enums;

namespace apilayout.Application.Interfaces;

public record AuditLogEntry(
    AuditAction Action,
    string UserEmail,
    Guid? UserId = null,
    string? EntityName = null,
    string? EntityId = null,
    string? Details = null,
    string? IpAddress = null);

public interface IAuditLogService
{
    Task LogAsync(AuditLogEntry entry, CancellationToken ct = default);
}
