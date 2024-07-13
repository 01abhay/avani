/* eslint-disable @next/next/no-img-element */
import React from 'react'

import style from './ChatContainer.module.css'
import InputBar from './InputBar'
import LeftSidebar from './LeftSidebar'
import ChatBubble from './ChatBubble'

function ChatContainer() {
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
            <div className={style.suggestedPrompt}>Show Variants</div>
            <div className={style.suggestedPrompt}>Show Variants</div>
            <div className={style.suggestedPrompt}>Show Variants</div>
            <div className={style.suggestedPrompt}>Show Variants</div>
            <div className={style.suggestedPrompt}>Show Variants</div>
          </div>

          <InputBar />
        </div>
      </div>
    </div>
  )
}

export default ChatContainer
