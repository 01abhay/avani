import React from 'react'

import style from './LoadingIndicator.module.css'

type LoadingIndicatorProps = {
  //
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = () => {
  return (
    <div className={style.container}>
      <div className={style.loader}></div>
    </div>
  )
}

export default LoadingIndicator
