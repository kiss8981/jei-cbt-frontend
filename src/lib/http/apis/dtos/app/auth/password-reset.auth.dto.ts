export interface RequestPasswordResetAuthAppDto {
  phone: string;
}

export interface VerifyPasswordResetAuthAppDto {
  phone: string;
  code: string;
}

export interface VerifyPasswordResetResponseAuthAppDto {
  resetToken: string;
}

export interface CompletePasswordResetAuthAppDto {
  resetToken: string;
  password: string;
  passwordConfirmation: string;
}
