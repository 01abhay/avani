import { z } from 'zod'

const loadingActionDataSchema = z.object({
  action: z.literal('LOADING').optional(),
  actionData: z.null().optional(),
})

const suggestProductsActionDataSchema = z.object({
  action: z.literal('SUGGEST_PRODUCTS').optional(),
  actionData: z
    .object({
      products: z.array(
        z.object({
          id: z.string(),
          name: z.string().nullable(),
          images: z.array(z.string()).nullable(),
          price: z.string().nullable(),
        }),
      ),
    })
    .optional(),
})

const addToCartActionDataSchema = z.object({
  action: z.literal('ADD_TO_CART').optional(),
  actionData: z
    .object({
      productId: z.string().optional(),
      variantId: z.string().optional(),
    })
    .optional(),
})

const messageBaseSchema = z.object({
  id: z.number(),
  role: z.union([z.literal('assistant'), z.literal('user')]),
  message: z.string().optional(),
})

const messageSchema = z.union([
  messageBaseSchema.merge(loadingActionDataSchema),
  messageBaseSchema.merge(suggestProductsActionDataSchema),
  messageBaseSchema.merge(addToCartActionDataSchema),
])

export default messageSchema
