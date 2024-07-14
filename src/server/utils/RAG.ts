import OpenAI from 'openai'

import { type Message } from '../types'
import { privacyPolicy, refundPolicy, shippingAndReturnPolicy, systemPrompt, termsAndConditions } from '../constants/pilgrim'
import { getProductsBasedOnSimilarityScore } from './db'
import { embeddings, completion as _completion } from './openai'
import getPromptSuggestions from './RAG/prompt-suggestion'

const openai = new OpenAI()

type Functions = Record<string, (payload?: unknown) => Promise<Message>>
const functions: Functions = {
  //   greeting: async () => ({ id: Math.random(), role: 'assistant', message: 'Hello from greeting intent!' }),
  search_products: async _payload => {
    const payload = _payload as { query: string; min_price?: number; max_price?: number; limit?: number }
    const _embeddings = await embeddings([payload.query])
    const embedding = _embeddings[0]!.embedding
    const _products = await getProductsBasedOnSimilarityScore(embedding, {
      minPrice: payload.min_price,
      maxPrice: payload.max_price,
      limit: payload.limit,
    })

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
  display_discount_code: async () => {
    return {
      id: Math.random(),
      role: 'assistant',
      message: 'We have a special code for you, enjoy your discount!',
      action: 'DISPLAY_DISCOUNT_CODE',
      actionData: { code: 'SPECIAL25' },
    }
  },
  get_shop_policies: async _payload => {
    const payload = _payload as {
      query: string
      policies: ('shippingAndReturnPolicy' | 'termsAndConditions' | 'privacyPolicy' | 'refundPolicy')[]
    }
    let content = ''
    if (payload?.policies.includes('shippingAndReturnPolicy')) content += shippingAndReturnPolicy
    if (payload?.policies.includes('termsAndConditions')) content += termsAndConditions
    if (payload?.policies.includes('privacyPolicy')) content += privacyPolicy
    if (payload?.policies.includes('refundPolicy')) content += refundPolicy

    const resp = await _completion([
      { role: 'user', content: payload.query },
      {
        role: 'system',
        content: `${content}

        ---- answer user query from above text content. if no relevant answer polity let user know, try to limit the response character length 480 or less. don't make up any new information try to answer from information you already have.`,
      },
    ])
    return { id: Math.random(), role: 'assistant', message: resp.choices[0]?.message.content ?? '' }
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
          min_price: {
            type: 'number',
            description: 'Minimum price for the product search.',
          },
          max_price: {
            type: 'number',
            description: 'Maximum price for the product search.',
          },
          limit: {
            type: 'number',
            description: 'number of products user wants to see. max 6.',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'display_discount_code',
      description: 'Displays discount code for the user.',
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_shop_policies',
      description:
        "Gets shop policies based on values in a JavaScript array of one or more of these values: 'shippingAndReturnPolicy', 'termsAndConditions', 'privacyPolicy', 'refundPolicy'.",
      parameters: {
        type: 'object',
        properties: {
          policies: {
            type: 'array',
            items: {
              type: 'string',
              description: "One or more of these values: 'shippingAndReturnPolicy', 'termsAndConditions', 'privacyPolicy', 'refundPolicy'.",
            },
          },
        },
      },
    },
  },
]

const ___completion = async (messages: { role: 'system' | 'assistant' | 'user'; content: string }[]): Promise<Message> => {
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
    if (!topToolCall?.function) return { id: Math.random(), role: 'assistant', message: 'Something went wrong! (Code: 11200)' }
    const funcName = topToolCall?.function.name
    const payload = JSON.parse(topToolCall?.function.arguments) as Record<string, unknown>
    if (funcName) {
      if (funcName === 'get_shop_policies') payload.query = messages.at(-1)?.content
      return (
        (await functions[funcName]?.(payload)) ?? { id: Math.random(), role: 'assistant', message: 'Something went wrong! (Code: 11201)' }
      )
    }
  }
  if (topChoice?.finish_reason === 'stop') {
    return { id: Math.random(), role: 'assistant', message: topChoice.message.content! }
  }

  return { id: Math.random(), role: 'assistant', message: JSON.stringify(resp.choices[0]) }
}

export const completion = async (messages: { role: 'system' | 'assistant' | 'user'; content: string }[]): Promise<Message> => {
  const resp = await ___completion(messages)

  const promptSuggestions = await getPromptSuggestions([
    { role: 'user', content: messages.at(-1)!.content },
    { role: 'assistant', content: resp.message! },
  ])
  return { ...resp, promptSuggestions }
}
