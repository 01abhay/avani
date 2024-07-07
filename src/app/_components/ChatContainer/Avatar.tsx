'use client'

import React from 'react'
import { Avatar as RPMAvatar } from '@readyplayerme/visage'

function Avatar() {
  return (
    <div>
      <RPMAvatar
        modelSrc={'https://models.readyplayer.me/668a13a7c027310916a178e4.glb'}
        animationSrc={'https://readyplayerme.github.io/visage/female-idle.glb'}
        style={{ width: 240, objectFit: 'contain' }}
      />
    </div>
  )
}

export default Avatar
