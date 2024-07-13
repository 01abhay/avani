import { z } from 'zod'

import { cosineDistance, l1Distance, l2Distance, desc, gt, inArray, sql } from 'drizzle-orm'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { embeddings, completion } from '~/server/utils/openai'
import { products, productDescriptionEmbeddings } from '~/server/db/schema'

export const aiRouter = createTRPCRouter({
  getProductSuggestion: publicProcedure.input(z.object({ message: z.string().min(1) })).query(async ({ input, ctx }) => {
    const _embeddings = await embeddings([input.message])
    const embedding = _embeddings[0]!.embedding
    const similarity1 = sql`1 - (${cosineDistance(productDescriptionEmbeddings.embedding, embedding)})`
    const similarity2 = sql`1 - (${l1Distance(productDescriptionEmbeddings.embedding, embedding)})`
    const similarity3 = sql`1 - (${l1Distance(productDescriptionEmbeddings.embedding, embedding)})`

    let productsIds = await ctx.db
      .select({
        productId: productDescriptionEmbeddings.productId,
        similarity: similarity1,
      })
      .from(productDescriptionEmbeddings)
      .where(gt(similarity1, 0.1))
      .orderBy(t => desc(t.similarity))
      .limit(4)
    if (!productsIds.length)
      productsIds = await ctx.db
        .select({
          productId: productDescriptionEmbeddings.productId,
          similarity: similarity2,
        })
        .from(productDescriptionEmbeddings)
        .where(gt(similarity2, 0.1))
        .orderBy(t => desc(t.similarity))
        .limit(4)
    if (!productsIds.length)
      productsIds = await ctx.db
        .select({
          productId: productDescriptionEmbeddings.productId,
          similarity: similarity3,
        })
        .from(productDescriptionEmbeddings)
        .where(gt(similarity3, 0.1))
        .orderBy(t => desc(t.similarity))
        .limit(4)
    if (!productsIds.length) return { content: 'no product found', products: [] }

    const _products = await ctx.db
      .select({
        id: products.id,
        description: products.description,
        name: products.name,
        images: products.images,
      })
      .from(products)
      .where(inArray(products.id, productsIds.map(p => p.productId!).filter(Boolean)))

    const resp = await completion({
      currentMessage: {
        role: 'system',
        content: `Here is the JSON of products found in vector search:
        ${JSON.stringify(_products)}

        based on user query recommend on ore more of these to the customer. do not list or describe products unless user asked,
        try to keep each products description under 30 words if replying with description.`,
      },
    })

    return { content: resp.choices[0]?.message.content, products: _products }
  }),
})
