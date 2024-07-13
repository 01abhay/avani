import React from 'react'
import { Mic, SendHorizontal } from 'lucide-react'

import style from './InputBar.module.css'

function InputBar() {
  return (
    <div className={style.container}>
      <div className={style.button}>
        <Mic />
      </div>
      <form className={style.form}>
        <input className={style.input} placeholder='Ask me anything about the store...' />
        <button className={style.button} type='submit'>
          <SendHorizontal />
        </button>
      </form>
    </div>
  )
}

export default InputBar
