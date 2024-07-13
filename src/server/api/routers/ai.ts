import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import messageSchema from '~/server/schemas/zod/message'
import { completion } from '~/server/utils/RAG'

export const aiRouter = createTRPCRouter({
  getAiResponse: publicProcedure
    .input(z.object({ message: z.string().max(160), action: z.string().optional() }))
    .output(messageSchema)
    .query(async ({ input }) => {
      return await completion([{ role: 'user', content: input.message }])
    }),
})
