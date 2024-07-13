import { create } from 'zustand'
import { type Message } from '~/server/types'

interface ChatState {
  messages: Message[]

  addMessages: (messages: Message[], popLatest?: boolean) => void
}

const useChatStore = create<ChatState>()(set => ({
  messages: [
    { id: Math.random(), role: 'assistant', message: 'Hey 👋' },
    { id: Math.random(), role: 'assistant', message: "I'm Avani, how can I help you?" },
  ] as const,
  addMessages: (messages, popLatest = false) =>
    set(state => {
      return { messages: [...(popLatest ? state.messages.slice(0, -1) : state.messages), ...messages] }
    }),
}))

export default useChatStore
