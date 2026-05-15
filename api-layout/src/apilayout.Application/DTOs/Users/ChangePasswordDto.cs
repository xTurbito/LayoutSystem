namespace apilayout.Application.DTOs.Users;


public class ChangePasswordDto
{
    public required string NewPassword {get; set;}
    public required string CurrentPassword {get; set;}
}