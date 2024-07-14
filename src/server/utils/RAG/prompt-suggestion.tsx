import OpenAI from 'openai'

import { systemPrompt } from '../../constants/pilgrim'

const openai = new OpenAI()

type Functions = Record<string, (payload?: unknown) => Promise<unknown>>
const functions: Functions = {
  get_prompt_suggestions: async payload => (payload as { prompts: string[] }).prompts,
}

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_prompt_suggestions',
      description: 'Gets prompt suggestions array',
      parameters: {
        type: 'object',
        properties: {
          prompts: {
            type: 'array',
            items: {
              type: 'string',
              description:
                'generate suggestive prompts based on available store information and user queries that can be helpful for a user. keep them as short as possible & not exceeding 15 character in length.',
            },
          },
        },
      },
    },
  },
]

const getPromptSuggestions = async (messages: { role: 'system' | 'assistant' | 'user'; content: string }[]): Promise<string[]> => {
  const resp = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-0125',
    messages: [
      {
        role: 'system',
        content: `${systemPrompt}
      --- use this information when crating new prompt suggestion in future, specially categories.`,
      },
      ...messages,
    ],
    tools,
    tool_choice: 'required',
    max_tokens: 512,
  })

  const topChoice = resp.choices[0]
  if (topChoice?.message.tool_calls?.length) {
    const topToolCall = topChoice.message.tool_calls?.[0]
    if (!topToolCall?.function) return []
    const funcName = topToolCall?.function.name
    const payload = JSON.parse(topToolCall?.function.arguments) as Record<string, unknown>
    if (funcName) {
      return ((await functions[funcName]?.(payload)) as string[]) ?? []
    }
  }

  return []
}

export default getPromptSuggestions
