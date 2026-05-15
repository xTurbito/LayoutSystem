namespace apilayout.Application.Interfaces;

public interface ICurrentUserContext
{
    string? Email { get; }
    Guid? UserId { get; }
    string? IpAddress { get; }
}
