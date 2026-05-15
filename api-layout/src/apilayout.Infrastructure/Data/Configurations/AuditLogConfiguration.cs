using apilayout.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace apilayout.Infrastructure.Data.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserEmail).IsRequired().HasMaxLength(300);
        builder.Property(x => x.EntityName).HasMaxLength(200);
        builder.Property(x => x.EntityId).HasMaxLength(100);
        builder.Property(x => x.IpAddress).HasMaxLength(45);
        builder.Property(x => x.Details).HasColumnType("text");

        builder.HasIndex(x => x.UserId);
        builder.HasIndex(x => x.Timestamp);
    }
}
