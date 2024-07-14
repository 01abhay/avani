'use client'
import React from 'react'
import { ShoppingCart } from 'lucide-react'

import style from './Header.module.css'
import usePageStore from './store'

function Header() {
  const count = usePageStore(s => s.bears)

  return (
    <div className={style.header}>
      <h3>Brand Name</h3>

      <div>
        <ShoppingCart />({count || 0})
      </div>
    </div>
  )
}

export default Header
