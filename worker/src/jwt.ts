import { SignJWT, jwtVerify } from 'jose';

export type JWTPayload = {
  sub: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
};

export async function signJwt(payload: JWTPayload, secret: string) {
  const key = new TextEncoder().encode(secret);
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function verifyJwt(token: string, secret: string) {
  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify<JWTPayload>(token, key);
  return payload;
}
