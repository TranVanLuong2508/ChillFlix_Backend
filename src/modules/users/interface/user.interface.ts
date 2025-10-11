export interface IUser {
  userId: number;
  email: string;
  password: string;
  fullName: string;
  isActive: boolean;
  roleId: number;
  genderCode: string;
  isVip: boolean;
  statusCode: string;
  refreshToken: string;
}
