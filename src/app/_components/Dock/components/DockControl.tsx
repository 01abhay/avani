import React from 'react'

import style from './DockControl.module.css'
import clsx from 'clsx'
import { Minus, X, Maximize2 } from 'lucide-react'

export type DockStates = 'CLOSED' | 'OPEN' | 'MAXIMIZED'
type DockControlsProps = {
  value: DockStates
  onChange: (state: DockStates) => void
}

const DockControls: React.FC<DockControlsProps> = ({ value, onChange }) => {
  return (
    <div className={style.dockControls}>
      <div className={clsx(style.control, value === 'CLOSED' && style.disabled)} onClick={() => onChange('CLOSED')}>
        <X className={style.icon} size={8} />
      </div>
      <div className={clsx(style.control, value === 'OPEN' && style.disabled)} onClick={() => onChange('OPEN')}>
        <Minus className={style.icon} size={8} />
      </div>
      <div className={clsx(style.control, value === 'MAXIMIZED' && style.disabled)} onClick={() => onChange('MAXIMIZED')}>
        <Maximize2 className={style.icon} size={8} />
      </div>
    </div>
  )
}

export default DockControls
