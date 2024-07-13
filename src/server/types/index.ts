import { type z } from 'zod'
import type messageSchema from '../schemas/zod/message'

export type Message = z.infer<typeof messageSchema>

// export type Message = {
//   id: number
//   role: 'assistant' | 'user'
//   message?: string
// } & (
//   | {
//       action?: 'LOADING'
//       actionData?: null
//     }
//   | {
//       action?: 'SUGGEST_PRODUCTS'
//       actionData?: { products: { id: string; title: string; featuredImage?: { url: string }; defaultVariantId: string }[] }
//     }
//   | {
//       action?: 'ADD_TO_CART'
//       actionData?: { productId?: string; variantId?: string }
//     }
// )
