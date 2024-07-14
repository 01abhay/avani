/* eslint-disable @next/next/no-img-element */
import React from 'react'

import { api } from '~/trpc/react'
import style from './ChatContainer.module.css'
import InputBar from './InputBar'
import LeftSidebar from './LeftSidebar'
import ChatBubble from './ChatBubble'
import useChatStore from '../store'

function ChatContainer() {
  const messages = useChatStore(s => s.messages)
  const addMessages = useChatStore(s => s.addMessages)
  const utils = api.useUtils()

  const handleSubmit = (m: string) => {
    addMessages([
      { id: Math.random(), role: 'user', message: m },
      { id: Math.random(), role: 'assistant', action: 'LOADING' },
    ])
    utils.ai.getAiResponse
      // .fetch({ message: m })
      .fetch(useChatStore.getState().messages.slice(-5))
      .then(res => addMessages([res], true))
      .catch(() => addMessages([{ id: Math.random(), role: 'assistant', message: 'Something went wrong!' }], true))
  }

  return (
    <div className={style.container}>
      <div>
        <LeftSidebar />
      </div>
      <div className={style.chats}>
        <div className={style.main}>
          <div className={style.chat}>
            <ChatBubble />
          </div>
          <div className={style.avatarContainer}>
            <img src='/assets/avatar.png' className={style.avatar} alt='avatar' />
          </div>
        </div>
        <div className={style.inputBarContainer}>
          <div className={style.suggestedPromptsContainer}>
            {messages.at(-1)?.promptSuggestions?.map(p => (
              <div key={p} className={style.suggestedPrompt} onClick={() => handleSubmit(p)}>
                {p}
              </div>
            ))}
          </div>

          <InputBar />
        </div>
      </div>
    </div>
  )
}

export default ChatContainer
