import React from 'react'
import { Mic, SendHorizontal } from 'lucide-react'

import { api } from '~/trpc/react'
import style from './InputBar.module.css'
import useChatStore from '../store'

function InputBar() {
  const addMessages = useChatStore(s => s.addMessages)
  const utils = api.useUtils()

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const message = data.get('message') as string
    addMessages([
      { id: Math.random(), role: 'user', message },
      { id: Math.random(), role: 'assistant', action: 'LOADING' },
    ])
    form.reset()
    utils.ai.getAiResponse
      .fetch({ message })
      .then(res => addMessages([res], true))
      .catch(() => addMessages([{ id: Math.random(), role: 'assistant', message: 'Something went wrong!' }], true))
  }

  return (
    <div className={style.container}>
      <div className={style.button}>
        <Mic />
      </div>
      <form className={style.form} onSubmit={handleSubmit}>
        <input className={style.input} name='message' placeholder='Ask me anything about the store...' />
        <button className={style.button} type='submit'>
          <SendHorizontal />
        </button>
      </form>
    </div>
  )
}

export default InputBar
