import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

function decodeToken(token: string): { sub: string; email: string } | null {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const CreateChatSchema = z.object({
  title: z.string().optional().default('New Sourcing Request'),
  messages: z.array(z.any()).optional().default([]),
});

const UpdateChatSchema = z.object({
  title: z.string().optional(),
  status: z.string().optional(),
  messages: z.array(z.any()).optional(),
  trackingCode: z.string().optional(),
});

export async function chatRoutes(fastify: FastifyInstance) {
  // Helper to extract studentId from token
  const getStudentFromRequest = async (request: any, reply: any) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        reply.status(401).send({ error: 'Authentication required' });
        return null;
      }
      const token = authHeader.split(' ')[1];
      const decoded = decodeToken(token);
      if (!decoded || !decoded.sub) {
        reply.status(401).send({ error: 'Invalid or expired token' });
        return null;
      }
      const student = await prisma.studentUser.findUnique({ where: { id: decoded.sub } });
      if (!student) {
        reply.status(401).send({ error: 'Student not found' });
        return null;
      }
      return student;
    } catch {
      reply.status(401).send({ error: 'Invalid authentication' });
      return null;
    }
  };

  // 1. List student's chat sessions
  fastify.get('/api/v1/chats', async (request, reply) => {
    const student = await getStudentFromRequest(request, reply);
    if (!student) return;

    const sessions = await prisma.chatSession.findMany({
      where: { studentId: student.id },
      orderBy: { updatedAt: 'desc' },
    });

    const requests = await prisma.buyerRequest.findMany({
      where: { studentId: student.id },
      include: {
        offers: {
          where: { isPublishedToBuyer: true },
        },
      },
    });

    const reqByChatId = new Map<string, typeof requests[0]>();
    const reqByTracking = new Map<string, typeof requests[0]>();

    for (const r of requests) {
      if (r.chatSessionId) {
        reqByChatId.set(r.chatSessionId, r);
      }
      if (r.trackingCode) {
        reqByTracking.set(r.trackingCode, r);
      }
    }

    return reply.send({
      chats: sessions.map((s) => {
        const linkedReq = reqByChatId.get(s.id) || (s.trackingCode ? reqByTracking.get(s.trackingCode) : null);
        const isLinked = Boolean(linkedReq);
        const offersCount = linkedReq?.offers?.length ?? 0;
        const reqStatus = linkedReq?.status ?? s.status;

        return {
          id: s.id,
          title: s.title,
          trackingCode: s.trackingCode || linkedReq?.trackingCode || (linkedReq ? `#${linkedReq.publicToken}` : null),
          publicToken: linkedReq?.publicToken ?? null,
          status: reqStatus,
          offersCount,
          isLocked: isLinked,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        };
      }),
    });
  });

  // 2. Create a new chat session
  fastify.post('/api/v1/chats', async (request, reply) => {
    const student = await getStudentFromRequest(request, reply);
    if (!student) return;

    const parseResult = CreateChatSchema.safeParse(request.body || {});
    const { title, messages } = parseResult.success ? parseResult.data : { title: 'New Sourcing Request', messages: [] };

    const session = await prisma.chatSession.create({
      data: {
        studentId: student.id,
        title,
        status: 'DRAFT',
        messages,
      },
    });

    return reply.status(201).send({
      chat: {
        id: session.id,
        title: session.title,
        status: session.status,
        messages: session.messages,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  });

  // 3. Get specific chat session with full history & offers
  fastify.get('/api/v1/chats/:id', async (request, reply) => {
    const student = await getStudentFromRequest(request, reply);
    if (!student) return;

    const { id } = request.params as { id: string };
    const session = await prisma.chatSession.findUnique({
      where: { id },
    });

    if (!session) {
      return reply.status(404).send({ error: 'Chat session not found' });
    }

    if (session.studentId !== student.id) {
      return reply.status(403).send({ error: 'Unauthorized' });
    }

    const linkedReq = await prisma.buyerRequest.findFirst({
      where: {
        OR: [
          { chatSessionId: session.id },
          ...(session.trackingCode ? [{ trackingCode: session.trackingCode }] : []),
        ],
      },
      include: {
        offers: {
          where: { isPublishedToBuyer: true },
          include: {
            seller: {
              select: { businessName: true, rating: true, completedDeals: true },
            },
          },
        },
      },
    });

    return reply.send({
      chat: {
        id: session.id,
        title: session.title,
        trackingCode: session.trackingCode || linkedReq?.trackingCode || null,
        publicToken: linkedReq?.publicToken ?? null,
        status: linkedReq?.status ?? session.status,
        messages: session.messages,
        buyerRequest: linkedReq,
        isLocked: Boolean(linkedReq),
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
    });
  });

  // 4. Update chat messages or title
  fastify.put('/api/v1/chats/:id', async (request, reply) => {
    const student = await getStudentFromRequest(request, reply);
    if (!student) return;

    const { id } = request.params as { id: string };
    const session = await prisma.chatSession.findUnique({ where: { id } });

    if (!session) {
      return reply.status(404).send({ error: 'Chat session not found' });
    }
    if (session.studentId !== student.id) {
      return reply.status(403).send({ error: 'Unauthorized' });
    }

    const parseResult = UpdateChatSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Validation failed', details: parseResult.error.errors });
    }

    const updated = await prisma.chatSession.update({
      where: { id },
      data: {
        title: parseResult.data.title ?? undefined,
        status: parseResult.data.status ?? undefined,
        messages: parseResult.data.messages !== undefined ? parseResult.data.messages : undefined,
        trackingCode: parseResult.data.trackingCode ?? undefined,
      },
    });

    return reply.send({ chat: updated });
  });

  // 5. Delete draft chat (Guardrail: Cannot delete chats tied to requests/orders)
  fastify.delete('/api/v1/chats/:id', async (request, reply) => {
    const student = await getStudentFromRequest(request, reply);
    if (!student) return;

    const { id } = request.params as { id: string };
    const session = await prisma.chatSession.findUnique({ where: { id } });

    if (!session) {
      return reply.status(404).send({ error: 'Chat session not found' });
    }
    if (session.studentId !== student.id) {
      return reply.status(403).send({ error: 'Unauthorized' });
    }

    // STRICT GUARDRAIL: Cannot delete if tied to active request or order
    const linkedReq = await prisma.buyerRequest.findFirst({
      where: {
        OR: [
          { chatSessionId: session.id },
          ...(session.trackingCode ? [{ trackingCode: session.trackingCode }] : []),
        ],
      },
    });

    if (linkedReq) {
      return reply.status(400).send({
        error: 'Cannot delete a chat tied to an active order or sourcing request.',
      });
    }

    await prisma.chatSession.delete({ where: { id } });

    return reply.send({ success: true, message: 'Draft chat removed.' });
  });
}
