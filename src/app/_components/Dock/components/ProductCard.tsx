/* eslint-disable @next/next/no-img-element */
import React from 'react'

import style from './ProductCard.module.css'
import { api } from '~/trpc/react'

import { type ProductRowSelect } from '~/server/db/schema'
import useChatStore from '../store'
import usePageStore from '../../Page/store'

type Props = { p: Pick<ProductRowSelect, 'id' | 'name' | 'images' | 'price'> }
export function ProductCard({ p }: Props) {
  const utils = api.useUtils()
  const addMessages = useChatStore(s => s.addMessages)
  const increase = usePageStore(s => s.increase)

  const handleSubmit = (id: string) => {
    addMessages([
      { id: Math.random(), role: 'user', action: 'ADD_TO_CART', actionData: { productId: id } },
      { id: Math.random(), role: 'assistant', action: 'LOADING' },
    ])
    utils.ai.getAiResponse
      // .fetch({ message: m })
      .fetch(useChatStore.getState().messages.slice(-5, -1))
      .then(res => {
        addMessages([res], true)
        increase(1)
      })
      .catch(() => addMessages([{ id: Math.random(), role: 'assistant', message: 'Something went wrong!' }], true))
  }

  return (
    <div className={style.card}>
      <img className={style.image} src={p.images?.[0]} alt={p.name!} />
      <div className={style.content}>
        <div className={style.name} title={p.name!}>
          {p.name}
        </div>
        <div className={style.price}>₹{p.price}</div>
        <button className={style.button} onClick={() => handleSubmit(p.id)}>
          Add to cart
        </button>
      </div>
    </div>
  )
}

export default ProductCard
