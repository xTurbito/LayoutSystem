using apilayout.Application.Interfaces;
using apilayout.Domain.Entities;
using apilayout.Infrastructure.Data;

namespace apilayout.Infrastructure.Services;

public class AuditLogService(AppDbContext db) : IAuditLogService
{
    public async Task LogAsync(AuditLogEntry entry, CancellationToken ct = default)
    {
        var log = new AuditLog
        {
            UserId = entry.UserId,
            UserEmail = entry.UserEmail,
            Action = entry.Action,
            EntityName = entry.EntityName,
            EntityId = entry.EntityId,
            Details = entry.Details,
            IpAddress = entry.IpAddress
        };

        db.AuditLogs.Add(log);
        await db.SaveChangesAsync(ct);
    }
}
