import EventEmitter from 'events'

import { Detection }  from 'classes/Detection'

import { COLOR_BLACK, COLOR_WHITE } from 'utils/colors'

export default class extends EventEmitter {
  constructor () {
    super()

    this.element = document.createElement('div')
    this.element.className = 'background'

    document.body.appendChild(this.element)
  }

  onChange (pathname) {
    if (!Detection.isMixBlendModeUnsupported && pathname === 'about') {
      TweenMax.to(this.element, 0.5, {
        backgroundColor: COLOR_BLACK,
        color: COLOR_WHITE
      })
    } else {
      TweenMax.to(this.element, 0.5, {
        backgroundColor: COLOR_BLACK,
        color: COLOR_WHITE
      })
    }
  }
}
