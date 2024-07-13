import OpenAI from 'openai'

import { type Message } from '../types'
import { embeddings, completion as _completion } from './openai'
import { getProductsBasedOnSimilarityScore } from './db'

const openai = new OpenAI()

type Functions = Record<string, (payload?: unknown) => Promise<Message>>
const functions: Functions = {
//   greeting: async () => ({ id: Math.random(), role: 'assistant', message: 'Hello from greeting intent!' }) as const,
  search_products: async _payload => {
    const payload = _payload as { query: string }
    const _embeddings = await embeddings([payload.query])
    const embedding = _embeddings[0]!.embedding
    const _products = await getProductsBasedOnSimilarityScore(embedding)

    if (!_products.length) return { id: Math.random(), role: 'assistant', message: 'no product found!' }

    const resp = await _completion([
      {
        role: 'system',
        content: `Here is the JSON of products found in vector search:
        ${JSON.stringify(_products)}

        ---- based on user query recommend on ore more of these to the customer. do not list or describe products unless user asked,
        try to keep each products description under 30 words if replying with description.`,
      },
    ])
    return {
      id: Math.random(),
      role: 'assistant',
      message: resp.choices[0]?.message.content ?? '',
      action: 'SUGGEST_PRODUCTS',
      actionData: { products: _products.map(({ description: _ignore, ...p }) => p) },
    }
  },
}

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  //   {
  //     type: 'function',
  //     function: {
  //       name: 'greeting',
  //       description: 'Replies user with greeting.',
  //     },
  //   },
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Search up to the top 5 products based on vector search query.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Detailed user query for product search, preserving as much context as possible.',
          },
        },
      },
    },
  },
]

export const completion = async (messages: { role: 'system' | 'assistant' | 'user'; content: string }[]): Promise<Message> => {
  const systemPrompt = `You are a sales agent on an e-commerce platform, your job is to reply to customer queries just as a real life sales agent would.
    You will be given relevant info about the products and policies if and when required to be used to answer a query appropriately.
    you must try to reply within 120 words.

    please respond in plain text instead of markdown format.`

  const resp = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-0125',
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    tools,
    tool_choice: 'auto',
    max_tokens: 512,
  })

  const topChoice = resp.choices[0]
  if (topChoice?.finish_reason === 'tool_calls') {
    const topToolCall = topChoice.message.tool_calls?.[0]
    if (!topToolCall?.function) return { id: Math.random(), role: 'assistant', message: 'Something went wrong!' }

    console.log('Tool call: ', topToolCall)
    return (
      (await functions[topToolCall?.function.name]?.(JSON.parse(topToolCall?.function.arguments))) ?? {
        id: Math.random(),
        role: 'assistant',
        message: 'Something went wrong!',
      }
    )
  }
  if (topChoice?.finish_reason === 'stop') {
    return { id: Math.random(), role: 'assistant', message: topChoice.message.content! }
  }

  return { id: Math.random(), role: 'assistant', message: JSON.stringify(resp.choices[0]) }
}
