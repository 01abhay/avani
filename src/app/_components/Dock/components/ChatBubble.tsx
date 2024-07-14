import React, { useEffect, useRef } from 'react'
import clsx from 'clsx'
import { Copy } from 'lucide-react'

import type { Message } from '~/server/types'
import useChatStore from '../store'
import style from './ChatBubble.module.css'
import ProductCard from './ProductCard'

function ChatBubble() {
  const messages = useChatStore(s => s.messages)

  return (
    <div className={style.container}>
      {messages.map((m, i, arr) => (
        <Bubble key={m.id} m={m} last={i === arr.length - 1} />
      ))}
    </div>
  )
}

export default ChatBubble

const Bubble = ({ m, last }: { m: Message; last: boolean }) => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (last) ref.current?.scrollIntoView()
  }, [last])

  return (
    <React.Fragment key={m.id}>
      <div ref={ref} />
      {(m.message ?? m.action === 'LOADING') && (
        <div className={clsx(style.bubble, m.role === 'user' ? style.left : style.right)}>
          {m.message ? m.message.replaceAll('**','') : ''}
          {m.action === 'LOADING' ? 'Loading...' : ''}
          <div className={style.time}>12:46 PM</div>
        </div>
      )}

      {m.action === 'SUGGEST_PRODUCTS' && (
        <div className={style.productsCarousel}>
          {m.actionData.products.map(p => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
      {m.action === 'DISPLAY_DISCOUNT_CODE' && (
        <div
          className={style.discountCode}
          onClick={() => {
            navigator.clipboard.writeText(m.actionData.code).catch(e => {
              console.log('Failed to copy text: ', e)
            })
          }}>
          {m.actionData.code} <Copy />
        </div>
      )}
    </React.Fragment>
  )
}
