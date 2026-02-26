export interface JwtPayload {
  sub: string; // user id
  email: string;
  userType: string;
  iat?: number;
  exp?: number;
}
