import type { JWTPayload } from './jwt';

export type Env = {
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    user: JWTPayload;
  };
};
