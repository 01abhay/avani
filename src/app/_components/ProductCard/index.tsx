/* eslint-disable @next/next/no-img-element */
// import { useState } from 'react'

// import { api } from '~/trpc/react'

import styles from './index.module.css'
import { type ProductRowSelect } from '~/server/db/schema'

type Props = { p: Pick<ProductRowSelect, 'id' | 'name' | 'images' | 'price' | 'rating'> }
export function ProductCard({ p }: Props) {
  return (
    <div className={styles.card}>
      <img src={p.images?.[0]} alt={p.name!} style={{ width: '100%' }} />
      <p>{p.name}</p>
      <p>₹ {p.price}</p>
    </div>
  )
}
