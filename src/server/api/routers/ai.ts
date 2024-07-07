import { z } from 'zod'

import { cosineDistance, desc, gt, inArray, sql } from 'drizzle-orm'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { embeddings, completion } from '~/server/utils/openai'
import { products, productDescriptionEmbeddings } from '~/server/db/schema'

export const aiRouter = createTRPCRouter({
  // hello: publicProcedure
  //   .input(z.object({ text: z.string() }))
  //   .query(({ input }) => {
  //     return {
  //       greeting: `Hello ${input.text}`,
  //     };
  //   }),

  // create: publicProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     // simulate a slow db call
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     await ctx.db.insert(posts).values({
  //       name: input.name,
  //     });
  //   }),

  getProductSuggestion: publicProcedure.input(z.object({ message: z.string().min(1) })).query(async ({ ctx }) => {
    const _embeddings = await embeddings(['Squalene product'])
    const embedding = _embeddings[0]!.embedding
    const similarity = sql`1 - (${cosineDistance(productDescriptionEmbeddings.embedding, embedding)})`

    const productsIds = await ctx.db
      .select({
        productId: productDescriptionEmbeddings.productId,
        similarity,
      })
      .from(productDescriptionEmbeddings)
      .where(gt(similarity, 0.5))
      .orderBy(t => desc(t.similarity))
      .limit(4)

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
