import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { embeddings, completion } from '~/server/utils/openai'
import { getProductsBasedOnSimilarityScore } from '~/server/utils/db'
import messageSchema from '~/server/schemas/zod/message'

export const aiRouter = createTRPCRouter({
  getAiResponse: publicProcedure
    .input(z.object({ message: z.string().max(160), action: z.string().nullable() }))
    .output(messageSchema)
    .query(async ({ input }) => {
      const _embeddings = await embeddings([input.message])
      const embedding = _embeddings[0]!.embedding
      const _products = await getProductsBasedOnSimilarityScore(embedding)

      if (!_products.length) return { id: Math.random(), role: 'assistant', message: 'no product found!' }

      const resp = await completion({
        currentMessage: {
          role: 'system',
          content: `Here is the JSON of products found in vector search:
        ${JSON.stringify(_products)}

        based on user query recommend on ore more of these to the customer. do not list or describe products unless user asked,
        try to keep each products description under 30 words if replying with description.`,
        },
      })
      return {
        id: Math.random(),
        role: 'assistant',
        message: resp.choices[0]?.message.content ?? '',
        action: 'SUGGEST_PRODUCTS',
        actionData: { products: _products.map(({ description, ...p }) => p) },
      }
    }),
})
