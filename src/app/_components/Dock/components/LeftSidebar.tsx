import React from 'react'
import { Award, BadgePercent, FileCheck2, PackageSearch } from 'lucide-react'

import style from './LeftSidebar.module.css'
import { api } from '~/trpc/react'
import useChatStore from '../store'

function LeftSidebar() {
  const utils = api.useUtils()
  const addMessages = useChatStore(s => s.addMessages)

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
    <div>
      <div className={style.title}>Company Name</div>
      <div className={style.subtitle}>Powered by Avani</div>

      <div className={style.prompts}>
        <div className={style.prompt} onClick={() => handleSubmit('Show your Bestsellers')}>
          <Award />
          <div>Show your Bestsellers</div>
        </div>
        <div className={style.prompt} onClick={() => handleSubmit('Are there any Offers?')}>
          <BadgePercent />
          <div>Are there any Offers?</div>
        </div>
        <div className={style.prompt} onClick={() => handleSubmit('How to use hair serum?')}>
          <PackageSearch />
          <div>How to use hair serum?</div>
        </div>
        <div className={style.prompt} onClick={() => handleSubmit('What is your Return Policy?')}>
          <FileCheck2 />
          <div>What is your Return Policy?</div>
        </div>
      </div>
    </div>
  )
}

export default LeftSidebar
