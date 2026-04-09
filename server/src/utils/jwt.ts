import jwt, { JwtPayload } from 'jsonwebtoken';

import { env } from '../config/env';

export interface AccessTokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
  const expiresIn = env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'];

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn,
  });
};

export const verifyAccessToken = (token: string): JwtPayload | string => {
  return jwt.verify(token, env.JWT_SECRET);
};
