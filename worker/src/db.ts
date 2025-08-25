import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

// In Workers, keep a single global instance across requests
let prismaInstance: PrismaClient | undefined;

export const getPrisma = (databaseUrl: string): PrismaClient => {
  if (!prismaInstance) {
    // Cast because $extends returns a proxied client compatible with PrismaClient
    prismaInstance = (new PrismaClient({ datasourceUrl: databaseUrl }).$extends(withAccelerate()) as unknown) as PrismaClient;
  }
  return prismaInstance;
};
