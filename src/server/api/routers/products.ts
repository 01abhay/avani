// import { z } from "zod";

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
// import { products } from "~/server/db/schema";

export const productRouter = createTRPCRouter({
  // create: publicProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     // simulate a slow db call
  //     await new Promise((resolve) => setTimeout(resolve, 1000));

  //     await ctx.db.insert(posts).values({
  //       name: input.name,
  //     });
  //   }),

  getTop10: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.products.findMany({
      // orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      limit: 25,
      columns: { id: true, images: true, name: true, price: true, rating: true },
    })
  }),
})
