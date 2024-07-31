/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react'
import clsx from 'clsx'

import { api } from '~/trpc/react'
import style from './ChatContainer.module.css'
import InputBar from './InputBar'
import LeftSidebar from './LeftSidebar'
import ChatBubble, { GreetBubble } from './ChatBubble'
import useChatStore from '../store'
import DockControls, { type DockStates } from './DockControl'

function ChatContainer() {
  const [state, setState] = useState<DockStates>('CLOSED')

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
      .fetch(useChatStore.getState().messages.slice(-5, -1))
      .then(res => addMessages([res], true))
      .catch(() => addMessages([{ id: Math.random(), role: 'assistant', message: 'Something went wrong!' }], true))
  }

  return (
    <div
      className={clsx(style.container, state === 'CLOSED' && [style.closed, style.pointer], state === 'OPEN' && style.open)}
      onClick={() => state === 'CLOSED' && setState('OPEN')}>
      <DockControls value={state} onChange={state => setState(state)} />
      {state === 'CLOSED' && <GreetBubble />}

      <div className={style.main}>
        <div className={style.chats}>
          <div className={style.avatarContainer}>
            <div style={{ flex: 1 }} className={clsx(state === 'CLOSED' && style.hidden)}>
              <div className={style.title}>PureElegance®</div>
              <div className={style.subtitle}>Powered by Avani</div>
            </div>

            <img src='/assets/avatar.png' className={style.avatar} alt='avatar' />
          </div>
          <div className={clsx(style.chatsContainer, state === 'CLOSED' && style.hidden)}>
            <ChatBubble />
          </div>
        </div>
        <div className={clsx(style.inputBarContainer, state === 'CLOSED' && style.hidden)}>
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

      <div className={clsx(style.sidebar, ['CLOSED', 'OPEN'].includes(state) && style.hidden)}>
        <LeftSidebar />
      </div>
    </div>
  )
}

export default ChatContainer
