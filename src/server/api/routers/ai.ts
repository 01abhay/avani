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
      const [context, message] = [input.slice(-1), input.at(-1)!]
      const contextText = context
        .map(m => `${m.message} | action taken: ${m.action} | action data: ${JSON.stringify(m.actionData)}`)
        .join('\n')

      return await completion([
        {
          role: 'system',
          content: `here is the previous conversation history in order:

          ${contextText}`,
        },
        { role: message.role, content: message.message! },
      ])
    }),
})
