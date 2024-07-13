import React from 'react'
import { Compass } from 'lucide-react'

import style from './LeftSidebar.module.css'

function LeftSidebar() {
  return (
    <div>
      <div className={style.title}>Company Name</div>
      <div className={style.subtitle}>Powered by Avani</div>

      <div className={style.prompts}>
        <div className={style.prompt}>
          <Compass />
          <div>What’s new in the store?</div>
        </div>
        <div className={style.prompt}>
          <Compass />
          <div>What’s new in the store?</div>
        </div>
        <div className={style.prompt}>
          <Compass />
          <div>What’s new in the store?</div>
        </div>
        <div className={style.prompt}>
          <Compass />
          <div>What’s new in the store?</div>
        </div>
      </div>
    </div>
  )
}

export default LeftSidebar
