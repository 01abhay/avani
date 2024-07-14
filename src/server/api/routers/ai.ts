import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import messageSchema from '~/server/schemas/zod/message'
import { completion } from '~/server/utils/RAG'

export const aiRouter = createTRPCRouter({
  getAiResponse: publicProcedure
    // .input(z.object({ message: z.string().max(160), action: z.string().optional() }))
    .input(z.array(messageSchema))
    .output(messageSchema)
    .query(async ({ input }) => {
      return await completion(
        input.map(m => ({ role: m.role, content: JSON.stringify({ message: m.message, action: m.action, actionData: m.actionData }) })),
      )
    }),
})
