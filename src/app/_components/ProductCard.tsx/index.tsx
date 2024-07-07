import { useState } from 'react'

import { api } from '~/trpc/react'

import styles from './index.module.css'
import { ProductRowSelect } from '~/server/db/schema'

export function ProductCard({ p }: { p: ProductRowSelect }) {
  return (
    <div className={styles.card}>
      <img src={(p.images as string[])[0]} alt={p.name!} style={{ width: '100%' }} />
      <p>{p.name}</p>
      <p>{p.price}</p>
    </div>
  )
}
