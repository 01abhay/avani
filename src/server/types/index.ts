import { type z } from 'zod'
import type messageSchema from '../schemas/zod/message'

export type Message = z.infer<typeof messageSchema>
