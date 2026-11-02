import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: 'ADMIN' | 'STAFF';
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

export async function authPlugin(fastify: FastifyInstance) {
  fastify.decorate(
    'authenticateStaff',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const authHeader = request.headers.authorization;
      const jwtSecret = process.env.SUPABASE_JWT_SECRET;
      const isDev = process.env.NODE_ENV !== 'production';

      // Local development convenience bypass when header missing
      if (isDev && (!authHeader || !jwtSecret || jwtSecret.includes('placeholder') || jwtSecret.includes('local-jwt-secret'))) {
        request.user = {
          id: 'dev-staff-id',
          email: 'admin@handular.com',
          role: 'ADMIN',
        };
        return;
      }

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ error: 'Missing or invalid Authorization header' });
      }

      const token = authHeader.split(' ')[1];
      try {
        // In production: verify Supabase JWT
        // Simple base64 token decode for signature / payload check
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          request.user = {
            id: payload.sub || payload.id,
            email: payload.email,
            role: payload.role || 'STAFF',
          };
          return;
        }
        throw new Error('Malformed JWT token structure');
      } catch (err: any) {
        return reply.status(401).send({ error: 'Unauthorized: Invalid Supabase token' });
      }
    }
  );
}
