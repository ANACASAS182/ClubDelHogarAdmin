export interface PasswordResetDTO {
  newPassword: string;
  confirmNewPassword: string;
  token: string;
}