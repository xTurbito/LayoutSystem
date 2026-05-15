using apilayout.Domain.Entities;
using apilayout.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace apilayout.Infrastructure.Data.Configurations;

public class RoleModuleConfiguration : IEntityTypeConfiguration<RoleModule>
{
    public void Configure(EntityTypeBuilder<RoleModule> builder)
    {
        builder.HasKey(rm => new { rm.RoleId, rm.ModuleId });

        builder.Property(rm => rm.Actions)
            .IsRequired()
            .HasDefaultValue(ModuleAction.None);

        builder.HasOne(rm => rm.Role)
            .WithMany(r => r.RoleModules)
            .HasForeignKey(rm => rm.RoleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(rm => rm.Module)
            .WithMany(m => m.RoleModules)
            .HasForeignKey(rm => rm.ModuleId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
