// import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { processShopData } from "~/server/utils/storeDataProcessor";
// import { posts } from "~/server/db/schema";

export const utilsRouter = createTRPCRouter({
  seedDB: publicProcedure
    // .input(z.object({ text: z.string() }))
    .query(async ({}) => {
      return await processShopData();
    }),
});
