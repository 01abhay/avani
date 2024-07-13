/* eslint-disable @next/next/no-img-element */
import React from 'react'

import style from './ProductCard.module.css'

import { type ProductRowSelect } from '~/server/db/schema'

type Props = { p: Pick<ProductRowSelect, 'id' | 'name' | 'images' | 'price'> }
export function ProductCard({ p }: Props) {
  return (
    <div className={style.card}>
      <img className={style.image} src={p.images?.[0]} alt={p.name!} />
      <div className={style.content}>
        <div className={style.name}>{p.name}</div>
        <div className={style.price}>₹ {p.price}</div>
        <button className={style.button}>Add to cart</button>
      </div>
    </div>
  )
}

export default ProductCard
