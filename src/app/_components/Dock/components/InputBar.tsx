import React, { useEffect, useState } from 'react'
import { Mic, SendHorizontal } from 'lucide-react'
import clsx from 'clsx'

import { api } from '~/trpc/react'
import style from './InputBar.module.css'
import useChatStore from '../store'

function InputBar() {
  const addMessages = useChatStore(s => s.addMessages)
  const utils = api.useUtils()

  const [query, setQuery] = useState('')
  const [error, setError] = useState(false)
  useEffect(() => {
    let timerId: NodeJS.Timeout
    if (error) {
      timerId = setTimeout(() => {
        setError(false)
      }, 2400)
    }
    return () => {
      if (timerId) clearTimeout(timerId)
    }
  }, [error])

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()
    if (query.length > 160) return setError(true)

    addMessages([
      { id: Math.random(), role: 'user', message: query },
      { id: Math.random(), role: 'assistant', action: 'LOADING' },
    ])
    setQuery('')
    utils.ai.getAiResponse
      // .fetch({ message })
      .fetch(useChatStore.getState().messages.slice(-5, -1))
      .then(res => addMessages([res], true))
      .catch(() => addMessages([{ id: Math.random(), role: 'assistant', message: 'Something went wrong!' }], true))
  }

  return (
    <div className={clsx(style.container, error && style.errored)}>
      <div className={style.button}>
        <Mic />
      </div>
      <form className={style.form} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 12, flex: 1, width: '100%', alignItems: 'center' }}>
          <input
            className={style.input}
            style={{ flex: 1 }}
            name='message'
            placeholder='Ask me anything about the store...'
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div style={{ fontSize: 10, textAlign: 'right' }}>{query.length}/160</div>
        </div>
        <button className={style.button} type='submit'>
          <SendHorizontal />
        </button>
      </form>
    </div>
  )
}

export default InputBar
