import React, { useEffect, useRef } from 'react'
import clsx from 'clsx'
import { Copy } from 'lucide-react'
import { motion } from 'framer-motion'

import type { Message } from '~/server/types'
import useChatStore from '../store'
import style from './ChatBubble.module.css'
import ProductCard from './ProductCard'
import LoadingIndicator from './LoadingIndicator'

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
        <motion.div
          initial={{ opacity: 0.4, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={clsx(style.bubble, m.role === 'user' ? style.right : style.left)}>
          {m.message ? m.message.replaceAll('**', '') : ''}
          {m.action === 'LOADING' ? <LoadingIndicator /> : ''}
          <div className={style.time}>{new Date().toLocaleString('en-IN', { hour: 'numeric', minute: 'numeric', hour12: true })}</div>
        </motion.div>
      )}

      {m.action === 'SUGGEST_PRODUCTS' && (
        <motion.div
          initial={{ opacity: 0.4, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={style.productsCarousel}>
          {m.actionData.products.map(p => (
            <ProductCard key={p.id} p={p} />
          ))}
        </motion.div>
      )}
      {m.action === 'DISPLAY_DISCOUNT_CODE' && (
        <motion.div
          initial={{ opacity: 0.4, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={style.discountCode}
          onClick={() => {
            navigator.clipboard.writeText(m.actionData.code).catch(e => {
              console.log('Failed to copy text: ', e)
            })
          }}>
          {m.actionData.code} <Copy />
        </motion.div>
      )}
    </React.Fragment>
  )
}

export const GreetBubble = () => {
  return (
    <motion.div
      initial={{ opacity: 0.4, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={clsx(style.bubble, style.greet)}>
      Hey! 👋
    </motion.div>
  )
}
