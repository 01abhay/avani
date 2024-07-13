import React from 'react'
import clsx from 'clsx'

import style from './ChatBubble.module.css'
import ProductCard from './ProductCard'

function ChatBubble() {
  return (
    <div className={style.container}>
      <div className={clsx(style.bubble, style.left)}>
        I’m looking for Bestselling Bags for women
        <div className={style.time}>12:46 PM</div>
      </div>
      <div className={clsx(style.bubble, style.right)}>
        Hey! Here are our Bestsellers, take a look 👇
        <div className={style.time}>12:46 PM</div>
      </div>
      <div className={style.productsCarousel}>
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
      </div>
    </div>
  )
}

export default ChatBubble
