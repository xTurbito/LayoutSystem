

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateProfileDto {
    name: string;
    email: string;
}