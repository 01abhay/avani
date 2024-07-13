import React from 'react'
import clsx from 'clsx'
import { Copy } from 'lucide-react'

import useChatStore from '../store'
import style from './ChatBubble.module.css'
import ProductCard from './ProductCard'

function ChatBubble() {
  const messages = useChatStore(s => s.messages)

  return (
    <div className={style.container}>
      {messages.map(m => (
        <React.Fragment key={m.id}>
          {(m.message ?? m.action === 'LOADING') && (
            <div className={clsx(style.bubble, m.role === 'user' ? style.left : style.right)}>
              {m.message ? m.message : ''}
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
      ))}
    </div>
  )
}

export default ChatBubble
